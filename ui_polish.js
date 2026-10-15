(function(){
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
    if (!document.getElementById('luxConfirmStyle')) {
      var s = document.createElement('style');
      s.id = 'luxConfirmStyle';
      s.textContent =
        '.lux-confirm-modal{max-width:360px;padding:1.75rem 1.5rem 1.5rem;text-align:center}' +
        '.lux-confirm-icon{font-size:2.2rem;margin-bottom:.5rem}' +
        '.lux-confirm-modal h2{font-size:1.15rem;font-weight:800;margin:0 0 .5rem;background:linear-gradient(135deg,#e0b83a,#c9a227);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}' +
        '.lux-confirm-msg{color:var(--text-muted,#aaa);font-size:.92rem;line-height:1.65;margin:0 0 1.35rem}' +
        '.lux-confirm-actions{display:flex;gap:10px}' +
        '.lux-confirm-actions .btn{flex:1;padding:12px;border-radius:12px;font-weight:700;font-family:inherit;font-size:.95rem;border:none;cursor:pointer}' +
        '.lux-confirm-actions .btn-danger{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff}' +
        '.lux-confirm-actions .btn-secondary{background:#222;color:var(--text,#eee);border:1px solid rgba(255,255,255,.12)}';
      document.head.appendChild(s);
    }
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

  function killBootLoader() {
    var el = document.getElementById('bootLoader');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.body.classList.remove('booting');
    var st = document.getElementById('bootLoaderStyle');
    if (st && st.parentNode) st.parentNode.removeChild(st);
  }
  killBootLoader();
  setTimeout(killBootLoader, 50);
  setTimeout(killBootLoader, 300);

  setTimeout(patchDeletes, 100);
  setTimeout(patchDeletes, 600);
  setTimeout(patchDeletes, 1500);
  var _rs = window.renderSite;
  if (typeof _rs === 'function') {
    window.renderSite = function() {
      _rs.apply(this, arguments);
      patchDeletes();
      killBootLoader();
    };
  }
})();
