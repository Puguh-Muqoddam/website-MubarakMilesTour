"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Widget Cloudflare Turnstile (render eksplisit).
 * Widget menyisipkan input tersembunyi `cf-turnstile-response` ke dalam form;
 * token wajib diverifikasi ulang di server.
 */
export function Turnstile({
  siteKey,
  onToken,
  resetKey,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetKey: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const [ready, setReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );

  const render = useCallback(() => {
    if (!ref.current || !window.turnstile || idRef.current) return;
    idRef.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      language: "id",
      callback: (t: string) => onToken(t),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
    });
  }, [siteKey, onToken]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  useEffect(() => {
    if (resetKey > 0 && idRef.current && window.turnstile) {
      window.turnstile.reset(idRef.current);
      onToken(null);
    }
  }, [resetKey, onToken]);

  useEffect(
    () => () => {
      if (idRef.current && window.turnstile) {
        window.turnstile.remove(idRef.current);
      }
      idRef.current = null;
    },
    [],
  );

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
