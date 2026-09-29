import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * One entry point for every AI feature in the admin (translation, article
 * writer, FAQ generator, SEO suggestions, alt text). The provider/model comes
 * from the AiSettings row (Settings → AI), falling back to whichever API key
 * is present in the environment.
 */

export type AiProviderKey = "openai" | "gemini" | "anthropic";

export const DEFAULT_MODEL: Record<AiProviderKey, string> = {
  openai: "gpt-4o",
  gemini: "gemini-flash-latest",
  anthropic: "claude-opus-5",
};

const ENV_KEY: Record<AiProviderKey, string> = {
  openai: "OPENAI_API_KEY",
  gemini: "GOOGLE_AI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
};

export async function resolveAi(): Promise<{ provider: AiProviderKey; model: string }> {
  const settings = await prisma.aiSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    const provider = settings.provider.toLowerCase() as AiProviderKey;
    return { provider, model: settings.model || DEFAULT_MODEL[provider] };
  }
  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "gemini" || configured === "anthropic") {
    return { provider: configured, model: DEFAULT_MODEL[configured] };
  }
  for (const provider of ["anthropic", "gemini", "openai"] as const) {
    if (process.env[ENV_KEY[provider]]) return { provider, model: DEFAULT_MODEL[provider] };
  }
  throw new Error("ยังไม่ได้ตั้งค่า AI — ใส่ ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY หรือ OPENAI_API_KEY ใน .env");
}

function requireKey(provider: AiProviderKey): string {
  const key = process.env[ENV_KEY[provider]];
  if (!key) throw new Error(`${ENV_KEY[provider]} ยังไม่ได้ตั้งค่าใน .env`);
  return key;
}

type Prompt = { system: string; user: string; imageUrl?: string };

async function openAiJson(model: string, { system, user, imageUrl }: Prompt): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${requireKey("openai")}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: imageUrl
            ? [
                { type: "text", text: user },
                { type: "image_url", image_url: { url: imageUrl } },
              ]
            : user,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "{}";
}

async function geminiJson(model: string, { system, user, imageUrl }: Prompt): Promise<string> {
  const parts: object[] = [{ text: user }];
  if (imageUrl) {
    // Gemini only takes remote files it hosts, so inline the image bytes.
    const img = await fetch(imageUrl);
    if (!img.ok) throw new Error("โหลดรูปภาพไม่สำเร็จ");
    parts.unshift({
      inline_data: {
        mime_type: img.headers.get("content-type") ?? "image/jpeg",
        data: Buffer.from(await img.arrayBuffer()).toString("base64"),
      },
    });
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${requireKey("gemini")}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

async function anthropicJson<T>(model: string, { system, user, imageUrl }: Prompt, schema: z.ZodType<T>): Promise<T> {
  const client = new Anthropic({ apiKey: requireKey("anthropic") });
  const response = await client.beta.messages.parse({
    model,
    max_tokens: 16000,
    // Server-side fallback: if the model declines, the API retries on a
    // suitable fallback model inside the same call.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "image", source: { type: "url", url: imageUrl } },
              { type: "text", text: user },
            ]
          : user,
      },
    ],
    output_config: { format: betaZodOutputFormat(schema) },
  });
  if (response.stop_reason === "refusal") {
    throw new Error("AI ปฏิเสธคำขอนี้ กรุณาปรับเนื้อหาแล้วลองใหม่");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("ผลลัพธ์จาก AI ยาวเกินกำหนด กรุณาลดขนาดเนื้อหาแล้วลองใหม่");
  }
  if (response.parsed_output == null) throw new Error("AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง");
  return response.parsed_output as T;
}

/**
 * Ask the configured model for JSON matching `schema` (optionally about an image). Anthropic enforces the
 * schema server-side (structured outputs); OpenAI/Gemini run in JSON mode and
 * the result is validated here.
 */
export async function generateJson<T>(schema: z.ZodType<T>, prompt: Prompt): Promise<T> {
  const { provider, model } = await resolveAi();
  if (provider === "anthropic") return anthropicJson(model, prompt, schema);

  const text = provider === "gemini" ? await geminiJson(model, prompt) : await openAiJson(model, prompt);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("AI ตอบกลับในรูปแบบที่ไม่ใช่ JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new Error("AI ตอบกลับไม่ครบตามรูปแบบที่กำหนด");
  return parsed.data;
}
