import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "outline";
  className?: string;
};

export function Button({ href, children, variant = "gold", className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors",
        variant === "gold" &&
          "bg-brand-gold text-brand-navy-dark hover:bg-brand-gold-dark",
        variant === "outline" &&
          "border border-white/70 text-white hover:bg-white/10",
        className
      )}
    >
      {children}
    </Link>
  );
}
