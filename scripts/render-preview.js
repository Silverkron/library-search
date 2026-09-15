const fs = require('fs');
const path = require('path');

function escapeHtml(value) {
  return String(value ?? '—').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

// Keep the useful, JavaScript-free preview aligned with each catalogue update.
function renderPreview() {
  const root = path.join(__dirname, '..', 'public');
  const books = JSON.parse(fs.readFileSync(path.join(root, 'books.json'), 'utf8'));
  const rows = books.slice(0, 10).map(book => '  <tr>' +
    ['id', 'title', 'author', 'year', 'publisher'].map(key => `<td>${escapeHtml(book[key])}</td>`).join('') +
    '</tr>').join('\n');
  for (const file of ['index.html', 'it/index.html']) {
    const target = path.join(root, file);
    const source = fs.readFileSync(target, 'utf8').replace(/(<span data-catalogue-count>)[\s\S]*?(<\/span>)/g, (_, open, close) => `${open}${books.length}${close}`);
    if (!source.includes('<tbody id="results-body">')) throw new Error(`Missing catalogue preview in ${file}`);
    fs.writeFileSync(target, source.replace(/(<tbody id="results-body">)[\s\S]*?(<\/tbody>)/,
      (_, open, close) => `${open}\n${rows}\n${close}`));
  }
  require('./render-discovery').renderDiscovery();
  console.log('Updated both static catalogue previews.');
}

if (require.main === module) renderPreview();
module.exports = { renderPreview, escapeHtml };
