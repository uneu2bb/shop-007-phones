const STORAGE_KEY = 'shop007_data_v2';
const DEFAULT_DATA = window.DEFAULT_DATA || { shopName: '007', logo: null, cover: null, categories: [], products: [] };
let data = JSON.parse(JSON.stringify(DEFAULT_DATA));
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.categories && parsed.categories.length > 0) data = parsed;
    } catch (e) {}
  }
  if (!data.categories) data.categories = DEFAULT_DATA.categories;
  if (!data.products) data.products = DEFAULT_DATA.products;
  renderSite();
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
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
  const nav = document.getElementById('categoriesNav');
  nav.innerHTML = '';
  if (data.categories.length > 0) {
    const allBtn = document.createElement('button');
    allBtn.className = 'cat-btn active';
    allBtn.textContent = 'الكل';
    allBtn.dataset.id = 'all';
    allBtn.onclick = () => filterProducts('all');
    nav.appendChild(allBtn);
    data.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn';
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.onclick = () => filterProducts(cat.id);
      nav.appendChild(btn);
    });
  }
  renderProducts('all');
  renderAdminLists();
}
function filterProducts(catId) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const active = document.querySelector(`.cat-btn[data-id="${catId}"]`);
  if (active) active.classList.add('active');
  renderProducts(catId);
}
function renderProducts(catId) {
  const container = document.getElementById('productsContainer');
  let products = data.products;
  if (catId !== 'all') products = products.filter(p => p.categoryId === catId);
  if (products.length === 0) {
    container.innerHTML = `<div class="empty-state"><div style="font-size:3rem;margin-bottom:1rem;">📱</div><h3>لا توجد منتجات في هذا القسم</h3><p>افتح لوحة التحكم لإضافة منتجات جديدة</p></div>`;
    return;
  }
  container.innerHTML = '<div class="products-grid" id="productsGrid"></div>';
  const grid = document.getElementById('productsGrid');
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    const imgHtml = p.image ? `<img class="product-img" src="${p.image}" alt="${escapeHtml(p.name)}">` : `<div class="product-img placeholder">📱</div>`;
    card.innerHTML = `<div class="product-img-wrap">${imgHtml}</div><div class="product-body"><div class="product-name">${escapeHtml(p.name)}</div><div class="product-price"><div class="price-usd">$${Number(p.priceUsd).toLocaleString()}</div><div class="price-syp">${Number(p.priceSyp).toLocaleString()} ل.س</div></div></div>`;
    grid.appendChild(card);
  });
}
function escapeHtml(str) { const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }
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
  data.categories.push({ id: Date.now().toString(), name });
  document.getElementById('newCategoryName').value = '';
  saveData(); renderSite(); showToast('تم إضافة القسم');
};
function renderAdminLists() {
  const catList = document.getElementById('categoriesList');
  catList.innerHTML = '';
  data.categories.forEach((cat) => {
    const li = document.createElement('li');
    li.className = 'admin-item'; li.draggable = true; li.dataset.id = cat.id; li.dataset.type = 'category';
    li.innerHTML = `<span class="drag-handle">⠿</span><div class="item-info"><strong>${escapeHtml(cat.name)}</strong><small>${data.products.filter(p => p.categoryId === cat.id).length} منتج</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" onclick="editCategory('${cat.id}')">تعديل</button><button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.id}')">حذف</button></div>`;
    setupDrag(li); catList.appendChild(li);
  });
  const prodList = document.getElementById('productsList');
  prodList.innerHTML = '';
  data.products.forEach(p => {
    const cat = data.categories.find(c => c.id === p.categoryId);
    const li = document.createElement('li');
    li.className = 'admin-item'; li.draggable = true; li.dataset.id = p.id; li.dataset.type = 'product';
    const thumb = p.image ? `<img class="thumb" src="${p.image}">` : `<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">📱</div>`;
    li.innerHTML = `<span class="drag-handle">⠿</span>${thumb}<div class="item-info"><strong>${escapeHtml(p.name)}</strong><small>${cat ? cat.name : '—'} • $${p.priceUsd} / ${Number(p.priceSyp).toLocaleString()} ل.س</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" onclick="editProduct('${p.id}')">تعديل</button><button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">حذف</button></div>`;
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
  data.categories.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; sel.appendChild(opt); });
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
  data.products.push({ id: Date.now().toString(), name, categoryId: catId, priceUsd, priceSyp, image: productImageData });
  document.getElementById('productName').value = '';
  document.getElementById('productPriceUsd').value = '';
  document.getElementById('productPriceSyp').value = '';
  productImageData = null;
  document.getElementById('productImgUpload').innerHTML = `<p>📷 اضغط لرفع صورة من جهازك</p><input type="file" id="productImgInput" accept="image/*" style="display:none;">`;
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
document.getElementById('saveSettingsBtn').onclick = () => {
  data.shopName = document.getElementById('shopNameInput').value.trim() || '007';
  saveData(); renderSite(); showToast('تم حفظ الإعدادات');
};
loadData();
