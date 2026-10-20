import type { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "light",
  as: Tag = "p",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  as?: "p" | "span";
}) {
  const color = tone === "dark" ? "text-gold" : "text-gold-dark";
  return (
    <Tag className={`text-xs font-bold uppercase tracking-[0.2em] sm:text-sm ${color}`}>{children}</Tag>
  );
}
