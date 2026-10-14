(function(){
  /* ===== Luxury confirm modal ===== */
  function ensureConfirmModal() {
    if (document.getElementById('luxConfirmModal')) return;
    var m = document.createElement('div');
    m.id = 'luxConfirmModal';
    m.className = 'modal-overlay edit-layer';
    m.innerHTML =
      '<div class="lux-modal lux-confirm-modal">' +
        '<div class="lux-glow"></div>' +
        '<div class="lux-confirm-icon">⚠️</div>' +
        '<h2 id="luxConfirmTitle">تأكيد</h2>' +
        '<p class="lux-confirm-msg" id="luxConfirmMsg"></p>' +
        '<div class="lux-confirm-actions">' +
          '<button type="button" class="btn btn-danger" id="luxConfirmOk">حذف</button>' +
          '<button type="button" class="btn btn-secondary" id="luxConfirmCancel">إلغاء</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e) {
      if (e.target === m) closeLuxConfirm(false);
    });
  }

  var confirmResolver = null;
  function closeLuxConfirm(val) {
    var m = document.getElementById('luxConfirmModal');
    if (m) m.classList.remove('show', 'edit-layer');
    if (confirmResolver) {
      var r = confirmResolver;
      confirmResolver = null;
      r(val);
    }
  }

  window.luxConfirm = function(message, title, okLabel) {
    ensureConfirmModal();
    document.getElementById('luxConfirmTitle').textContent = title || 'تأكيد العملية';
    document.getElementById('luxConfirmMsg').textContent = message || '';
    document.getElementById('luxConfirmOk').textContent = okLabel || 'تأكيد';
    var m = document.getElementById('luxConfirmModal');
    m.classList.add('show', 'edit-layer');
    return new Promise(function(resolve) {
      confirmResolver = resolve;
      document.getElementById('luxConfirmOk').onclick = function() { closeLuxConfirm(true); };
      document.getElementById('luxConfirmCancel').onclick = function() { closeLuxConfirm(false); };
    });
  };

  function patchDeletes() {
    if (typeof window.deleteCategory === 'function' && !window.deleteCategory._lux) {
      window.deleteCategory = async function(id) {
        var cat = (data.categories || []).find(function(c){ return c.id === id; });
        var name = cat ? cat.name : 'هذا القسم';
        var ok = await luxConfirm(
          'سيتم حذف القسم «' + name + '» وجميع منتجاته نهائياً. لا يمكن التراجع.',
          'حذف القسم؟',
          'حذف نهائياً'
        );
        if (!ok) return;
        await deleteCategoryCloud(id);
        data.categories = data.categories.filter(function(c){ return c.id !== id; });
        data.products = data.products.filter(function(p){ return p.categoryId !== id; });
        renderSite();
        showToast('تم الحذف أونلاين');
      };
      window.deleteCategory._lux = true;
    }
    if (typeof window.deleteProduct === 'function' && !window.deleteProduct._lux) {
      window.deleteProduct = async function(id) {
        var p = (data.products || []).find(function(x){ return x.id === id; });
        var name = p ? p.name : 'هذا المنتج';
        var ok = await luxConfirm(
          'سيتم حذف «' + name + '» نهائياً من المتجر.',
          'حذف المنتج؟',
          'حذف نهائياً'
        );
        if (!ok) return;
        await deleteProductCloud(id);
        data.products = data.products.filter(function(x){ return x.id !== id; });
        renderSite();
        showToast('تم الحذف أونلاين');
      };
      window.deleteProduct._lux = true;
    }
  }

  /* ===== Boot loader ===== */
  function ensureBootLoader() {
    if (document.getElementById('bootLoader')) return;
    var style = document.createElement('style');
    style.id = 'bootLoaderStyle';
    style.textContent =
      '#bootLoader{position:fixed;inset:0;z-index:99999;background:#0a0a08;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .35s ease,visibility .35s}' +
      '#bootLoader.hide{opacity:0;visibility:hidden;pointer-events:none}' +
      '#bootLoader .bl-logo{font-size:2.4rem;font-weight:800;letter-spacing:.08em;background:linear-gradient(135deg,#e0b83a,#c9a227);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1.2rem}' +
      '#bootLoader .bl-spin{width:36px;height:36px;border:3px solid rgba(201,162,39,.2);border-top-color:#c9a227;border-radius:50%;animation:blSpin .8s linear infinite}' +
      '#bootLoader .bl-text{margin-top:1rem;color:rgba(240,235,224,.55);font-size:.85rem;font-family:Cairo,sans-serif}' +
      '@keyframes blSpin{to{transform:rotate(360deg)}}' +
      'body.booting>header,body.booting>main,body.booting>footer,body.booting>section.hero{visibility:hidden!important;opacity:0!important}' +
      '.lux-confirm-modal{max-width:360px;padding:1.75rem 1.5rem 1.5rem;text-align:center}' +
      '.lux-confirm-icon{font-size:2.2rem;margin-bottom:.5rem}' +
      '.lux-confirm-modal h2{font-size:1.15rem;font-weight:800;margin:0 0 .5rem;background:linear-gradient(135deg,#e0b83a,#c9a227);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +
      '.lux-confirm-msg{color:var(--text-muted,#aaa);font-size:.92rem;line-height:1.65;margin:0 0 1.35rem}' +
      '.lux-confirm-actions{display:flex;gap:10px}' +
      '.lux-confirm-actions .btn{flex:1;padding:12px;border-radius:12px;font-weight:700;font-family:inherit;font-size:.95rem;border:none;cursor:pointer}' +
      '.lux-confirm-actions .btn-danger{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff}' +
      '.lux-confirm-actions .btn-secondary{background:#222;color:var(--text,#eee);border:1px solid rgba(255,255,255,.12)}';
    document.head.appendChild(style);

    var el = document.createElement('div');
    el.id = 'bootLoader';
    el.innerHTML = '<div class="bl-logo">007</div><div class="bl-spin"></div><div class="bl-text">جاري التحميل...</div>';
    document.body.appendChild(el);
    document.body.classList.add('booting');
  }

  function hideBootLoader() {
    var el = document.getElementById('bootLoader');
    if (el) el.classList.add('hide');
    document.body.classList.remove('booting');
    setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, 400);
  }

  function patchBoot() {
    var _load = window.loadFromCloud;
    if (typeof _load === 'function' && !_load._bootPatched) {
      window.loadFromCloud = async function() {
        ensureBootLoader();
        try {
          return await _load.apply(this, arguments);
        } finally {}
      };
      window.loadFromCloud._bootPatched = true;
    }

    var _rs = window.renderSite;
    if (typeof _rs === 'function' && !_rs._bootPatched) {
      window.renderSite = function() {
        if (typeof _rs === 'function') _rs.apply(this, arguments);
        if (window.cloudReady || (data && data.products)) {
          hideBootLoader();
        }
        patchDeletes();
      };
      window.renderSite._bootPatched = true;
    }
  }

  if (document.body) ensureBootLoader();
  else document.addEventListener('DOMContentLoaded', ensureBootLoader);

  setTimeout(hideBootLoader, 8000);
  setTimeout(function(){ patchBoot(); patchDeletes(); }, 100);
  setTimeout(function(){ patchBoot(); patchDeletes(); }, 600);
  setTimeout(function(){ patchBoot(); patchDeletes(); hideBootLoader(); }, 3000);
})();
