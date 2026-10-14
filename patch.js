(function(){
  async function fileToDataUrl(file, maxW) {
    maxW = maxW || 900;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.uploadImageSafe = async function(file, folder) {
    try {
      if (typeof uploadImage === 'function') {
        return await uploadImage(file, folder);
      }
    } catch (e) {
      console.warn('Storage upload failed, using compressed dataURL', e);
    }
    return await fileToDataUrl(file, 900);
  };

  let editingCategoryId = null;
  window.openEditCategory = function(id) {
    const cat = data.categories.find(c => c.id === id);
    if (!cat) return;
    editingCategoryId = id;
    const el = document.getElementById('editCategoryName');
    const modal = document.getElementById('editCategoryModal');
    if (!el || !modal) return;
    el.value = cat.name;
    modal.classList.add('show', 'edit-layer');
    setTimeout(() => el.focus(), 120);
  };
  window.editCategory = function(id) { openEditCategory(id); };
  const saveCat = document.getElementById('saveEditCategory');
  if (saveCat) saveCat.onclick = async () => {
    const cat = data.categories.find(c => c.id === editingCategoryId);
    if (!cat) return;
    const name = document.getElementById('editCategoryName').value.trim();
    if (!name) return showToast('أدخل اسم القسم');
    cat.name = name;
    await upsertCategory(cat);
    renderSite();
    document.getElementById('editCategoryModal').classList.remove('show', 'edit-layer');
    showToast('تم تعديل القسم أونلاين');
  };
  ['closeEditCategory','cancelEditCategory'].forEach(id => {
    const b = document.getElementById(id);
    if (b) b.onclick = () => document.getElementById('editCategoryModal').classList.remove('show', 'edit-layer');
  });
  const catModal = document.getElementById('editCategoryModal');
  if (catModal) catModal.addEventListener('click', e => {
    if (e.target.id === 'editCategoryModal') catModal.classList.remove('show', 'edit-layer');
  });

  let editImageFile = null;
  let editImageRemoved = false;

  function refreshEditPreview(src) {
    const prev = document.getElementById('editProductPreview');
    const prevPh = document.getElementById('editProductPreviewPh');
    const delBtn = document.getElementById('editDeleteImgBtn');
    if (!prev) return;
    if (src) {
      prev.src = src; prev.style.display = 'block';
      if (prevPh) prevPh.style.display = 'none';
      if (delBtn) delBtn.style.display = 'inline-block';
    } else {
      prev.src = ''; prev.style.display = 'none';
      if (prevPh) prevPh.style.display = 'flex';
      if (delBtn) delBtn.style.display = 'none';
    }
  }

  window.openEditProduct = function(id) {
    const p = data.products.find(x => x.id === id);
    if (!p) return;
    editingProductId = id;
    editImageFile = null;
    editImageRemoved = false;
    document.getElementById('editProductName').value = p.name;
    document.getElementById('editProductUsd').value = p.priceUsd;
    document.getElementById('editProductSyp').value = p.priceSyp;
    const input = document.getElementById('editProductImgInput');
    if (input) input.value = '';
    refreshEditPreview(p.image || null);
    const modal = document.getElementById('editProductModal');
    modal.classList.add('show', 'edit-layer');
    setTimeout(() => document.getElementById('editProductName').focus(), 120);
  };

  function closeEditProduct() {
    document.getElementById('editProductModal').classList.remove('show', 'edit-layer');
    editImageFile = null;
    editImageRemoved = false;
  }
  const closeBtn = document.getElementById('closeEditProduct');
  const cancelBtn = document.getElementById('cancelEditProduct');
  if (closeBtn) closeBtn.onclick = closeEditProduct;
  if (cancelBtn) cancelBtn.onclick = closeEditProduct;
  const editModal = document.getElementById('editProductModal');
  if (editModal) editModal.addEventListener('click', e => {
    if (e.target.id === 'editProductModal') closeEditProduct();
  });

  const uploadBtn = document.getElementById('editUploadImgBtn');
  const imgInput = document.getElementById('editProductImgInput');
  if (uploadBtn && imgInput) {
    uploadBtn.onclick = () => imgInput.click();
    imgInput.onchange = () => {
      const f = imgInput.files && imgInput.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) return showToast('اختر صورة فقط');
      editImageFile = f;
      editImageRemoved = false;
      const reader = new FileReader();
      reader.onload = (ev) => refreshEditPreview(ev.target.result);
      reader.readAsDataURL(f);
    };
  }
  const delImgBtn = document.getElementById('editDeleteImgBtn');
  if (delImgBtn) {
    delImgBtn.onclick = () => {
      editImageFile = null;
      editImageRemoved = true;
      if (imgInput) imgInput.value = '';
      refreshEditPreview(null);
      showToast('سيتم حذف الصورة عند الحفظ');
    };
  }

  const saveProd = document.getElementById('saveEditProduct');
  if (saveProd) saveProd.onclick = async () => {
    const p = data.products.find(x => x.id === editingProductId);
    if (!p) return;
    const name = document.getElementById('editProductName').value.trim();
    if (!name) return showToast('أدخل اسم المنتج');
    p.name = name;
    p.priceUsd = parseFloat(document.getElementById('editProductUsd').value) || 0;
    p.priceSyp = parseFloat(document.getElementById('editProductSyp').value) || 0;
    try {
      if (editImageRemoved) {
        p.image = null;
      } else if (editImageFile) {
        showToast('جاري رفع الصورة...');
        p.image = await uploadImageSafe(editImageFile, 'products');
      }
      await upsertProduct(p);
      renderSite();
      closeEditProduct();
      showToast('تم حفظ التعديلات أونلاين ✓');
    } catch (err) {
      console.error(err);
      showToast('خطأ في الحفظ: ' + (err.message || err));
    }
  };

  const _renderProducts = window.renderProducts;
  if (typeof _renderProducts === 'function') {
    window.renderProducts = function() {
      _renderProducts();
      if (!adminUnlocked) return;
      document.querySelectorAll('.product-card').forEach(card => {
        if (card.querySelector('.card-edit-btn')) return;
        const id = card.dataset.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'card-edit-btn';
        btn.textContent = '✏️ تعديل';
        btn.onclick = (e) => { e.stopPropagation(); openEditProduct(id); };
        card.appendChild(btn);
      });
    };
  }
})();
