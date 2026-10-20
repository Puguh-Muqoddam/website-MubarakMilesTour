import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "gold" | "secondary" | "outline" | "outline-light";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-emerald-deep text-cream hover:bg-emerald-mid shadow-sm",
  gold: "bg-gold text-ink hover:bg-gold-hover shadow-sm",
  secondary: "bg-sage-card text-cream hover:bg-emerald-mid",
  outline: "border-2 border-emerald-deep text-emerald-deep hover:bg-emerald-deep hover:text-cream",
  "outline-light": "border-2 border-cream/80 text-cream hover:bg-cream hover:text-emerald-deep",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-6 text-sm",
  lg: "min-h-12 px-8 text-sm sm:text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  external = false,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
}) {
  const cls = buttonClasses(variant, size, className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
