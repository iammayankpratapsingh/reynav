"use client";
// Authenticated navigation. Marks the current section and collapses into a drawer on small screens.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { signOutAction } from "@/app/(app)/actions";
import { switchLocationAction } from "@/app/(app)/locations-actions";
import type { AppShellCopy } from "@/frontend/copy/app-shell";
import type { LocationOption } from "@/shared/types/location";
import styles from "./app-sidebar.module.css";

type AppSidebarProps = {
  copy: AppShellCopy;
  account: { organizationName: string; locationLabel: string };
  locations: { options: LocationOption[]; activeId: string | null };
};

export function AppSidebar({ copy, account, locations }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSwitching, startSwitch] = useTransition();
  const navRef = useRef<HTMLElement>(null);

  // Keep the open section comfortably in view: an item near the bottom or top of the list scrolls toward
  // the middle, so the neighbours on both sides stay reachable. Only the list moves, never the page.
  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !current || nav.scrollHeight <= nav.clientHeight) return;
    // The list is the items' positioning parent, so offsetTop is already measured from its top.
    const target = current.offsetTop - (nav.clientHeight - current.offsetHeight) / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ top: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
  }, [pathname]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <div className={styles.mobileBar}>
        <span className={styles.mobileBrand}>{copy.brand}</span>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isOpen}
          aria-controls="app-nav"
          aria-label={isOpen ? copy.nav.closeMenu : copy.nav.openMenu}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X aria-hidden size={24} /> : <Menu aria-hidden size={24} />}
        </button>
      </div>

      <div id="app-nav" className={styles.sidebar} data-open={isOpen}>
        <Link href="/dashboard" className={styles.brand}>
          {copy.brand}
        </Link>

        {locations.options.length > 1 && (
          <label className={styles.locationPicker}>
            <span className={styles.locationLabel}>{isSwitching ? copy.location.switching : copy.location.label}</span>
            <select
              className={styles.locationSelect}
              value={locations.activeId ?? ""}
              disabled={isSwitching}
              onChange={(event) => {
                const next = event.target.value;
                startSwitch(async () => {
                  await switchLocationAction(next);
                  router.refresh();
                });
              }}
            >
              {locations.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <nav ref={navRef} aria-label={copy.nav.label} className={styles.nav}>
          {copy.nav.items.map((item) =>
            item.ready && item.href ? (
              <Link
                key={item.id}
                href={item.href}
                className={styles.item}
                aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.id} className={styles.itemDisabled} title={copy.nav.soonHint}>
                {item.label}
                <span className={styles.soon}>{copy.nav.soon}</span>
              </span>
            ),
          )}
        </nav>

        <div className={styles.account}>
          <p className={styles.accountName}>{account.organizationName}</p>
          <p className={styles.accountMeta}>{account.locationLabel}</p>
          <form action={signOutAction}>
            <button type="submit" className={styles.signOut}>
              <LogOut aria-hidden size={16} />
              {copy.account.signOut}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
