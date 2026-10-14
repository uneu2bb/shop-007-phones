const STORAGE_KEY = 'shop007_data_v5';
const CART_KEY = 'shop007_cart_v1';
const PASS_KEY = 'shop007_admin_pass';
const DEFAULT_DATA = window.DEFAULT_DATA || { shopName: '007', logo: null, cover: null, whatsapp: '', facebook: '', instagram: '', categories: [], products: [] };
let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
let cart = [];
let currentCatId = 'all';
let searchQuery = '';
let editingProductId = null;
let adminUnlocked = false;
let frontDragId = null;

function getAdminPass() { return localStorage.getItem(PASS_KEY) || ''; }
function setAdminPass(p) { if (p) localStorage.setItem(PASS_KEY, p); else localStorage.removeItem(PASS_KEY); }

function loadCart() {
  try { const s = localStorage.getItem(CART_KEY); if (s) cart = JSON.parse(s) || []; } catch (e) { cart = []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.categories && parsed.categories.length > 0) data = parsed;
    } catch (e) {}
  }
  if (!data.categories) data.categories = DEFAULT_DATA.categories || [];
  if (!data.products) data.products = DEFAULT_DATA.products || [];
  if (data.whatsapp === undefined) data.whatsapp = '';
  if (data.facebook === undefined) data.facebook = '';
  if (data.instagram === undefined) data.instagram = '';
  if (DEFAULT_DATA.products) {
    const imgMap = {};
    DEFAULT_DATA.products.forEach(p => { if (p.image) imgMap[p.id] = p.image; });
    data.products.forEach(p => {
      if (!p.image && imgMap[p.id]) p.image = imgMap[p.id];
      if (p.hidden === undefined) p.hidden = false;
    });
  }
  data.categories.forEach(c => { if (c.hidden === undefined) c.hidden = false; });
  loadCart();
  renderSite();
  updatePassStatus();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

const SVG_WA = '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
const SVG_FB = '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
const SVG_IG = '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>';

function renderSocial() {
  const el = document.getElementById('socialLinks');
  el.innerHTML = '';
  if (data.whatsapp) {
    const a = document.createElement('a');
    a.className = 'social-btn wa';
    a.href = 'https://wa.me/' + String(data.whatsapp).replace(/[^0-9]/g, '');
    a.target = '_blank'; a.rel = 'noopener'; a.title = 'واتساب'; a.innerHTML = SVG_WA;
    el.appendChild(a);
  }
  if (data.facebook) {
    const a = document.createElement('a');
    a.className = 'social-btn fb';
    a.href = data.facebook; a.target = '_blank'; a.rel = 'noopener'; a.title = 'فيسبوك'; a.innerHTML = SVG_FB;
    el.appendChild(a);
  }
  if (data.instagram) {
    const a = document.createElement('a');
    a.className = 'social-btn ig';
    a.href = data.instagram; a.target = '_blank'; a.rel = 'noopener'; a.title = 'إنستغرام'; a.innerHTML = SVG_IG;
    el.appendChild(a);
  }
}

function renderSite() {
  const logoImg = document.getElementById('siteLogo');
  const logoPh = document.getElementById('logoPlaceholder');
  if (data.logo) { logoImg.src = data.logo; logoImg.style.display = 'block'; logoPh.style.display = 'none'; }
  else { logoImg.style.display = 'none'; logoPh.style.display = 'flex'; }
  document.getElementById('shopName').textContent = data.shopName || '007';
  document.getElementById('shopNameInput').value = data.shopName || '007';
  const coverImg = document.getElementById('coverImg');
  const coverPh = document.getElementById('coverPlaceholder');
  if (data.cover) { coverImg.src = data.cover; coverImg.style.display = 'block'; coverPh.style.display = 'none'; }
  else { coverImg.style.display = 'none'; coverPh.style.display = 'block'; }
  document.getElementById('previewLogo').src = data.logo || '';
  document.getElementById('previewCover').src = data.cover || '';
  document.getElementById('whatsappInput').value = data.whatsapp || '';
  document.getElementById('facebookInput').value = data.facebook || '';
  document.getElementById('instagramInput').value = data.instagram || '';

  const nav = document.getElementById('categoriesNav');
  nav.innerHTML = '';
  const visibleCats = data.categories.filter(c => !c.hidden);
  if (data.categories.length > 0) {
    const allBtn = document.createElement('button');
    allBtn.className = 'cat-btn' + (currentCatId === 'all' ? ' active' : '');
    allBtn.textContent = 'الكل'; allBtn.dataset.id = 'all';
    allBtn.onclick = () => filterProducts('all');
    nav.appendChild(allBtn);
    visibleCats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (currentCatId === cat.id ? ' active' : '');
      btn.textContent = cat.name; btn.dataset.id = cat.id;
      btn.onclick = () => filterProducts(cat.id);
      nav.appendChild(btn);
    });
  }
  document.body.classList.toggle('admin-mode', adminUnlocked);
  renderProducts();
  renderAdminLists();
  renderSocial();
  updateCartUI();
}

function filterProducts(catId) {
  currentCatId = catId;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const active = document.querySelector('.cat-btn[data-id="' + catId + '"]');
  if (active) active.classList.add('active');
  renderProducts();
}

function getFilteredProducts() {
  let products = data.products.filter(p => !p.hidden);
  if (currentCatId !== 'all') products = products.filter(p => p.categoryId === currentCatId);
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    products = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = data.categories.find(c => c.id === p.categoryId);
      return name.includes(q) || (cat && cat.name.toLowerCase().includes(q));
    });
  }
  return products;
}

function renderProducts() {
  const container = document.getElementById('productsContainer');
  const products = getFilteredProducts();
  if (products.length === 0) {
    const msg = searchQuery ? 'لا توجد نتائج لـ "' + escapeHtml(searchQuery) + '"' : 'لا توجد منتجات في هذا القسم';
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>' + msg + '</h3></div>';
    return;
  }
  container.innerHTML = '<div class="products-grid" id="productsGrid"></div>';
  const grid = document.getElementById('productsGrid');
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card' + (adminUnlocked ? ' sortable' : '');
    card.dataset.id = p.id;
    if (adminUnlocked) card.draggable = true;
    const imgHtml = p.image
      ? '<img class="product-img" src="' + p.image + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
      : '<div class="product-img placeholder">📱</div>';
    card.innerHTML = '<span class="reorder-hint">⠿ اسحب</span><div class="product-img-wrap">' + imgHtml + '</div><div class="product-body"><div class="product-name">' + escapeHtml(p.name) + '</div><div class="product-price"><div class="price-usd">$' + Number(p.priceUsd).toLocaleString() + '</div><div class="price-syp">' + Number(p.priceSyp).toLocaleString() + ' ل.س</div></div><button class="add-cart-btn">أضف إلى السلة</button></div>';
    card.querySelector('.add-cart-btn').onclick = (e) => { e.stopPropagation(); addToCart(p.id); };
    if (adminUnlocked) setupFrontDrag(card);
    grid.appendChild(card);
  });
}

function setupFrontDrag(card) {
  card.addEventListener('dragstart', (e) => {
    frontDragId = card.dataset.id;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('drag-over'));
    frontDragId = null;
  });
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (card.dataset.id !== frontDragId) card.classList.add('drag-over');
  });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (!frontDragId || frontDragId === card.dataset.id) return;
    const fromIdx = data.products.findIndex(p => p.id === frontDragId);
    const toIdx = data.products.findIndex(p => p.id === card.dataset.id);
    if (fromIdx < 0 || toIdx < 0) return;
    const [item] = data.products.splice(fromIdx, 1);
    data.products.splice(toIdx, 0, item);
    saveData();
    renderProducts();
    showToast('تم تغيير الترتيب');
  });
}

function addToCart(productId) {
  const p = data.products.find(x => x.id === productId);
  if (!p) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, name: p.name, priceUsd: p.priceUsd, priceSyp: p.priceSyp, image: p.image, qty: 1 });
  saveCart(); showToast('تمت الإضافة إلى السلة');
}
function setCartQty(productId, qty) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (qty <= 0) cart = cart.filter(i => i.id !== productId);
  else item.qty = qty;
  saveCart(); renderCartBody();
}
function updateCartUI() {
  document.getElementById('cartCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
}
function renderCartBody() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty"><div style="font-size:2.5rem">🛒</div><p>السلة فارغة</p></div>';
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  let totalUsd = 0, totalSyp = 0;
  body.innerHTML = '';
  cart.forEach(item => {
    totalUsd += item.priceUsd * item.qty;
    totalSyp += item.priceSyp * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    const thumb = item.image ? '<img src="' + item.image + '" alt="">' : '<div class="cart-thumb-ph" style="display:flex;align-items:center;justify-content:center">📱</div>';
    div.innerHTML = thumb + '<div class="cart-item-info"><strong>' + escapeHtml(item.name) + '</strong><small>$' + Number(item.priceUsd).toLocaleString() + ' · ' + Number(item.priceSyp).toLocaleString() + ' ل.س</small><div class="cart-qty"><button type="button" data-act="minus">−</button><span>' + item.qty + '</span><button type="button" data-act="plus">+</button></div></div><button class="btn btn-danger btn-sm" data-act="rm">حذف</button>';
    div.querySelector('[data-act="minus"]').onclick = () => setCartQty(item.id, item.qty - 1);
    div.querySelector('[data-act="plus"]').onclick = () => setCartQty(item.id, item.qty + 1);
    div.querySelector('[data-act="rm"]').onclick = () => setCartQty(item.id, 0);
    body.appendChild(div);
  });
  document.getElementById('cartTotalUsd').textContent = '$' + totalUsd.toLocaleString();
  document.getElementById('cartTotalSyp').textContent = totalSyp.toLocaleString() + ' ل.س';
}
document.getElementById('cartBtn').onclick = () => { renderCartBody(); document.getElementById('cartOverlay').classList.add('show'); };
document.getElementById('closeCart').onclick = () => document.getElementById('cartOverlay').classList.remove('show');
document.getElementById('cartOverlay').addEventListener('click', (e) => { if (e.target.id === 'cartOverlay') document.getElementById('cartOverlay').classList.remove('show'); });
document.getElementById('clearCartBtn').onclick = () => { cart = []; saveCart(); renderCartBody(); showToast('تم تفريغ السلة'); };
document.getElementById('checkoutBtn').onclick = () => {
  if (!cart.length) return;
  let msg = 'طلب من محل 007:%0A%0A';
  cart.forEach(i => { msg += '• ' + i.name + ' × ' + i.qty + ' — $' + (i.priceUsd * i.qty) + ' / ' + (i.priceSyp * i.qty).toLocaleString() + ' ل.س%0A'; });
  const totalUsd = cart.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const totalSyp = cart.reduce((s, i) => s + i.priceSyp * i.qty, 0);
  msg += '%0Aالمجموع: $' + totalUsd.toLocaleString() + ' / ' + totalSyp.toLocaleString() + ' ل.س';
  const phone = String(data.whatsapp || '').replace(/[^0-9]/g, '');
  if (phone) window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');
  else showToast('أضف رقم واتساب من لوحة التحكم أولاً');
};

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = searchInput.value; renderProducts(); }, 200);
  });
}

let clickCount = 0, clickTimer = null;
document.getElementById('shopName').addEventListener('click', () => {
  clickCount++;
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
  if (clickCount >= 5) { clickCount = 0; requestAdmin(); }
});

function requestAdmin() {
  const pass = getAdminPass();
  if (!pass) { openAdmin(); return; }
  document.getElementById('passwordInput').value = '';
  document.getElementById('passError').style.display = 'none';
  document.getElementById('passwordModal').classList.add('show');
  setTimeout(() => document.getElementById('passwordInput').focus(), 200);
}
function openAdmin() {
  adminUnlocked = true;
  document.getElementById('passwordModal').classList.remove('show');
  document.getElementById('adminModal').classList.add('show');
  document.body.classList.add('admin-mode');
  renderAdminLists();
  populateCategorySelect();
  renderProducts();
}
document.getElementById('passwordSubmit').onclick = () => {
  const entered = document.getElementById('passwordInput').value;
  if (entered === getAdminPass()) openAdmin();
  else {
    document.getElementById('passError').style.display = 'block';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
};
document.getElementById('passwordInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('passwordSubmit').click();
});
document.getElementById('passwordCancel').onclick = () => document.getElementById('passwordModal').classList.remove('show');
document.getElementById('passwordModal').addEventListener('click', (e) => {
  if (e.target.id === 'passwordModal') document.getElementById('passwordModal').classList.remove('show');
});

document.getElementById('closeModal').onclick = () => {
  document.getElementById('adminModal').classList.remove('show');
  adminUnlocked = false;
  document.body.classList.remove('admin-mode');
  renderProducts();
};
document.getElementById('adminModal').addEventListener('click', (e) => {
  if (e.target.id === 'adminModal') {
    document.getElementById('adminModal').classList.remove('show');
    adminUnlocked = false;
    document.body.classList.remove('admin-mode');
    renderProducts();
  }
});

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'products') populateCategorySelect();
  });
});

document.getElementById('addCategoryBtn').onclick = () => {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) return showToast('أدخل اسم القسم');
  data.categories.push({ id: Date.now().toString(), name, hidden: false });
  document.getElementById('newCategoryName').value = '';
  saveData(); renderSite(); showToast('تم إضافة القسم');
};

function renderAdminLists() {
  const catList = document.getElementById('categoriesList');
  catList.innerHTML = '';
  data.categories.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'admin-item' + (cat.hidden ? ' hidden-item' : '');
    li.draggable = true; li.dataset.id = cat.id; li.dataset.type = 'category';
    const hideLabel = cat.hidden ? 'إظهار' : 'إخفاء';
    li.innerHTML = '<span class="drag-handle">⠿</span><div class="item-info"><strong>' + escapeHtml(cat.name) + (cat.hidden ? ' (مخفي)' : '') + '</strong><small>' + data.products.filter(p => p.categoryId === cat.id).length + ' منتج</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button><button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button><button class="btn btn-danger btn-sm" data-act="del">حذف</button></div>';
    li.querySelector('[data-act="hide"]').onclick = () => { cat.hidden = !cat.hidden; saveData(); renderSite(); showToast(cat.hidden ? 'تم إخفاء القسم' : 'تم إظهار القسم'); };
    li.querySelector('[data-act="edit"]').onclick = () => editCategory(cat.id);
    li.querySelector('[data-act="del"]').onclick = () => deleteCategory(cat.id);
    setupDrag(li); catList.appendChild(li);
  });
  const prodList = document.getElementById('productsList');
  prodList.innerHTML = '';
  data.products.forEach(p => {
    const cat = data.categories.find(c => c.id === p.categoryId);
    const li = document.createElement('li');
    li.className = 'admin-item' + (p.hidden ? ' hidden-item' : '');
    li.draggable = true; li.dataset.id = p.id; li.dataset.type = 'product';
    const thumb = p.image ? '<img class="thumb" src="' + p.image + '">' : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">📱</div>';
    const hideLabel = p.hidden ? 'إظهار' : 'إخفاء';
    li.innerHTML = '<span class="drag-handle">⠿</span>' + thumb + '<div class="item-info"><strong>' + escapeHtml(p.name) + (p.hidden ? ' (مخفي)' : '') + '</strong><small>' + (cat ? cat.name : '—') + ' • $' + p.priceUsd + ' / ' + Number(p.priceSyp).toLocaleString() + ' ل.س</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button><button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button><button class="btn btn-danger btn-sm" data-act="del">حذف</button></div>';
    li.querySelector('[data-act="hide"]').onclick = () => { p.hidden = !p.hidden; saveData(); renderSite(); showToast(p.hidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج'); };
    li.querySelector('[data-act="edit"]').onclick = () => openEditProduct(p.id);
    li.querySelector('[data-act="del"]').onclick = () => deleteProduct(p.id);
    setupDrag(li); prodList.appendChild(li);
  });
}

function editCategory(id) {
  const cat = data.categories.find(c => c.id === id);
  if (!cat) return;
  const newName = prompt('اسم القسم الجديد:', cat.name);
  if (newName && newName.trim()) { cat.name = newName.trim(); saveData(); renderSite(); showToast('تم تعديل القسم'); }
}
function deleteCategory(id) {
  if (!confirm('حذف القسم وجميع منتجاته؟')) return;
  data.categories = data.categories.filter(c => c.id !== id);
  data.products = data.products.filter(p => p.categoryId !== id);
  saveData(); renderSite(); showToast('تم الحذف');
}
function populateCategorySelect() {
  const sel = document.getElementById('productCategory');
  sel.innerHTML = '';
  if (!data.categories.length) { sel.innerHTML = '<option value="">أضف قسماً أولاً</option>'; return; }
  data.categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name + (c.hidden ? ' (مخفي)' : '');
    sel.appendChild(opt);
  });
}

let productImageData = null;
function bindProductImgUpload() {
  const area = document.getElementById('productImgUpload');
  const input = document.getElementById('productImgInput');
  if (!area || !input) return;
  area.onclick = () => input.click();
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      productImageData = ev.target.result;
      area.innerHTML = '<img src="' + productImageData + '" style="max-width:140px;max-height:100px;border-radius:8px"><p style="margin-top:8px;color:var(--accent)">تم اختيار الصورة ✓</p><input type="file" id="productImgInput" accept="image/*" style="display:none">';
      bindProductImgUpload();
    };
    reader.readAsDataURL(file);
  };
}
bindProductImgUpload();

document.getElementById('addProductBtn').onclick = () => {
  const name = document.getElementById('productName').value.trim();
  const catId = document.getElementById('productCategory').value;
  const priceUsd = parseFloat(document.getElementById('productPriceUsd').value) || 0;
  const priceSyp = parseFloat(document.getElementById('productPriceSyp').value) || 0;
  if (!name) return showToast('أدخل اسم المنتج');
  if (!catId) return showToast('اختر قسماً أولاً');
  data.products.push({ id: Date.now().toString(), name, categoryId: catId, priceUsd, priceSyp, image: productImageData, hidden: false });
  document.getElementById('productName').value = '';
  document.getElementById('productPriceUsd').value = '';
  document.getElementById('productPriceSyp').value = '';
  productImageData = null;
  document.getElementById('productImgUpload').innerHTML = '<p>📷 رفع صورة</p><input type="file" id="productImgInput" accept="image/*" style="display:none">';
  bindProductImgUpload();
  saveData(); renderSite(); showToast('تم إضافة المنتج');
};

function openEditProduct(id) {
  const p = data.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('editProductName').value = p.name;
  document.getElementById('editProductUsd').value = p.priceUsd;
  document.getElementById('editProductSyp').value = p.priceSyp;
  document.getElementById('editProductModal').classList.add('show');
}
document.getElementById('saveEditProduct').onclick = () => {
  const p = data.products.find(x => x.id === editingProductId);
  if (!p) return;
  const name = document.getElementById('editProductName').value.trim();
  if (!name) return showToast('أدخل اسم المنتج');
  p.name = name;
  p.priceUsd = parseFloat(document.getElementById('editProductUsd').value) || 0;
  p.priceSyp = parseFloat(document.getElementById('editProductSyp').value) || 0;
  saveData(); renderSite();
  document.getElementById('editProductModal').classList.remove('show');
  showToast('تم حفظ التعديلات');
};
document.getElementById('closeEditProduct').onclick = document.getElementById('cancelEditProduct').onclick = () => {
  document.getElementById('editProductModal').classList.remove('show');
};
document.getElementById('editProductModal').addEventListener('click', (e) => {
  if (e.target.id === 'editProductModal') document.getElementById('editProductModal').classList.remove('show');
});

function deleteProduct(id) {
  if (!confirm('حذف هذا المنتج؟')) return;
  data.products = data.products.filter(p => p.id !== id);
  saveData(); renderSite(); showToast('تم الحذف');
}

let draggedItem = null;
function setupDrag(el) {
  el.addEventListener('dragstart', (e) => { draggedItem = el; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
  el.addEventListener('dragend', () => { el.classList.remove('dragging'); document.querySelectorAll('.admin-item').forEach(i => i.classList.remove('drag-over')); draggedItem = null; });
  el.addEventListener('dragover', (e) => { e.preventDefault(); if (el !== draggedItem) el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', (e) => {
    e.preventDefault(); el.classList.remove('drag-over');
    if (!draggedItem || draggedItem === el || draggedItem.dataset.type !== el.dataset.type) return;
    const list = el.parentElement;
    const items = [...list.children];
    const fromIdx = items.indexOf(draggedItem);
    const toIdx = items.indexOf(el);
    if (fromIdx < toIdx) list.insertBefore(draggedItem, el.nextSibling);
    else list.insertBefore(draggedItem, el);
    const newOrder = [...list.children].map(li => li.dataset.id);
    if (el.dataset.type === 'category') data.categories.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    else data.products.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    saveData(); renderSite(); showToast('تم تغيير الترتيب');
  });
}

document.getElementById('logoUpload').onclick = () => document.getElementById('logoInput').click();
document.getElementById('logoInput').onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { data.logo = ev.target.result; document.getElementById('previewLogo').src = data.logo; showToast('تم اختيار اللوجو'); };
  reader.readAsDataURL(file);
};
document.getElementById('coverUpload').onclick = () => document.getElementById('coverInput').click();
document.getElementById('coverInput').onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { data.cover = ev.target.result; document.getElementById('previewCover').src = data.cover; showToast('تم اختيار الغلاف'); };
  reader.readAsDataURL(file);
};
document.getElementById('deleteLogoBtn').onclick = () => { data.logo = null; document.getElementById('previewLogo').src = ''; saveData(); renderSite(); showToast('تم حذف اللوجو'); };
document.getElementById('deleteCoverBtn').onclick = () => { data.cover = null; document.getElementById('previewCover').src = ''; saveData(); renderSite(); showToast('تم حذف الغلاف'); };

function updatePassStatus() {
  const el = document.getElementById('passStatus');
  if (getAdminPass()) el.textContent = '✓ كلمة السر مفعّلة حالياً';
  else el.textContent = 'لا توجد كلمة سر — اللوحة مفتوحة بعد 5 ضغطات';
}
document.getElementById('savePassBtn').onclick = () => {
  const current = document.getElementById('currentPassInput').value;
  const neu = document.getElementById('newPassInput').value;
  const existing = getAdminPass();
  if (existing && current !== existing) return showToast('كلمة السر الحالية غير صحيحة');
  if (!neu) return showToast('أدخل كلمة سر جديدة');
  setAdminPass(neu);
  document.getElementById('currentPassInput').value = '';
  document.getElementById('newPassInput').value = '';
  updatePassStatus();
  showToast('تم حفظ كلمة السر');
};
document.getElementById('deletePassBtn').onclick = () => {
  const current = document.getElementById('currentPassInput').value;
  const existing = getAdminPass();
  if (existing && current !== existing) return showToast('أدخل كلمة السر الحالية أولاً');
  setAdminPass('');
  document.getElementById('currentPassInput').value = '';
  document.getElementById('newPassInput').value = '';
  updatePassStatus();
  showToast('تم حذف كلمة السر');
};

document.getElementById('saveSettingsBtn').onclick = () => {
  data.shopName = document.getElementById('shopNameInput').value.trim() || '007';
  data.whatsapp = document.getElementById('whatsappInput').value.trim();
  data.facebook = document.getElementById('facebookInput').value.trim();
  data.instagram = document.getElementById('instagramInput').value.trim();
  saveData(); renderSite(); showToast('تم حفظ الإعدادات');
};

loadData();
