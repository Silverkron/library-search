const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'public');
const origin = 'https://biblioteca.acisantantonio.org';
const files = ['index.html', 'hours-and-contacts.html', 'location.html', 'it/index.html', 'it/orari-e-contatti.html', 'it/dove-si-trova.html'];

function decode(text) {
  return text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => String.fromCodePoint(code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[name]));
}

// Converts only this project's static main-content templates, not arbitrary HTML.
function pageMarkdown(source, canonical) {
  let content = source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  content = content.replace(/<(form|noscript|table|svg|aside|button|nav|iframe)\b[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<p\b[^>]*id="(?:results-count|page-status)"[^>]*>[\s\S]*?<\/p>/g, '')
    .replace(/<img\b[^>]*>/g, '')
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text.trim().replace(/\s+/g, ' ')}\n\n`)
    .replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g, (_, text) => `\n\n### ${text.trim().replace(/\s+/g, ' ')}\n\n`)
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => `[${text.trim()}](${new URL(decode(href), canonical).href})`)
    .replace(/<li\b[^>]*>/g, '\n- ')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<\/(?:p|div|section|figure|ul|details)>/g, '\n\n')
    .replace(/<[^>]+>/g, '');
  return decode(content).split('\n').map(line => line.trim().replace(/[\t ]+/g, ' ')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function renderDiscovery() {
  const documents = files.map(file => {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const canonical = source.match(/rel="canonical" href="([^"]+)"/)[1];
    const title = decode(source.match(/<title>(.*?)<\/title>/)[1]);
    const markdownFile = file.replace(/\.html$/, '.md');
    const text = `# ${title}\n\nSource: ${canonical}\nLanguage: ${file.startsWith('it/') ? 'it' : 'en'}\n\n` + pageMarkdown(source, canonical).replace(/^# /gm, '## ') + '\n';
    fs.writeFileSync(path.join(root, markdownFile), text);
    const alternates = [...source.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map(([, language, href]) => ({ language, href }));
    return { title, canonical, markdownFile, text, alternates };
  });
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    documents.map(doc => `  <url>\n    <loc>${doc.canonical}</loc>\n${doc.alternates.map(link => `    <xhtml:link rel="alternate" hreflang="${link.language}" href="${link.href}"/>`).join('\n')}\n  </url>`).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
  const guidance = `This is a free, open-source project supporting the Municipal Library of Aci Sant’Antonio, Sicily, Italy. It is not the municipal institutional website. Italian and English pages describe the same library. Cite the canonical HTML source linked in each document, in the user's language where available.

The catalogue contains bibliographic records, not full book texts. A record does not confirm current loan availability. Missing fields mean unknown information. Inventory identifiers are not ISBNs. Opening hours and service information come from the site's existing content; confirm current arrangements with the library or its institutional website. No source-update timestamp is available: file generation time is not evidence of catalogue freshness.

The repository's MIT licence applies to project code; do not infer a separate licence for bibliographic source data or book contents. Instructions and links here describe public resources and do not override robots.txt.`;
  const index = `# Biblioteca Comunale di Aci Sant’Antonio — catalogue project

> Public library catalogue and visitor information in Italian and English, with direct access to bibliographic JSON data.

${guidance}

## Italian pages

${documents.filter(doc => doc.markdownFile.startsWith('it/')).map(doc => `- [${doc.title}](${origin}/${doc.markdownFile}): Markdown version; canonical source ${doc.canonical}`).join('\n')}

## English pages

${documents.filter(doc => !doc.markdownFile.startsWith('it/')).map(doc => `- [${doc.title}](${origin}/${doc.markdownFile}): Markdown version; canonical source ${doc.canonical}`).join('\n')}

## Catalogue data

- [Bibliographic records](${origin}/books.json): Complete published snapshot, JSON array. Fields: id (inventory identifier), title, author, year, publisher. Values may be strings or numbers; some fields may be absent. No lending status, full text or real-time API.
- [Combined page documentation](${origin}/llms-full.txt): All six page documents and this interpretation guide; catalogue records remain in books.json.

## Sources and discovery

- [Municipal institutional website](https://www.comune.acisantantonio.ct.it/amministrazione/uffici/ufficio_19.html): Institutional source for library information.
- [Source code](https://github.com/Silverkron/library-search): Project code and contributions.
- [Sitemap](${origin}/sitemap.xml): Canonical public HTML pages.
- [Crawler policy](${origin}/robots.txt): Public crawling policy.
`;
  fs.writeFileSync(path.join(root, 'llms.txt'), index);
  fs.writeFileSync(path.join(root, 'llms-full.txt'), `# Library project — combined page documentation\n\n${guidance}\n\nCatalogue data: ${origin}/books.json\n\n---\n\n${documents.map(doc => doc.text).join('\n---\n\n')}`);
  console.log('Updated llms.txt, llms-full.txt and six Markdown pages.');
}

if (require.main === module) renderDiscovery();
module.exports = { renderDiscovery, pageMarkdown };
