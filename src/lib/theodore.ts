// Theodore fork (github.com/hank-warren/theodore): this client can run inside Theodore, built with
// HERDR_WEB_BASE. Theodore then owns the installed app, this server's version (its pin) and the
// sections besides agents, which the sidebar links to.
declare const __THEODORE__: boolean | undefined;

export const IN_THEODORE = typeof __THEODORE__ !== "undefined" && __THEODORE__;

/** Theodore's own pages: full page loads, out of this client and back into Theodore's. */
export const THEODORE_PAGES: readonly { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/hub", label: "Hub" },
  { href: "/cpa", label: "CPA" },
  { href: "/vault", label: "Vault" },
];
