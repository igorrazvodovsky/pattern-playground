// tldraw needs a domain-scoped licence key to run in production
// (https://tldraw.dev/installation#License). Without a valid one it renders the
// editor for five seconds and then blanks it, so this is not cosmetic — see
// docs/quality/dev-environment.md. localhost is exempt, which is why the demos
// work in dev with nothing set.
//
// Both client bundles that mount an editor read the key from here: the pattern
// site (Astro exposes `PUBLIC_`-prefixed vars natively) and the Storybook static
// build (its `viteFinal` adds `PUBLIC_` to Vite's `envPrefix`). tldraw's own
// LicenseProvider probes this same name on `import.meta.env`.
//
// Undefined rather than '' when unset — an empty string parses as an invalid
// key, which reports differently from an absent one.
export const tldrawLicenseKey: string | undefined =
	import.meta.env.PUBLIC_TLDRAW_LICENSE_KEY || undefined
