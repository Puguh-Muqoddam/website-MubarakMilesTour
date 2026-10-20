export function PhotoPlaceholder({
  label,
  tone = "light",
  className = "",
}: {
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const bg =
    tone === "dark"
      ? "bg-gradient-to-br from-emerald-mid to-emerald-deep border border-cream/15"
      : "bg-gradient-to-br from-sand to-cream border border-line";
  const badgeCls =
    tone === "dark"
      ? "bg-cream/90 text-emerald-deep"
      : "bg-emerald-deep/90 text-cream";

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl p-4 text-center ${bg} ${className}`}
    >
      <span className={`text-sm font-medium ${tone === "dark" ? "text-cream/80" : "text-muted"}`}>{label}</span>
      <span className={`absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeCls}`}>
        Dokumentasi Menyusul
      </span>
    </div>
  );
}
