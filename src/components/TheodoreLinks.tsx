// Theodore fork: links from the sidebar to Theodore's own pages (lib/theodore.ts).
import { Gauge, Home, Library, Sparkles } from "lucide-react";
import { IN_THEODORE, THEODORE_PAGES } from "../lib/theodore.ts";
import "./TheodoreLinks.css";

const ICONS: Record<string, typeof Home> = { "/": Home, "/hub": Sparkles, "/cpa": Gauge, "/vault": Library };

// Labels are Theodore's page names, the same in every language, so they are not t() strings.
export function TheodoreLinks() {
  if (!IN_THEODORE) return null;
  return <nav className="theodore-links" aria-label="Theodore">
    {THEODORE_PAGES.map(({ href, label }) => {
      const Icon = ICONS[href] ?? Home;
      return <a key={href} className="btn btn-ghost sidebar-footer-action theodore-link" href={href}><Icon aria-hidden="true" />{label}</a>;
    })}
  </nav>;
}
