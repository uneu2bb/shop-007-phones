function renderSocial() {
  const el = document.getElementById('socialLinks');
  el.innerHTML = '';
  if (data.whatsapp) {
    const a = document.createElement('a'); a.className = 'social-btn wa';
    a.href = 'https://wa.me/' + String(data.whatsapp).replace(/[^0-9]/g, '');
    a.target = '_blank'; a.rel = 'noopener'; a.title = 'واتساب'; a.innerHTML = SVG_WA; el.appendChild(a);
  }
  if (data.facebook) {
    const a = document.createElement('a'); a.className = 'social-btn fb';
    a.href = data.facebook; a.target = '_blank'; a.rel = 'noopener'; a.title = 'فيسبوك'; a.innerHTML = SVG_FB; el.appendChild(a);
  }
  if (data.instagram) {
    const a = document.createElement('a'); a.className = 'social-btn ig';
    a.href = data.instagram; a.target = '_blank'; a.rel = 'noopener'; a.title = 'إنستغرام'; a.innerHTML = SVG_IG; el.appendChild(a);
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
  updatePassStatus();
  const nav = document.getElementById('categoriesNav');
  nav.innerHTML = '';
  const visibleCats = data.categories.filter(c => !c.hidden);
  if (data.categories.length > 0) {
    const allBtn = document.createElement('button');
    allBtn.className = 'cat-btn' + (currentCatId === 'all' ? ' active' : '');
    allBtn.textContent = 'الكل'; allBtn.dataset.id = 'all';
    allBtn.onclick = () => filterProducts('all'); nav.appendChild(allBtn);
    visibleCats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (currentCatId === cat.id ? ' active' : '');
      btn.textContent = cat.name; btn.dataset.id = cat.id;
      btn.onclick = () => filterProducts(cat.id); nav.appendChild(btn);
    });
  }
  document.body.classList.toggle('admin-mode', adminUnlocked);
  renderProducts(); renderAdminLists(); renderSocial(); updateCartUI();
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
    const imgHtml = p.image ? '<img class="product-img" src="' + p.image + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' : '<div class="product-img placeholder">📱</div>';
    card.innerHTML = '<span class="reorder-hint">⠿ اسحب</span><div class="product-img-wrap">' + imgHtml + '</div><div class="product-body"><div class="product-name">' + escapeHtml(p.name) + '</div><div class="product-price"><div class="price-usd">$' + Number(p.priceUsd).toLocaleString() + '</div><div class="price-syp">' + Number(p.priceSyp).toLocaleString() + ' ل.س</div></div><button class="add-cart-btn">أضف إلى السلة</button></div>';
    card.querySelector('.add-cart-btn').onclick = (e) => { e.stopPropagation(); addToCart(p.id); };
    if (adminUnlocked) setupFrontDrag(card);
    grid.appendChild(card);
  });
}
function setupFrontDrag(card) {
  card.addEventListener('dragstart', (e) => { frontDragId = card.dataset.id; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
  card.addEventListener('dragend', () => { card.classList.remove('dragging'); document.querySelectorAll('.product-card').forEach(c => c.classList.remove('drag-over')); frontDragId = null; });
  card.addEventListener('dragover', (e) => { e.preventDefault(); if (card.dataset.id !== frontDragId) card.classList.add('drag-over'); });
  card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
  card.addEventListener('drop', async (e) => {
    e.preventDefault(); card.classList.remove('drag-over');
    if (!frontDragId || frontDragId === card.dataset.id) return;
    const fromIdx = data.products.findIndex(p => p.id === frontDragId);
    const toIdx = data.products.findIndex(p => p.id === card.dataset.id);
    if (fromIdx < 0 || toIdx < 0) return;
    const [item] = data.products.splice(fromIdx, 1);
    data.products.splice(toIdx, 0, item);
    renderProducts(); await saveProductOrder(); showToast('تم حفظ الترتيب أونلاين');
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
  if (qty <= 0) cart = cart.filter(i => i.id !== productId); else item.qty = qty;
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
  let totalUsd = 0, totalSyp = 0; body.innerHTML = '';
  cart.forEach(item => {
    totalUsd += item.priceUsd * item.qty; totalSyp += item.priceSyp * item.qty;
    const div = document.createElement('div'); div.className = 'cart-item';
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
  if (!data.adminPassword) { openAdmin(); return; }
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
  renderAdminLists(); populateCategorySelect(); renderProducts();
}
document.getElementById('passwordSubmit').onclick = () => {
  if (document.getElementById('passwordInput').value === data.adminPassword) openAdmin();
  else {
    document.getElementById('passError').style.display = 'block';
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordInput').focus();
  }
};
document.getElementById('passwordInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('passwordSubmit').click(); });
document.getElementById('passwordCancel').onclick = () => document.getElementById('passwordModal').classList.remove('show');
document.getElementById('passwordModal').addEventListener('click', (e) => { if (e.target.id === 'passwordModal') document.getElementById('passwordModal').classList.remove('show'); });
function closeAdmin() {
  document.getElementById('adminModal').classList.remove('show');
  adminUnlocked = false;
  document.body.classList.remove('admin-mode');
  renderProducts();
}
document.getElementById('closeModal').onclick = closeAdmin;
document.getElementById('adminModal').addEventListener('click', (e) => { if (e.target.id === 'adminModal') closeAdmin(); });
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'products') populateCategorySelect();
  });
});
