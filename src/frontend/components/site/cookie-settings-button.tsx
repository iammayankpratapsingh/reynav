"use client";
// Footer link that reopens cookie settings, so visitors can change or withdraw consent at any time.
import { openCookieSettings } from "@/frontend/hooks/use-cookie-consent";

export function CookieSettingsButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={openCookieSettings}>
      {label}
    </button>
  );
}
