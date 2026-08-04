import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "สมัครสมาชิก",
};

export default function RegisterPage() {
  return (
    <Container className="flex flex-col items-center gap-8 py-16 sm:py-24">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">สมัครสมาชิก</h1>
      <RegisterForm />
    </Container>
  );
}
