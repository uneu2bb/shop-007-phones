const STORAGE_KEY = 'shop007_data_v4';
const CART_KEY = 'shop007_cart_v1';
const DEFAULT_DATA = window.DEFAULT_DATA || { shopName: '007', logo: null, cover: null, whatsapp: '', facebook: '', instagram: '', categories: [], products: [] };
let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
let cart = [];
let currentCatId = 'all';
let searchQuery = '';

function loadCart() {
  try {
    const s = localStorage.getItem(CART_KEY);
    if (s) cart = JSON.parse(s) || [];
  } catch (e) { cart = []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

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
}

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

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
  if (visibleCats.length > 0 || data.categories.length > 0) {
    const allBtn = document.createElement('button');
    allBtn.className = 'cat-btn' + (currentCatId === 'all' ? ' active' : '');
    allBtn.textContent = 'الكل';
    allBtn.dataset.id = 'all';
    allBtn.onclick = () => filterProducts('all');
    nav.appendChild(allBtn);
    visibleCats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (currentCatId === cat.id ? ' active' : '');
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.onclick = () => filterProducts(cat.id);
      nav.appendChild(btn);
    });
  }

  renderProducts();
  renderAdminLists();
  renderSocial();
  updateCartUI();
}

function renderSocial() {
  const el = document.getElementById('socialLinks');
  el.innerHTML = '';
  if (data.whatsapp) {
    const a = document.createElement('a');
    a.href = 'https://wa.me/' + String(data.whatsapp).replace(/[^0-9]/g, '');
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'واتساب';
    a.innerHTML = '💬';
    el.appendChild(a);
  }
  if (data.facebook) {
    const a = document.createElement('a');
    a.href = data.facebook;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'فيسبوك';
    a.innerHTML = '📘';
    el.appendChild(a);
  }
  if (data.instagram) {
    const a = document.createElement('a');
    a.href = data.instagram;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'إنستغرام';
    a.innerHTML = '📸';
    el.appendChild(a);
  }
}

function filterProducts(catId) {
  currentCatId = catId;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const active = document.querySelector(`.cat-btn[data-id="${catId}"]`);
  if (active) active.classList.add('active');
  renderProducts();
}

function getFilteredProducts() {
  let products = data.products.filter(p => !p.hidden);
  if (currentCatId !== 'all') {
    products = products.filter(p => p.categoryId === currentCatId);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    products = products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = data.categories.find(c => c.id === p.categoryId);
      const catName = cat ? cat.name.toLowerCase() : '';
      return name.includes(q) || catName.includes(q);
    });
  }
  return products;
}

function renderProducts() {
  const container = document.getElementById('productsContainer');
  const products = getFilteredProducts();
  if (products.length === 0) {
    const msg = searchQuery
      ? `لا توجد نتائج لـ "${escapeHtml(searchQuery)}"`
      : 'لا توجد منتجات في هذا القسم';
    container.innerHTML = `<div class="empty-state"><div style="font-size:3rem;margin-bottom:1rem;">🔍</div><h3>${msg}</h3></div>`;
    return;
  }
  container.innerHTML = '<div class="products-grid" id="productsGrid"></div>';
  const grid = document.getElementById('productsGrid');
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const imgHtml = p.image
      ? `<img class="product-img" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">`
      : `<div class="product-img placeholder">📱</div>`;
    card.innerHTML = `<div class="product-img-wrap">${imgHtml}</div><div class="product-body"><div class="product-name">${escapeHtml(p.name)}</div><div class="product-price"><div class="price-usd">$${Number(p.priceUsd).toLocaleString()}</div><div class="price-syp">${Number(p.priceSyp).toLocaleString()} ل.س</div></div><button class="add-cart-btn" data-id="${p.id}">أضف إلى السلة</button></div>`;
    card.querySelector('.add-cart-btn').onclick = (e) => { e.stopPropagation(); addToCart(p.id); };
    grid.appendChild(card);
  });
}

function addToCart(productId) {
  const p = data.products.find(x => x.id === productId);
  if (!p) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, name: p.name, priceUsd: p.priceUsd, priceSyp: p.priceSyp, image: p.image, qty: 1 });
  saveCart();
  showToast('تمت الإضافة إلى السلة');
}

function setCartQty(productId, qty) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (qty <= 0) cart = cart.filter(i => i.id !== productId);
  else item.qty = qty;
  saveCart();
  renderCartBody();
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

function renderCartBody() {
  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');
  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty"><div style="font-size:2.5rem;">🛒</div><p>السلة فارغة</p></div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = 'block';
  let totalUsd = 0, totalSyp = 0;
  body.innerHTML = '';
  cart.forEach(item => {
    totalUsd += item.priceUsd * item.qty;
    totalSyp += item.priceSyp * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    const thumb = item.image
      ? `<img src="${item.image}" alt="">`
      : `<div class="cart-thumb-ph" style="display:flex;align-items:center;justify-content:center;">📱</div>`;
    div.innerHTML = `${thumb}<div class="cart-item-info"><strong>${escapeHtml(item.name)}</strong><small>$${Number(item.priceUsd).toLocaleString()} · ${Number(item.priceSyp).toLocaleString()} ل.س</small><div class="cart-qty"><button type="button" data-act="minus">−</button><span>${item.qty}</span><button type="button" data-act="plus">+</button></div></div><button class="btn btn-danger btn-sm" data-act="rm">حذف</button>`;
    div.querySelector('[data-act="minus"]').onclick = () => setCartQty(item.id, item.qty - 1);
    div.querySelector('[data-act="plus"]').onclick = () => setCartQty(item.id, item.qty + 1);
    div.querySelector('[data-act="rm"]').onclick = () => setCartQty(item.id, 0);
    body.appendChild(div);
  });
  document.getElementById('cartTotalUsd').textContent = '$' + totalUsd.toLocaleString();
  document.getElementById('cartTotalSyp').textContent = totalSyp.toLocaleString() + ' ل.س';
}

function openCart() {
  renderCartBody();
  document.getElementById('cartOverlay').classList.add('show');
}
function closeCart() {
  document.getElementById('cartOverlay').classList.remove('show');
}

document.getElementById('cartBtn').onclick = openCart;
document.getElementById('closeCart').onclick = closeCart;
document.getElementById('cartOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('cartOverlay')) closeCart();
});
document.getElementById('clearCartBtn').onclick = () => {
  cart = [];
  saveCart();
  renderCartBody();
  showToast('تم تفريغ السلة');
};
document.getElementById('checkoutBtn').onclick = () => {
  if (cart.length === 0) return;
  let msg = 'طلب من محل 007:%0A%0A';
  cart.forEach(i => {
    msg += `• ${i.name} × ${i.qty} — $${i.priceUsd * i.qty} / ${(i.priceSyp * i.qty).toLocaleString()} ل.س%0A`;
  });
  const totalUsd = cart.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const totalSyp = cart.reduce((s, i) => s + i.priceSyp * i.qty, 0);
  msg += `%0Aالمجموع: $${totalUsd.toLocaleString()} / ${totalSyp.toLocaleString()} ل.س`;
  const phone = String(data.whatsapp || '').replace(/[^0-9]/g, '');
  if (phone) {
    window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');
  } else {
    showToast('أضف رقم واتساب من لوحة التحكم أولاً');
  }
};

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value;
      renderProducts();
    }, 200);
  });
}

let clickCount = 0, clickTimer = null;
document.getElementById('shopName').addEventListener('click', () => {
  clickCount++;
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
  if (clickCount >= 5) { clickCount = 0; openAdmin(); }
});

function openAdmin() {
  document.getElementById('adminModal').classList.add('show');
  renderAdminLists();
  populateCategorySelect();
}
document.getElementById('closeModal').onclick = () => document.getElementById('adminModal').classList.remove('show');
document.getElementById('adminModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('adminModal')) document.getElementById('adminModal').classList.remove('show');
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
  data.categories.forEach((cat) => {
    const li = document.createElement('li');
    li.className = 'admin-item' + (cat.hidden ? ' hidden-item' : '');
    li.draggable = true; li.dataset.id = cat.id; li.dataset.type = 'category';
    const hideLabel = cat.hidden ? 'إظهار' : 'إخفاء';
    li.innerHTML = `<span class="drag-handle">⠿</span><div class="item-info"><strong>${escapeHtml(cat.name)}${cat.hidden ? ' (مخفي)' : ''}</strong><small>${data.products.filter(p => p.categoryId === cat.id).length} منتج</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" data-act="hide">${hideLabel}</button><button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button><button class="btn btn-danger btn-sm" data-act="del">حذف</button></div>`;
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
    const thumb = p.image ? `<img class="thumb" src="${p.image}">` : `<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">📱</div>`;
    const hideLabel = p.hidden ? 'إظهار' : 'إخفاء';
    li.innerHTML = `<span class="drag-handle">⠿</span>${thumb}<div class="item-info"><strong>${escapeHtml(p.name)}${p.hidden ? ' (مخفي)' : ''}</strong><small>${cat ? cat.name : '—'} • $${p.priceUsd} / ${Number(p.priceSyp).toLocaleString()} ل.س</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" data-act="hide">${hideLabel}</button><button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button><button class="btn btn-danger btn-sm" data-act="del">حذف</button></div>`;
    li.querySelector('[data-act="hide"]').onclick = () => { p.hidden = !p.hidden; saveData(); renderSite(); showToast(p.hidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج'); };
    li.querySelector('[data-act="edit"]').onclick = () => editProduct(p.id);
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
  if (data.categories.length === 0) { sel.innerHTML = '<option value="">أضف قسماً أولاً</option>'; return; }
  data.categories.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name + (c.hidden ? ' (مخفي)' : ''); sel.appendChild(opt); });
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
      area.innerHTML = `<img src="${productImageData}" style="max-width:140px;max-height:100px;border-radius:8px;"><p style="margin-top:8px;color:var(--accent);">تم اختيار الصورة ✓</p><input type="file" id="productImgInput" accept="image/*" style="display:none;">`;
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
  document.getElementById('productImgUpload').innerHTML = `<p>📷 رفع صورة</p><input type="file" id="productImgInput" accept="image/*" style="display:none;">`;
  bindProductImgUpload();
  saveData(); renderSite(); showToast('تم إضافة المنتج');
};

function editProduct(id) {
  const p = data.products.find(x => x.id === id); if (!p) return;
  const newName = prompt('اسم المنتج:', p.name); if (newName === null) return;
  const newUsd = prompt('السعر بالدولار:', p.priceUsd); if (newUsd === null) return;
  const newSyp = prompt('السعر بالليرة:', p.priceSyp); if (newSyp === null) return;
  p.name = newName.trim() || p.name;
  p.priceUsd = parseFloat(newUsd) || 0;
  p.priceSyp = parseFloat(newSyp) || 0;
  saveData(); renderSite(); showToast('تم التعديل');
}
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
    if (!draggedItem || draggedItem === el) return;
    if (draggedItem.dataset.type !== el.dataset.type) return;
    const list = el.parentElement;
    const items = [...list.children];
    const fromIdx = items.indexOf(draggedItem);
    const toIdx = items.indexOf(el);
    if (fromIdx < toIdx) list.insertBefore(draggedItem, el.nextSibling);
    else list.insertBefore(draggedItem, el);
    if (el.dataset.type === 'category') {
      const newOrder = [...list.children].map(li => li.dataset.id);
      data.categories.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    } else {
      const newOrder = [...list.children].map(li => li.dataset.id);
      data.products.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
    }
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
document.getElementById('deleteLogoBtn').onclick = () => {
  data.logo = null;
  document.getElementById('previewLogo').src = '';
  saveData(); renderSite(); showToast('تم حذف اللوجو');
};
document.getElementById('deleteCoverBtn').onclick = () => {
  data.cover = null;
  document.getElementById('previewCover').src = '';
  saveData(); renderSite(); showToast('تم حذف الغلاف');
};
document.getElementById('saveSettingsBtn').onclick = () => {
  data.shopName = document.getElementById('shopNameInput').value.trim() || '007';
  data.whatsapp = document.getElementById('whatsappInput').value.trim();
  data.facebook = document.getElementById('facebookInput').value.trim();
  data.instagram = document.getElementById('instagramInput').value.trim();
  saveData(); renderSite(); showToast('تم حفظ الإعدادات');
};

loadData();
