"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { NAV_ITEMS, SITE } from "@/lib/site";
import { buttonClasses } from "@/components/ui/Button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-cream/15 bg-emerald-deep/95 text-cream backdrop-blur-md supports-[backdrop-filter]:bg-emerald-deep/90">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
      >
        Lewati ke konten utama
      </a>
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-site items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8"
      >
        <Link
          href="/#beranda"
          className="group flex items-center gap-3 text-cream transition-opacity hover:opacity-95"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-emerald-mid text-gold shadow-xs transition-transform group-hover:scale-105 sm:h-11 sm:w-11"
          >
            <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-base leading-tight font-extrabold tracking-tight text-cream sm:text-lg">
              {SITE.name}
            </span>
            <span className="font-serif text-xs tracking-wide text-gold italic">
              Wisata Religi Rombongan B2B
            </span>
          </div>
        </Link>

        <ul className="hidden items-center gap-1 rounded-full border border-cream/15 bg-emerald-mid/70 px-2 py-1 xl:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-cream/90 transition-colors duration-200 hover:bg-gold hover:text-ink"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <Link
            href="/#pemesanan"
            className={buttonClasses("gold", "md", "max-sm:hidden")}
          >
            Ajukan Penawaran
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-emerald-mid xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">
              {open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            </span>
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        id="menu-mobile"
        ref={menuRef}
        hidden={!open}
        className="border-t border-cream/15 bg-emerald-deep xl:hidden"
      >
        <ul className="mx-auto flex max-w-site flex-col divide-y divide-cream/10 px-4 py-3 sm:px-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-cream hover:text-gold"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4 pb-2 sm:hidden">
            <Link
              href="/#pemesanan"
              onClick={() => setOpen(false)}
              className={buttonClasses("gold", "md", "w-full")}
            >
              Ajukan Penawaran Rombongan
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
