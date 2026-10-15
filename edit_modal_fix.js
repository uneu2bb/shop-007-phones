(function(){
  var STYLE_ID = 'edit-modal-fix-css-v2';
  var editingCategoryId = null;

  function injectCss(){
    var old = document.getElementById('edit-modal-fix-css');
    if(old) old.remove();
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '/* === Edit Modal - Better Mobile Scroll === */',
      '#editProductModal.modal-overlay,',
      '#editCategoryModal.modal-overlay{',
      '  z-index: 3000 !important;',
      '  display: none;',
      '  align-items: flex-end;',
      '  justify-content: center;',
      '  padding: 0;',
      '  background: rgba(0,0,0,.88);',
      '  backdrop-filter: blur(12px);',
      '  -webkit-backdrop-filter: blur(12px);',
      '  overscroll-behavior: contain;',
      '}',
      '#editProductModal.modal-overlay.show,',
      '#editCategoryModal.modal-overlay.show{',
      '  display: flex !important;',
      '}',
      '@media(min-width:600px){',
      '  #editProductModal.modal-overlay,',
      '  #editCategoryModal.modal-overlay{align-items:center;padding:1rem;}',
      '}',
      '#editProductModal .edit-modal,',
      '#editCategoryModal .edit-modal{',
      '  max-width:440px;width:100%;margin:0;',
      '  height: min(94dvh, 94vh);',
      '  max-height: min(94dvh, 94vh);',
      '  display:flex;flex-direction:column;',
      '  border-radius:22px 22px 0 0;',
      '  background:linear-gradient(180deg,#1c1a14,#12100c);',
      '  border:1px solid rgba(201,162,39,.3);',
      '  box-shadow:0 -8px 40px rgba(0,0,0,.55);',
      '  overflow:hidden;',
      '  position:relative;',
      '}',
      '@media(min-width:600px){',
      '  #editProductModal .edit-modal,',
      '  #editCategoryModal .edit-modal{',
      '    border-radius:22px;margin:auto;',
      '    height:auto;max-height:90vh;max-height:90dvh;',
      '  }',
      '}',
      '#editProductModal .modal-header-lux,',
      '#editCategoryModal .modal-header-lux{',
      '  padding:1rem 1.25rem;flex-shrink:0;',
      '  border-bottom:1px solid rgba(201,162,39,.2);',
      '  display:flex;align-items:center;justify-content:space-between;',
      '  background:linear-gradient(180deg,rgba(201,162,39,.1),transparent);',
      '  position:sticky;top:0;z-index:2;',
      '}',
      '#editProductModal .modal-header-lux h2,',
      '#editCategoryModal .modal-header-lux h2{',
      '  margin:0;font-size:1.1rem;font-weight:800;',
      '  background:linear-gradient(135deg,#e8c547,#c9a227);',
      '  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
      '}',
      '#editProductModal .edit-body,',
      '#editCategoryModal .edit-body{',
      '  padding: 0.85rem 1.15rem 1.25rem;',
      '  overflow-y: auto !important;',
      '  overflow-x: hidden;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '  flex: 1 1 auto;',
      '  min-height: 0;',
      '  max-height: none;',
      '  touch-action: pan-y;',
      '  scroll-behavior: smooth;',
      '}',
      '#editProductModal .edit-body::after,',
      '#editCategoryModal .edit-body::after{',
      '  content:"";display:block;height:24px;',
      '}',
      '#editProductModal .edit-actions,',
      '#editCategoryModal .edit-actions{',
      '  display:flex;gap:10px;flex-shrink:0;',
      '  padding:12px 1.15rem calc(14px + env(safe-area-inset-bottom,0px));',
      '  border-top:1px solid rgba(201,162,39,.2);',
      '  background:#14120e;',
      '  position:relative;z-index:2;',
      '}',
      '#editProductModal .edit-actions .btn,',
      '#editCategoryModal .edit-actions .btn{',
      '  flex:1;padding:14px 12px;border-radius:14px;font-weight:700;',
      '  font-family:inherit;font-size:1rem;border:none;cursor:pointer;',
      '}',
      '#editProductModal .edit-actions .btn-primary,',
      '#editCategoryModal .edit-actions .btn-primary{',
      '  background:linear-gradient(135deg,#e0b83a,#c9a227);color:#111;',
      '}',
      '#editProductModal .edit-actions .btn-secondary,',
      '#editCategoryModal .edit-actions .btn-secondary{',
      '  background:#222;color:#f0ebe0;border:1px solid rgba(201,162,39,.25);',
      '}',
      '#editProductModal .lux-input,',
      '#editCategoryModal .lux-input,',
      '#editProductModal .form-control,',
      '#editCategoryModal .form-control{',
      '  background:#14140f;border:1px solid rgba(201,162,39,.22);',
      '  border-radius:12px;padding:12px 14px;color:#f0ebe0;',
      '  font-family:inherit;font-size:16px;width:100%;box-sizing:border-box;',
      '}',
      '#editProductModal .form-group,',
      '#editCategoryModal .form-group{',
      '  margin-bottom: 0.85rem;',
      '}',
      '#editProductModal .form-row{',
      '  display:flex;gap:10px;margin-bottom:0.85rem;',
      '}',
      '#editProductModal .form-row .form-group{',
      '  flex:1;margin-bottom:0;',
      '}',
      '#editProductModal label,',
      '#editCategoryModal label{',
      '  display:block;margin-bottom:6px;font-size:0.88rem;color:#c9a227;font-weight:600;',
      '}',
      'body.edit-modal-open{',
      '  overflow: hidden !important;',
      '  touch-action: none;',
      '  position: fixed;',
      '  width: 100%;',
      '  height: 100%;',
      '}',
      '#adminModal.modal-overlay{z-index:1300;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function lockBody(lock){
    try{
      if(lock){
        document.body.classList.add('edit-modal-open');
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.body.classList.remove('edit-modal-open');
        document.documentElement.style.overflow = '';
      }
    }catch(e){}
  }

  function showModal(id){
    var m = document.getElementById(id);
    if(!m) return;
    m.classList.add('show');
    m.style.display = 'flex';
    m.style.zIndex = '3000';
    lockBody(true);
  }
  function hideModal(id){
    var m = document.getElementById(id);
    if(!m) return;
    m.classList.remove('show');
    m.style.display = 'none';
    lockBody(false);
  }

  window.openEditProduct = function(id){
    injectCss();
    var p = (data.products||[]).find(function(x){ return x.id === id; });
    if(!p){
      if(typeof showToast==='function') showToast('\u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
      return;
    }
    window.editingProductId = id;
    try{ editingProductId = id; }catch(e){}

    var nameEl = document.getElementById('editProductName');
    var usdEl = document.getElementById('editProductUsd');
    var sypEl = document.getElementById('editProductSyp');
    if(nameEl) nameEl.value = p.name || '';
    if(usdEl) usdEl.value = p.priceUsd != null ? p.priceUsd : '';
    if(sypEl) sypEl.value = p.priceSyp != null ? p.priceSyp : '';

    var img = document.getElementById('editProductPreview');
    var ph = document.getElementById('editProductPreviewPh');
    if(img){
      if(p.image){
        img.src = p.image;
        img.style.display = 'block';
        if(ph) ph.style.display = 'none';
      } else {
        img.style.display = 'none';
        if(ph) ph.style.display = 'flex';
      }
    }

    showModal('editProductModal');
    setTimeout(function(){
      var body = document.querySelector('#editProductModal .edit-body');
      if(body){ try{ body.scrollTop = 0; }catch(e){} }
    }, 50);
  };

  window.editCategory = function(id){
    injectCss();
    var cat = (data.categories||[]).find(function(c){ return c.id === id; });
    if(!cat){
      if(typeof showToast==='function') showToast('\u0627\u0644\u0642\u0633\u0645 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
      return;
    }
    editingCategoryId = id;
    var nameEl = document.getElementById('editCategoryName');
    if(nameEl) nameEl.value = cat.name || '';
    showModal('editCategoryModal');
    setTimeout(function(){
      if(nameEl){ try{ nameEl.focus(); nameEl.select(); }catch(e){} }
    }, 300);
  };

  function bindCategorySave(){
    var saveBtn = document.getElementById('saveEditCategory');
    if(saveBtn && !saveBtn._luxBound){
      saveBtn._luxBound = true;
      saveBtn.onclick = async function(e){
        e.preventDefault();
        var cat = (data.categories||[]).find(function(c){ return c.id === editingCategoryId; });
        if(!cat) return;
        var nameEl = document.getElementById('editCategoryName');
        var name = nameEl ? nameEl.value.trim() : '';
        if(!name){
          if(typeof showToast==='function') showToast('\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645');
          return;
        }
        cat.name = name;
        if(typeof upsertCategory==='function') await upsertCategory(cat);
        if(typeof renderSite==='function') renderSite();
        hideModal('editCategoryModal');
        if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0642\u0633\u0645 \u0623\u0648\u0646\u0644\u0627\u064a\u0646');
      };
    }
    var closeBtn = document.getElementById('closeEditCategory');
    var cancelBtn = document.getElementById('cancelEditCategory');
    function closeCat(){ hideModal('editCategoryModal'); }
    if(closeBtn && !closeBtn._luxBound){ closeBtn._luxBound = true; closeBtn.onclick = closeCat; }
    if(cancelBtn && !cancelBtn._luxBound){ cancelBtn._luxBound = true; cancelBtn.onclick = closeCat; }
    var modal = document.getElementById('editCategoryModal');
    if(modal && !modal._luxBound){
      modal._luxBound = true;
      modal.addEventListener('click', function(e){
        if(e.target === modal || e.target.id === 'editCategoryModal') hideModal('editCategoryModal');
      });
    }
  }

  function bindProductModal(){
    var closeBtn = document.getElementById('closeEditProduct');
    var cancelBtn = document.getElementById('cancelEditProduct');
    function closeProd(){ hideModal('editProductModal'); }
    if(closeBtn && !closeBtn._luxBound2){ closeBtn._luxBound2 = true; closeBtn.onclick = closeProd; }
    if(cancelBtn && !cancelBtn._luxBound2){ cancelBtn._luxBound2 = true; cancelBtn.onclick = closeProd; }
    var modal = document.getElementById('editProductModal');
    if(modal && !modal._luxBound2){
      modal._luxBound2 = true;
      modal.addEventListener('click', function(e){
        if(e.target === modal || e.target.id === 'editProductModal') hideModal('editProductModal');
      });
    }
    var saveBtn = document.getElementById('saveEditProduct');
    if(saveBtn && !saveBtn._luxCoreBound){
      saveBtn._luxCoreBound = true;
      var prev = saveBtn.onclick;
      saveBtn.onclick = async function(ev){
        if(typeof prev === 'function'){
          await prev.call(saveBtn, ev);
        } else {
          var id = window.editingProductId || (typeof editingProductId !== 'undefined' ? editingProductId : null);
          var p = (data.products||[]).find(function(x){ return x.id === id; });
          if(!p) return;
          var name = (document.getElementById('editProductName')||{}).value;
          name = (name||'').trim();
          if(!name){ if(typeof showToast==='function') showToast('\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062a\u062c'); return; }
          p.name = name;
          p.priceUsd = parseFloat((document.getElementById('editProductUsd')||{}).value) || 0;
          p.priceSyp = parseFloat((document.getElementById('editProductSyp')||{}).value) || 0;
          if(typeof upsertProduct==='function') await upsertProduct(p);
          if(typeof renderSite==='function') renderSite();
          if(typeof showToast==='function') showToast('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0639\u062f\u064a\u0644\u0627\u062a \u0623\u0648\u0646\u0644\u0627\u064a\u0646');
        }
        hideModal('editProductModal');
      };
    }
  }

  function boot(){
    injectCss();
    bindCategorySave();
    bindProductModal();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
})();
