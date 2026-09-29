import type { Metadata } from "next";
import type { Prisma } from "@/lib/generated/prisma/client";
import { MessagesClient } from "@/components/admin/messages/MessagesClient";
import { prisma } from "@/lib/prisma";
import { getAdminRole } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";

export const metadata: Metadata = { title: "ข้อความติดต่อ" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const filter = sp.filter === "unread" || sp.filter === "archived" ? sp.filter : "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ContactMessageWhereInput = {
    ...(filter === "unread" ? { status: "NEW" } : filter === "archived" ? { status: "ARCHIVED" } : { status: { not: "ARCHIVED" } }),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [role, messages, total, unread] = await Promise.all([
    getAdminRole(),
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  return (
    <MessagesClient
      messages={messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        subject: m.subject,
        body: m.body,
        status: m.status,
        customFields:
          m.customFields && typeof m.customFields === "object" && !Array.isArray(m.customFields)
            ? Object.fromEntries(Object.entries(m.customFields).map(([k, v]) => [k, String(v ?? "")]))
            : {},
        createdAt: m.createdAt.toISOString(),
      }))}
      unread={unread}
      filter={filter}
      q={q}
      page={page}
      totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
      canDelete={canDo(role, "contact.delete")}
    />
  );
}
