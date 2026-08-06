import { languageName } from "@/lib/translation-locales";
import { prisma } from "@/lib/prisma";

function buildSystemPrompt(targetLang: string) {
  const name = languageName(targetLang);
  return `You are a professional translator. Translate the given Thai content to ${name}.
Rules:
- Preserve any HTML tags exactly as they appear
- Keep brand names and proper nouns in their original form
- Write natural, direct, factual language
- For Chinese use Simplified Chinese; for Korean/Japanese use a formal/polite register
Return ONLY a valid JSON object with exactly the same keys as the input. No markdown, no preamble.`;
}

function buildUserPrompt(locale: string, fields: Record<string, string>) {
  return `Thai source fields (JSON):\n${JSON.stringify(fields, null, 2)}\n\nTranslate every field's value to ${languageName(locale)}. Return a JSON object with exactly the same keys.`;
}

async function translateWithOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "{}";
}

async function translateWithGemini(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini error: ${await res.text()}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
}

const DEFAULT_MODEL: Record<"openai" | "gemini", string> = {
  openai: "gpt-4o",
  gemini: "gemini-flash-latest",
};

// The admin-configured AiSettings row (Settings → AI Settings tab) wins when present;
// otherwise falls back to env vars so the feature keeps working without any DB row.
async function resolveProvider(): Promise<{ provider: "openai" | "gemini"; model: string }> {
  const settings = await prisma.aiSettings.findUnique({ where: { id: "singleton" } });
  if (settings) {
    const provider = settings.provider === "OPENAI" ? "openai" : "gemini";
    return { provider, model: settings.model || DEFAULT_MODEL[provider] };
  }

  const configured = process.env.AI_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "gemini") {
    return { provider: configured, model: DEFAULT_MODEL[configured] };
  }
  if (process.env.GOOGLE_AI_API_KEY) return { provider: "gemini", model: DEFAULT_MODEL.gemini };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", model: DEFAULT_MODEL.openai };
  throw new Error("No AI provider configured — set OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env");
}

export async function translateFields(
  locale: string,
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const { provider, model } = await resolveProvider();
  const systemPrompt = buildSystemPrompt(locale);
  const userPrompt = buildUserPrompt(locale, fields);

  let text: string;
  if (provider === "gemini") {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
    text = await translateWithGemini(apiKey, model, systemPrompt, userPrompt);
  } else {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
    text = await translateWithOpenAI(apiKey, model, systemPrompt, userPrompt);
  }

  return JSON.parse(text);
}
