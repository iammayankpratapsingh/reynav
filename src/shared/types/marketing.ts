// Content the public landing page needs, resolved server-side.
import type { VerticalImage, VerticalLabels } from "./vertical";

export type LandingContent = {
  labels: VerticalLabels;
  heroImage: VerticalImage;
};

export type NavLink = {
  href: string;
  label: string;
};

export type CtaBandCopy = {
  heading: string;
  body: string;
  primaryCta: NavLink;
  secondaryCta: NavLink;
};
