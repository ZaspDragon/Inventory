# Inventory Fix & Find Log – Auto Report (v3)

Offline-first web app to record warehouse inventory problems you **find** and how you **fix** them — now with an **auto-report** feature.

## What’s New
- **Auto-download a report every 12 entries** (12, 24, 36, …).
- **Generate Report Now** button creates an HTML report of the latest 12 entries you can email or print to PDF.
- Live **Report Preview** panel showing the latest 12 entries.

## Features
- Local-only (saved in your browser via localStorage)
- Dropdowns for Problem & Action with “Other” write-ins
- Name field
- Search, delete, export CSV
- Report download as a standalone **.html** (works as email attachment; or open and print to PDF)

## Use
1. Open `index.html` locally or via GitHub Pages.
2. Fill Name, Date, Location. Select Problem & Action (or use Other) and Notes.
3. Add entries. Every time your total hits 12, a report auto-downloads.
4. Use **Generate Report Now** for an on-demand report of the latest 12.

## Deploy on GitHub Pages
1. Create a public repo and add these files.
2. Repo → **Settings** → **Pages** → Source: `main` / root.
3. Open your site at: `https://<your-username>.github.io/inventory-log/`
