/* Shared catalogue behaviour; no third-party scripts or HTML interpolation. */
(() => {
  'use strict';
  const it = document.documentElement.lang === 'it';
  const get = id => document.getElementById(id);
  const form = get('search-form');
  const inputs = ['fulltext-search', 'year-search', 'id-search'].map(get);
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  let books = [];
  let filtered = [];
  let page = 1;
  let timer;
  const pageSize = 10;

  function render(moveFocus = false) {
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, pages);
    const fragment = document.createDocumentFragment();
    filtered.slice((page - 1) * pageSize, page * pageSize).forEach(book => {
      const row = document.createElement('tr');
      ['id', 'title', 'author', 'year', 'publisher'].forEach(key => {
        const cell = document.createElement('td');
        cell.textContent = book[key] || '—';
        row.append(cell);
      });
      fragment.append(row);
    });
    if (!filtered.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = it ? 'Nessun risultato. Modificare i termini di ricerca o azzerare i filtri.' : 'No results. Change the search terms or clear the filters.';
      row.append(cell);
      fragment.append(row);
    }
    get('results-body').replaceChildren(fragment);
    const count = filtered.length.toLocaleString(it ? 'it-IT' : 'en-GB');
    const pageText = it ? `Pagina ${page} di ${pages}` : `Page ${page} of ${pages}`;
    get('results-count').textContent = `${count} ${it ? (filtered.length === 1 ? 'libro trovato' : 'libri trovati') : (filtered.length === 1 ? 'book found' : 'books found')} · ${pageText}`;
    get('page-status').textContent = pageText;
    get('prev-page').disabled = page === 1;
    get('next-page').disabled = page >= pages;
    get('pagination').hidden = !filtered.length;
    if (moveFocus) get('results-heading').focus();
  }

  function search() {
    const query = normalize(inputs[0].value);
    const terms = query.split(/\s+/).filter(Boolean);
    const compactQuery = query.replace(/\s+/g, '');
    const year = inputs[1].value.trim();
    const inventory = inputs[2].value.trim();
    filtered = books.filter(book =>
      (!terms.length || terms.every(term => book.searchText.includes(term)) || book.compactText.includes(compactQuery)) &&
      (!year || String(book.year ?? '') === year) &&
      (!inventory || String(book.id) === inventory)
    );
    page = 1;
    render();
  }

  async function load() {
    get('retry').hidden = true;
    get('results-count').textContent = it ? 'Caricamento catalogo…' : 'Loading catalogue…';
    try {
      const response = await fetch(form.dataset.source);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data) || !data.length || !data.every(book => book && book.id != null && ['string', 'number'].includes(typeof book.title))) {
        throw new Error('Invalid catalogue');
      }
      books = data.map(book => {
        const searchText = normalize(`${book.title} ${book.author ?? ''} ${book.publisher ?? ''}`);
        return { ...book, searchText, compactText: searchText.replace(/\s+/g, '') };
      });
      get('search-fields').disabled = false;
      search();
    } catch (error) {
      get('results-count').textContent = it ? 'Impossibile caricare il catalogo. È visibile solo un’anteprima; riprova.' : 'Unable to load the catalogue. Only a preview is shown; please retry.';
      get('retry').hidden = false;
      console.error('Catalogue loading failed:', error);
    }
  }

  form.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(search, 200);
  });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
  form.addEventListener('reset', () => {
    clearTimeout(timer);
    inputs.forEach(input => { input.value = ''; });
    search();
    inputs[0].focus();
  });
  get('prev-page').addEventListener('click', () => { if (page > 1) { page--; render(true); } });
  get('next-page').addEventListener('click', () => { if (page * pageSize < filtered.length) { page++; render(true); } });
  get('retry').addEventListener('click', load);
  load();
})();
