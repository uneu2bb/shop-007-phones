(function(){
  if (!window.shopFilters) window.shopFilters = { condition: 'all', maxBudget: null, sort: 'shop' };

  function sortLabel() {
    var m = { shop: 'ترتيب المحل', price_asc: 'السعر: الأقل أولاً', price_desc: 'السعر: الأعلى أولاً' };
    return m[shopFilters.sort] || 'ترتيب المحل';
  }
  function closeSortPicker() {
    var modal = document.getElementById('sortPickerModal');
    if (modal) modal.classList.remove('show', 'edit-layer');
  }
  function openSortPicker() {
    var modal = document.getElementById('sortPickerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sortPickerModal';
      modal.className = 'modal-overlay edit-layer';
      modal.innerHTML = '<div class="lux-modal sort-picker-modal"><div class="lux-glow"></div><div class="modal-header-lux"><h2>ترتيب المنتجات</h2><button type="button" class="close-btn" id="closeSortPicker">&times;</button></div><div class="sort-picker-list" id="sortPickerList"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e){ if (e.target === modal) closeSortPicker(); });
      document.getElementById('closeSortPicker').onclick = closeSortPicker;
    }
    var list = document.getElementById('sortPickerList');
    var opts = [
      { v: 'shop', t: 'ترتيب المحل' },
      { v: 'price_asc', t: 'السعر: الأقل أولاً' },
      { v: 'price_desc', t: 'السعر: الأعلى أولاً' }
    ];
    list.innerHTML = '';
    opts.forEach(function(o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sort-picker-item' + (shopFilters.sort === o.v ? ' active' : '');
      b.innerHTML = '<span class="sort-radio">' + (shopFilters.sort === o.v ? '●' : '○') + '</span><span>' + o.t + '</span>';
      b.onclick = function() {
        shopFilters.sort = o.v;
        closeSortPicker();
        var btn = document.getElementById('sortPickerBtn');
        if (btn) btn.querySelector('.sort-picker-label').textContent = sortLabel();
        if (typeof renderProducts === 'function') renderProducts();
      };
      list.appendChild(b);
    });
    modal.classList.add('show', 'edit-layer');
  }

  function replaceSortSelect() {
    var row = document.querySelector('.sort-row');
    if (!row) return;
    if (document.getElementById('sortPickerBtn')) {
      var lab = document.querySelector('#sortPickerBtn .sort-picker-label');
      if (lab) lab.textContent = sortLabel();
      return;
    }
    row.innerHTML = '<button type="button" class="sort-picker-btn" id="sortPickerBtn"><span class="sort-picker-label">' + sortLabel() + '</span><span class="sort-picker-chevron">▾</span></button>';
    document.getElementById('sortPickerBtn').onclick = openSortPicker;
  }

  function ensureAdminProductExtras() {
    var tab = document.getElementById('tab-products');
    if (!tab || document.getElementById('adminProductCondition')) return;
    var addBtn = document.getElementById('addProductBtn');
    if (!addBtn) return;
    var div = document.createElement('div');
    div.className = 'admin-product-extras';
    div.innerHTML =
      '<div class="form-group"><label>حالة الجهاز</label>' +
      '<div class="cond-toggle" id="adminCondToggle">' +
      '<button type="button" class="cond-opt on" data-val="new">جديد</button>' +
      '<button type="button" class="cond-opt" data-val="used">مستعمل</button>' +
      '</div><input type="hidden" id="adminProductCondition" value="new"></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label>السعة</label><input type="text" class="form-control" id="adminProductStorage" placeholder="256GB"></div>' +
      '<div class="form-group"><label>البطارية %</label><input type="number" class="form-control" id="adminProductBattery" min="0" max="100" placeholder="100"></div>' +
      '</div>';
    addBtn.parentNode.insertBefore(div, addBtn);
    document.querySelectorAll('#adminCondToggle .cond-opt').forEach(function(btn) {
      btn.onclick = function() {
        document.querySelectorAll('#adminCondToggle .cond-opt').forEach(function(x){ x.classList.remove('on'); });
        btn.classList.add('on');
        document.getElementById('adminProductCondition').value = btn.getAttribute('data-val');
      };
    });
  }

  function getExtrasStore() {
    try { return JSON.parse(localStorage.getItem('shop007_product_extras_v1') || '{}') || {}; }
    catch(e) { return {}; }
  }
  function setExtra(id, obj) {
    var all = getExtrasStore();
    all[id] = Object.assign({ condition: 'new', storage: '', battery: null }, all[id] || {}, obj);
    localStorage.setItem('shop007_product_extras_v1', JSON.stringify(all));
  }

  function hookAddProduct() {
    var btn = document.getElementById('addProductBtn');
    if (!btn || btn._condHooked2) return;
    btn._condHooked2 = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev) {
      var before = (data.products || []).map(function(p){ return p.id; });
      if (typeof prev === 'function') await prev.call(btn, ev);
      var added = (data.products || []).find(function(p){ return before.indexOf(p.id) < 0; });
      if (added) {
        var c = document.getElementById('adminProductCondition');
        var s = document.getElementById('adminProductStorage');
        var b = document.getElementById('adminProductBattery');
        setExtra(added.id, {
          condition: c ? c.value : 'new',
          storage: s ? s.value.trim() : '',
          battery: b && b.value !== '' ? Number(b.value) : null
        });
        if (typeof renderProducts === 'function') renderProducts();
      }
    };
  }

  function ensureEditCond() {
    var body = document.querySelector('#editProductModal .edit-body');
    if (!body) return;
    if (!document.getElementById('editProductCondition')) {
      var div = document.createElement('div');
      div.className = 'edit-extra-fields';
      div.innerHTML =
        '<div class="form-group"><label>الحالة</label>' +
        '<div class="cond-toggle" id="editCondToggle">' +
        '<button type="button" class="cond-opt on" data-val="new">جديد</button>' +
        '<button type="button" class="cond-opt" data-val="used">مستعمل</button></div>' +
        '<input type="hidden" id="editProductCondition" value="new"></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>السعة</label><input type="text" class="form-control lux-input" id="editProductStorage" placeholder="256GB"></div>' +
        '<div class="form-group"><label>البطارية %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100" placeholder="100"></div></div>';
      var actions = body.querySelector('.edit-actions');
      if (actions) body.insertBefore(div, actions); else body.appendChild(div);
      document.querySelectorAll('#editCondToggle .cond-opt').forEach(function(btn) {
        btn.onclick = function() {
          document.querySelectorAll('#editCondToggle .cond-opt').forEach(function(x){ x.classList.remove('on'); });
          btn.classList.add('on');
          document.getElementById('editProductCondition').value = btn.getAttribute('data-val');
        };
      });
    }
  }

  function hookSaveEdit() {
    var btn = document.getElementById('saveEditProduct');
    if (!btn || btn._condHooked2) return;
    btn._condHooked2 = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev) {
      if (typeof editingProductId !== 'undefined' && editingProductId) {
        var c = document.getElementById('editProductCondition');
        var s = document.getElementById('editProductStorage');
        var b = document.getElementById('editProductBattery');
        setExtra(editingProductId, {
          condition: c ? c.value : 'new',
          storage: s ? s.value.trim() : '',
          battery: b && b.value !== '' ? Number(b.value) : null
        });
      }
      if (typeof prev === 'function') return prev.call(btn, ev);
    };
  }

  var _oe = window.openEditProduct;
  window.openEditProduct = function(id) {
    ensureEditCond();
    if (typeof _oe === 'function') _oe(id);
    var all = getExtrasStore();
    var ex = all[id] || { condition: 'new', storage: '', battery: null };
    var c = document.getElementById('editProductCondition');
    var s = document.getElementById('editProductStorage');
    var b = document.getElementById('editProductBattery');
    if (c) c.value = ex.condition || 'new';
    if (s) s.value = ex.storage || '';
    if (b) b.value = ex.battery != null ? ex.battery : '';
    document.querySelectorAll('#editCondToggle .cond-opt').forEach(function(btn) {
      btn.classList.toggle('on', btn.getAttribute('data-val') === (ex.condition || 'new'));
    });
  };

  function apply() {
    try {
      replaceSortSelect();
      ensureAdminProductExtras();
      hookAddProduct();
      ensureEditCond();
      hookSaveEdit();
    } catch(e) { console.warn('ui_enhance', e); }
  }

  var obs = new MutationObserver(function() {
    if (document.querySelector('.sort-row') && !document.getElementById('sortPickerBtn')) replaceSortSelect();
  });
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });

  setTimeout(apply, 700);
  setTimeout(apply, 1500);
  setTimeout(apply, 3000);
  var _rs = window.renderSite;
  window.renderSite = function() {
    if (typeof _rs === 'function') _rs();
    setTimeout(apply, 50);
  };
})();
