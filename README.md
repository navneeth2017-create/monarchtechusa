# monarchtechusa

The Monarch marketing site and ozone sales assets.

## Pages

- `/` — home
- `/platform.html` — find, reach, close
- `/custom.html` — custom system layers
- `/process.html` — map, build, launch
- `/contact.html` — contact and note builder
- `/proposal.html` — two-page proposal with print views

## Assets

- `monarch-ozone-pitch.pdf` — one-page pitch
- `monarch-ozone-proposal.pdf` — pitch plus investment sheet

## Local preview

```bash
npm start
```

Then open `http://localhost:8080`.

## Railway

This repo is a standalone static site with a tiny Node server. Deploy it as its own Railway service:

1. New Project → Deploy from GitHub repo → `monarchtechusa`
2. Start command: `npm start`
3. No database, build step, or environment variables required
4. Add `monarchtechusa.com` and `www.monarchtechusa.com` as custom domains on this service

Keep the separate `monarch-backend` client platform service untouched. The marketing site can link to the client app later, but the two deployments stay separate.

## Note

The proposal PDFs include pricing. Do not publish this repo as a public site if that pricing should not be public.
