import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Container className="flex flex-col items-center gap-8 py-16 sm:py-24">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">เข้าสู่ระบบ</h1>
      <LoginForm />
    </Container>
  );
}
