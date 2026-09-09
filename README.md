# Vera Willow

A single-page React website with an animated procedural silk-cloth background and a Coming Soon message.

## Requirements

- Node.js 18 or newer
- npm

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
├── components/SilkCloth/
├── App.jsx
├── App.css
└── index.css
```

`SilkCloth` renders the full-page animated background. Page content is rendered above it in `App.jsx`.

## Environment Variables

React Bits Pro installation uses a local license key when needed:

```env
REACTBITS_LICENSE_KEY=your-license-key
```

Store the real value in `.env.local`. Environment files containing secrets are ignored by Git. Use `.env.example` as a template.

## GitHub Pages

Build the site with `npm run build`, then deploy the generated `dist` directory through GitHub Actions. Do not commit `dist` or `node_modules`.