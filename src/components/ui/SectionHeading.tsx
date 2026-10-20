import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  id,
  eyebrow,
  title,
  accent = true,
  tone = "light",
  align = "left",
  children,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  accent?: boolean;
  tone?: "light" | "dark";
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "";
  const accentAlign = align === "center" ? "mx-auto" : "";
  const accentColor = tone === "dark" ? "bg-gold" : "bg-gold-dark";

  return (
    <div className={`max-w-2xl ${alignCls}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={`mt-3 font-sans text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${
          tone === "dark" ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {accent && <div aria-hidden="true" className={`mt-4 h-1 w-14 rounded-full ${accentColor} ${accentAlign}`} />}
      {children && (
        <div className={`mt-4 text-base leading-relaxed sm:text-lg ${tone === "dark" ? "text-cream/90" : "text-muted"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
