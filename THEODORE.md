# The `theodore` branch

This branch is herdr web ui's client as [Theodore](https://github.com/hank-warren/theodore)
serves it at `/herdr/`, next to Theodore's own pages. Theodore proxies `/herdr/api/` and
`/herdr/ws` to the herdr web ui server installed on the same PC, which stays upstream's own.
Client and server share one protocol, so this branch and that install run the same release
(Theodore's `herdr-ui/PIN` names both).

## What differs from upstream

The changes are as small as they can be, so that syncing stays a rebase. They are marked
`Theodore fork` in the code. Every one of them is inert in a build without `HERDR_WEB_BASE`.

- `vite.config.ts`: with `HERDR_WEB_BASE=/herdr/`, the client's root-relative `/api/`, `/icons/`
  and `/ws` URLs are rewritten at build time. The page links Theodore's manifest. `pwa.ts`
  (the service worker) is left out, because Theodore owns the installed app.
- `src/lib/theodore.ts` and `src/components/TheodoreLinks.tsx`: Theodore's pages, linked
  from the sidebar footer.
- The update line, Settings' update controls and Install app are hidden. Theodore's pin
  updates the server and this client together.
- `src/lib/viewport.ts`: the page is pinned to the top only once the soft keyboard is
  confirmed. A missed guess otherwise left the composer under the iPhone keyboard. This one
  is worth offering upstream.

## Syncing to a new release

```bash
git fetch upstream --tags
git rebase --onto vX.Y.Z vOLD theodore   # replay the changes on the new release
HERDR_WEB_BASE=/herdr/ bun run build && bun run typecheck && bun run test:unit
```

Then update `herdr-ui/PIN` in Theodore, and update the PC's herdr web ui install to `vX.Y.Z`
in the same deploy.
