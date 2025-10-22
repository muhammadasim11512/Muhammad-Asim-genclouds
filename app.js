// Minimal local-storage-backed app. Safe, client-only, works without a server.

const STORAGE_KEY = 'laptopstore.items.v2';

// seed with example items on first open
function seedIfEmpty() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const seed = [
    { id: 1, brand: 'Acer', model: 'Swift 3', price: 84500, cpu: 'Ryzen 5 4500U', ram: '8GB', storage: '512GB SSD', description:'Lightweight and great battery life', image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80' },
    { id: 2, brand: 'Dell', model: 'Inspiron 15', price: 109900, cpu: 'Intel i5-1135G7', ram: '8GB', storage: '1TB HDD', description:'Reliable office laptop', image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80' },
    { id: 3, brand: 'Lenovo', model: 'IdeaPad 3', price: 72000, cpu: 'Intel i3-1005G1', ram: '4GB', storage: '256GB SSD', description:'Affordable daily driver', image:'https://images.unsplash.com/photo-1587825140708-0b8a6f7d8f7f?w=1200&q=80' }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
}

function allItems() {
  seedIfEmpty();
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function createItem(payload) {
  const items = allItems();
  const id = (items.reduce((m, x) => Math.max(m, x.id||0), 0) || 0) + 1;
  const item = Object.assign({ id }, payload);
  items.push(item);
  saveAll(items);
  return item;
}

function getItem(id) {
  const items = allItems();
  return items.find(x => x.id === id);
}

function updateItem(id, payload) {
  const items = allItems();
  const i = items.findIndex(x => x.id === id);
  if (i === -1) return null;
  items[i] = Object.assign({}, items[i], payload, { id });
  saveAll(items);
  return items[i];
}

function deleteItem(id) {
  const items = allItems().filter(x => x.id !== id);
  saveAll(items);
}

// helpers used by pages
function escapeHtml(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// render list (index.html)
function renderList() {
  seedIfEmpty();
  const items = allItems().slice().sort((a,b)=>b.id-a.id);
  const list = document.getElementById('list');
  if (!list) return;
  list.innerHTML = '';
  for (const it of items) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<div class="ribbon"></div>';
    const img = document.createElement('img');
    img.src = it.image || 'https://picsum.photos/seed/laptop'+it.id+'/800/600';
    img.alt = it.brand + ' ' + it.model;
    card.appendChild(img);
    const h = document.createElement('h3');
    h.textContent = it.brand + ' ' + it.model;
    card.appendChild(h);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = 'Local curated price';
    card.appendChild(meta);
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = 'Rs ' + Number(it.price).toLocaleString();
    card.appendChild(price);
    const actions = document.createElement('div');
    actions.className = 'actions';
    const view = document.createElement('a');
    view.className = 'btn';
    view.href = 'detail.html?id=' + it.id;
    view.textContent = 'View';
    actions.appendChild(view);
    const edit = document.createElement('a');
    edit.className = 'btn secondary';
    edit.href = 'add.html?id=' + it.id;
    edit.textContent = 'Edit';
    actions.appendChild(edit);
    const del = document.createElement('button');
    del.className = 'btn secondary';
    del.textContent = 'Delete';
    del.onclick = () => {
      if (!confirm('Delete this laptop?')) return;
      deleteItem(it.id);
      renderList();
    };
    actions.appendChild(del);
    card.appendChild(actions);
    list.appendChild(card);
  }
  if (items.length === 0) list.innerHTML = '<p class="small">No laptops yet. Add one.</p>';
}

// expose functions to pages
window.getItem = getItem;
window.createItem = createItem;
window.updateItem = updateItem;
window.deleteItem = deleteItem;
window.renderList = renderList;
window.escapeHtml = escapeHtml;
