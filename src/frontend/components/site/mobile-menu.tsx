"use client";
// Collapsible navigation for small screens; closes on link click or Escape.
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { NavLink } from "@/shared/types/marketing";
import styles from "./site-header.module.css";

type MobileMenuProps = {
  links: readonly NavLink[];
  cta: NavLink;
  openLabel: string;
  closeLabel: string;
};

export function MobileMenu({ links, cta, openLabel, closeLabel }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className={styles.mobile}>
      <button
        type="button"
        className={styles.menuButton}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? closeLabel : openLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X aria-hidden size={26} /> : <Menu aria-hidden size={26} />}
      </button>

      {isOpen && (
        <nav id="mobile-menu" aria-label="Main" className={styles.mobilePanel}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={close}>
              {link.label}
            </Link>
          ))}
          <Link href={cta.href} className={styles.cta} onClick={close}>
            {cta.label}
          </Link>
        </nav>
      )}
    </div>
  );
}
