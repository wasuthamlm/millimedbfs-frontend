import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function PromoBar() {
  return (
    <div className="bg-brand-navy">
      <Container className="flex flex-col items-center justify-between gap-3 py-3 sm:flex-row">
        <p className="text-sm italic text-white/90">&ldquo;Pass on Happiness&rdquo;</p>
        <div className="flex items-center gap-3">
          <Button href="/register" variant="gold">
            สมัครสมาชิก
          </Button>
          <Button href="/login" variant="outline">
            เข้าสู่ระบบ
          </Button>
        </div>
      </Container>
    </div>
  );
}
