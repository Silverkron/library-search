# Aci Sant'Antonio Library - Search System

A free and open-source search system for the Municipal Library of Aci Sant'Antonio (Sicily, Italy) catalog. Created to support the library in its mission of spreading culture and promoting reading.

## 🌟 Features

- 🔍 Full-text search across the entire catalog
- 📚 Specific search by title, author, year, and inventory number
- ⚡ Fast and responsive interface
- 📱 Mobile-friendly design
- 🔄 Automatic weekly catalog updates
- 🌐 Automatic deployment to GitHub Pages
- ♿ Optimized accessibility

## 🛠 Tech Stack

- Vanilla JavaScript (no frameworks)
- Shared local CSS with responsive layouts and system fonts
- Shared vanilla JavaScript search, with accent-insensitive matching
- SheetJS for Excel file processing
- GitHub Actions for automation and deployment

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Silverkron/library-search

# Enter directory
cd library-search

# Install dependencies
npm install

# Run locally
npm run serve
```

## 🔄 Update Pipeline

The system automatically updates every week following this process:

1. Downloads the new Excel file from the configured source
2. Converts the file to an optimized JSON
3. Creates a Pull Request with the new data
4. After approval, automatically updates the site

### Pipeline Configuration

1. Configure GitHub secrets:
   - `EXCEL_URL`: Catalog Excel file URL

2. Enable GitHub Pages:
   - Settings > Pages
   - Select `gh-pages` branch
   - Save configuration

### Manual Update

```bash
# Generate new JSON from Excel data
npm run transform

# Commit and push
git commit -am "update: library data"
git push origin main
```

## 📁 Project Structure

```
/
├── .github/workflows/    # Automation pipeline
├── file/                # Catalog Excel file
├── public/              # Static files and JSON
└── scripts/             # Transformation scripts
```

## 🤝 Contributing

Contributions are welcome! To improve the project:

1. Fork the repository
2. Create a branch for your changes
   ```bash
   git checkout -b feature/MyFeature
   ```
3. Commit your changes
   ```bash
   git commit -am 'feat: add a new feature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/MyFeature
   ```
5. Open a Pull Request

## 📄 License

This project is released under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgments

Special thanks to the Municipal Library of Aci Sant'Antonio for making this project possible and for their commitment to spreading culture in the community.

## 🔗 Useful Links
- [Live Demo](https://Silverkron.github.io/library-search)
- [Aci Sant'Antonio Library](https://www.comune.acisantantonio.ct.it/amministrazione/uffici/ufficio_19.html)

## 🏛 About the Library

The Municipal Library of Aci Sant'Antonio is located in Sicily, Italy. This project is part of their digital transformation initiative, aiming to make their catalog more accessible to the community and researchers worldwide.

---

Made with ❤️ for the Aci Sant'Antonio community

## Design, accessibility and technical SEO

The six Italian and English pages share `public/assets/site.css`. Catalogue behaviour
lives in `public/assets/catalogue.js`; no external CSS or search runtime is needed.
The interface includes labelled search fields, a skip link, visible keyboard focus,
announced result counts, native tables, keyboard-accessible horizontal scrolling,
loading failure recovery and a static catalogue preview when JavaScript is unavailable.

Canonical URLs and reciprocal language alternates retain the existing production URL
structure. JSON-LD describes the website and pages, with breadcrumbs on information
pages. The sitemap omits `lastmod` rather than reporting a stale date. Main content,
metadata and an initial catalogue sample are present in the HTML response.

```bash
npm run serve        # Preview checked-in data without downloading the source spreadsheet
npm run build:pages  # Refresh static previews from public/books.json, offline
npm test             # Link/metadata checks and bilingual search regressions
```

`npm run transform` still downloads the municipal catalogue and now refreshes both
HTML previews. Commit `public/books.json`, `public/index.html` and `public/it/index.html`
together when updating data. The scheduled update workflow includes all three files.

### Verification (15 September 2026)

- Lighthouse: accessibility 100 and SEO 100 on all six local pages (Italian catalogue
  on desktop; other pages on mobile).
- Browser checks: single-character queries, combined filters, numeric titles, no
  results, reset and pagination; 320px mobile layout without page-level overflow.
- `npm test`: local links, reciprocal hreflang, canonical/sitemap consistency,
  JSON-LD, safe preview escaping, failed fetch/retry and bilingual search behaviour.
- Library photograph: JPEG delivery asset approximately 571 KB instead of the 3.4 MB
  PNG source; explicit dimensions reserve its layout space.

Automated scores are not a full WCAG conformance audit or a guarantee of indexing.
The existing Google Maps embed can trigger third-party-cookie best-practice warnings.
Library hours and service information retain the existing project content.

One existing deployment issue remains: `deploy.yml` transforms data in a separate job,
but the deploy job checks out the repository again without downloading that job's output.
It therefore publishes the checked-in catalogue. The scheduled update workflow commits
catalogue changes separately; transferring artifacts between jobs would make this explicit.

Reference: [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
and [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages).

### AI crawler and agent discovery

- `/llms.txt`: source map, site identity, citation guidance and data limitations.
- `/llms-full.txt`: combined documentation for all six pages (not a dump of book records).
- `/*.md` and `/it/*.md`: readable versions generated from each page's main HTML content.
- HTML discovery: `rel="describedby"` links to `llms.txt`; Markdown alternates use
  `rel="alternate" type="text/markdown"`.
- Catalogue pages expose a `Dataset` with an `application/json` download and a visible
  data explanation. The FAQ record count comes from `books.json`.
- `robots.txt` retains open access for all crawlers, including AI crawlers. No proprietary
  directives or changes to training access are introduced.
- The sitemap is generated from canonical/hreflang HTML metadata and includes reciprocal
  language links. Only canonical HTML pages are listed.

Edit HTML content, then run `npm run build:pages` to regenerate discovery documents;
`npm run transform` also performs this step. Commit the generated Markdown, LLM files
and sitemap with content changes. The scheduled catalogue workflow includes them.
`npm test` checks these resources, their links and the catalogue's structured data.

The [llms.txt proposal](https://llmstxt.org/) is an additional discovery convention,
not an indexing guarantee. [Google's AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)
still relies on crawlable content and established SEO practices. Hosting/CDN-level bot
restrictions and production indexing need verification after deployment.

### Editorial tone and municipal identity

Italian and English pages use descriptive headings and service-oriented wording.
The site identifies itself as an open-source support project, separate from the
Municipality's institutional portal. Page introductions and social metadata use
consistent wording. Markdown and LLM documents are regenerated from the revised HTML.

The header displays the municipal coat of arms supplied for this project:
[original PNG](https://www.comune.acisantantonio.ct.it/immagini/img-1270--60-1270-0-0-8d59af5122d8b727396f3c60c466286c.png).
The local asset preserves its original 83 × 110 proportions and includes alternative
text in both languages. It is an institutional identifier, not an original project logo;
no separate licence for the coat of arms is asserted here.
