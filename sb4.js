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
  if (!ok) {
    data.categories = [];
    data.products = [];
  }
  renderSite();
}
init();
