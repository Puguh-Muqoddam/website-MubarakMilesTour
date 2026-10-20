"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "fade";
}

/**
 * Komponen wrapper animasi scroll reveal menggunakan IntersectionObserver native browser
 * agar performa 60fps tanpa beban library eksternal berat.
 */
export function AnimateIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseStyle = {
    transitionDuration: "750ms",
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const transformClass =
    direction === "up"
      ? isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-6"
      : isVisible
        ? "opacity-100"
        : "opacity-0";

  return (
    <div
      ref={ref}
      style={baseStyle}
      className={`transition-all will-change-[opacity,transform] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none ${transformClass} ${className}`}
    >
      {children}
    </div>
  );
}
