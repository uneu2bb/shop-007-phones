document.getElementById('addCategoryBtn').onclick = async () => {
  const name = document.getElementById('newCategoryName').value.trim();
  if (!name) return showToast('أدخل اسم القسم');
  const cat = { id: Date.now().toString(), name, hidden: false };
  data.categories.push(cat);
  document.getElementById('newCategoryName').value = '';
  await upsertCategory(cat, data.categories.length - 1);
  renderSite(); showToast('تم إضافة القسم أونلاين');
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
    li.querySelector('[data-act="hide"]').onclick = async () => { cat.hidden = !cat.hidden; await upsertCategory(cat); renderSite(); showToast(cat.hidden ? 'تم إخفاء القسم' : 'تم إظهار القسم'); };
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
    li.querySelector('[data-act="hide"]').onclick = async () => { p.hidden = !p.hidden; await upsertProduct(p); renderSite(); showToast(p.hidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج'); };
    li.querySelector('[data-act="edit"]').onclick = () => openEditProduct(p.id);
    li.querySelector('[data-act="del"]').onclick = () => deleteProduct(p.id);
    setupDrag(li); prodList.appendChild(li);
  });
}
async function editCategory(id) {
  const cat = data.categories.find(c => c.id === id);
  if (!cat) return;
  const newName = prompt('اسم القسم الجديد:', cat.name);
  if (newName && newName.trim()) { cat.name = newName.trim(); await upsertCategory(cat); renderSite(); showToast('تم تعديل القسم أونلاين'); }
}
async function deleteCategory(id) {
  if (!confirm('حذف القسم وجميع منتجاته؟')) return;
  await deleteCategoryCloud(id);
  data.categories = data.categories.filter(c => c.id !== id);
  data.products = data.products.filter(p => p.categoryId !== id);
  renderSite(); showToast('تم الحذف أونلاين');
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
let productImageFile = null;
function bindProductImgUpload() {
  const area = document.getElementById('productImgUpload');
  const input = document.getElementById('productImgInput');
  if (!area || !input) return;
  area.onclick = () => input.click();
  input.onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    productImageFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      area.innerHTML = '<img src="' + ev.target.result + '" style="max-width:140px;max-height:100px;border-radius:8px"><p style="margin-top:8px;color:var(--accent)">تم اختيار الصورة ✓</p><input type="file" id="productImgInput" accept="image/*" style="display:none">';
      bindProductImgUpload();
    };
    reader.readAsDataURL(file);
  };
}
bindProductImgUpload();
document.getElementById('addProductBtn').onclick = async () => {
  const name = document.getElementById('productName').value.trim();
  const catId = document.getElementById('productCategory').value;
  const priceUsd = parseFloat(document.getElementById('productPriceUsd').value) || 0;
  const priceSyp = parseFloat(document.getElementById('productPriceSyp').value) || 0;
  if (!name) return showToast('أدخل اسم المنتج');
  if (!catId) return showToast('اختر قسماً أولاً');
  showToast('جاري الرفع...');
  let imageUrl = null;
  try { if (productImageFile) imageUrl = await uploadImage(productImageFile, 'products'); }
  catch (err) { showToast('فشل رفع الصورة: ' + err.message); return; }
  const p = { id: Date.now().toString(), name, categoryId: catId, priceUsd, priceSyp, image: imageUrl, hidden: false };
  data.products.push(p);
  await upsertProduct(p, data.products.length - 1);
  document.getElementById('productName').value = '';
  document.getElementById('productPriceUsd').value = '';
  document.getElementById('productPriceSyp').value = '';
  productImageFile = null;
  document.getElementById('productImgUpload').innerHTML = '<p>📷 رفع صورة</p><input type="file" id="productImgInput" accept="image/*" style="display:none">';
  bindProductImgUpload();
  renderSite(); showToast('تم إضافة المنتج أونلاين ✓');
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
document.getElementById('saveEditProduct').onclick = async () => {
  const p = data.products.find(x => x.id === editingProductId);
  if (!p) return;
  const name = document.getElementById('editProductName').value.trim();
  if (!name) return showToast('أدخل اسم المنتج');
  p.name = name;
  p.priceUsd = parseFloat(document.getElementById('editProductUsd').value) || 0;
  p.priceSyp = parseFloat(document.getElementById('editProductSyp').value) || 0;
  await upsertProduct(p);
  renderSite();
  document.getElementById('editProductModal').classList.remove('show');
  showToast('تم حفظ التعديلات أونلاين');
};
document.getElementById('closeEditProduct').onclick = document.getElementById('cancelEditProduct').onclick = () => {
  document.getElementById('editProductModal').classList.remove('show');
};
document.getElementById('editProductModal').addEventListener('click', (e) => {
  if (e.target.id === 'editProductModal') document.getElementById('editProductModal').classList.remove('show');
});
async function deleteProduct(id) {
  if (!confirm('حذف هذا المنتج؟')) return;
  await deleteProductCloud(id);
  data.products = data.products.filter(p => p.id !== id);
  renderSite(); showToast('تم الحذف أونلاين');
}
let draggedItem = null;
function setupDrag(el) {
  el.addEventListener('dragstart', (e) => { draggedItem = el; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
  el.addEventListener('dragend', () => { el.classList.remove('dragging'); document.querySelectorAll('.admin-item').forEach(i => i.classList.remove('drag-over')); draggedItem = null; });
  el.addEventListener('dragover', (e) => { e.preventDefault(); if (el !== draggedItem) el.classList.add('drag-over'); });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', async (e) => {
    e.preventDefault(); el.classList.remove('drag-over');
    if (!draggedItem || draggedItem === el || draggedItem.dataset.type !== el.dataset.type) return;
    const list = el.parentElement;
    const items = [...list.children];
    const fromIdx = items.indexOf(draggedItem);
    const toIdx = items.indexOf(el);
    if (fromIdx < toIdx) list.insertBefore(draggedItem, el.nextSibling);
    else list.insertBefore(draggedItem, el);
    const newOrder = [...list.children].map(li => li.dataset.id);
    if (el.dataset.type === 'category') {
      data.categories.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      await saveCategoryOrder();
    } else {
      data.products.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      await saveProductOrder();
    }
    renderSite(); showToast('تم حفظ الترتيب أونلاين');
  });
}
document.getElementById('logoUpload').onclick = () => document.getElementById('logoInput').click();
document.getElementById('logoInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    showToast('جاري رفع اللوجو...');
    data.logo = await uploadImage(file, 'logo');
    document.getElementById('previewLogo').src = data.logo;
    await saveSettingsCloud();
    renderSite(); showToast('تم رفع اللوجو أونلاين ✓');
  } catch (err) { showToast('فشل: ' + err.message); }
};
document.getElementById('coverUpload').onclick = () => document.getElementById('coverInput').click();
document.getElementById('coverInput').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    showToast('جاري رفع الغلاف...');
    data.cover = await uploadImage(file, 'cover');
    document.getElementById('previewCover').src = data.cover;
    await saveSettingsCloud();
    renderSite(); showToast('تم رفع الغلاف أونلاين ✓');
  } catch (err) { showToast('فشل: ' + err.message); }
};
document.getElementById('deleteLogoBtn').onclick = async () => {
  data.logo = null; document.getElementById('previewLogo').src = '';
  await saveSettingsCloud(); renderSite(); showToast('تم حذف اللوجو');
};
document.getElementById('deleteCoverBtn').onclick = async () => {
  data.cover = null; document.getElementById('previewCover').src = '';
  await saveSettingsCloud(); renderSite(); showToast('تم حذف الغلاف');
};
function updatePassStatus() {
  const el = document.getElementById('passStatus');
  if (!el) return;
  if (data.adminPassword) el.textContent = '✓ كلمة السر مفعّلة أونلاين';
  else el.textContent = 'لا توجد كلمة سر — اللوحة مفتوحة بعد 5 ضغطات';
}
document.getElementById('savePassBtn').onclick = async () => {
  const current = document.getElementById('currentPassInput').value;
  const neu = document.getElementById('newPassInput').value;
  if (data.adminPassword && current !== data.adminPassword) return showToast('كلمة السر الحالية غير صحيحة');
  if (!neu) return showToast('أدخل كلمة سر جديدة');
  data.adminPassword = neu;
  await saveSettingsCloud();
  document.getElementById('currentPassInput').value = '';
  document.getElementById('newPassInput').value = '';
  updatePassStatus(); showToast('تم حفظ كلمة السر أونلاين');
};
document.getElementById('deletePassBtn').onclick = async () => {
  const current = document.getElementById('currentPassInput').value;
  if (data.adminPassword && current !== data.adminPassword) return showToast('أدخل كلمة السر الحالية أولاً');
  data.adminPassword = '';
  await saveSettingsCloud();
  document.getElementById('currentPassInput').value = '';
  document.getElementById('newPassInput').value = '';
  updatePassStatus(); showToast('تم حذف كلمة السر');
};
document.getElementById('saveSettingsBtn').onclick = async () => {
  data.shopName = document.getElementById('shopNameInput').value.trim() || '007';
  data.whatsapp = document.getElementById('whatsappInput').value.trim();
  data.facebook = document.getElementById('facebookInput').value.trim();
  data.instagram = document.getElementById('instagramInput').value.trim();
  await saveSettingsCloud();
  renderSite(); showToast('تم حفظ الإعدادات أونلاين ✓');
};
async function init() {
  loadCart();
  const ok = await loadFromCloud();
  if (!ok) { data.categories = []; data.products = []; }
  renderSite();
}
init();
