(function(){
  var EXTRAS_KEY = 'shop007_product_extras_v1';
  var extras = {};
  try { extras = JSON.parse(localStorage.getItem(EXTRAS_KEY) || '{}') || {}; } catch(e) { extras = {}; }
  function saveExtras() { try { localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras)); } catch(e) {} }
  function getExtra(id) {
    var e = extras[id] || {};
    return {
      condition: e.condition || 'new',
      storage: e.storage || '',
      battery: e.battery != null ? e.battery : null
    };
  }
  function setExtra(id, obj) {
    extras[id] = Object.assign(getExtra(id), obj);
    saveExtras();
  }

  window.shopFilters = window.shopFilters || { condition: 'all', maxBudget: null, sort: 'shop' };

  function maxProductPrice() {
    var max = 0;
    (data.products || []).forEach(function(p) {
      if (!p.hidden && p.priceUsd > max) max = p.priceUsd;
    });
    return Math.max(max, 100);
  }

  function buildFiltersBar() {
    var host = document.getElementById('shopFiltersBar');
    if (!host) {
      host = document.createElement('div');
      host.id = 'shopFiltersBar';
      host.className = 'shop-filters';
      var nav = document.getElementById('categoriesNav');
      if (nav && nav.parentNode) nav.parentNode.insertBefore(host, nav.nextSibling);
      else {
        var main = document.querySelector('main');
        if (main) main.insertBefore(host, main.firstChild);
      }
    }
    var maxP = Math.ceil(maxProductPrice());
    if (shopFilters.maxBudget == null) shopFilters.maxBudget = maxP;
    if (shopFilters.maxBudget > maxP) shopFilters.maxBudget = maxP;

    var cond = shopFilters.condition;
    host.innerHTML =
      '<div class="filter-row pills">' +
        '<button type="button" class="fpill'+(cond==='all'?' on':'')+'" data-cond="all">أي حالة</button>' +
        '<button type="button" class="fpill'+(cond==='new'?' on':'')+'" data-cond="new">جديد</button>' +
        '<button type="button" class="fpill'+(cond==='used'?' on':'')+'" data-cond="used">مستعمل</button>' +
      '</div>' +
      '<div class="filter-row sort-row">' +
        '<label class="sort-label">ترتيب</label>' +
        '<select id="sortSelect" class="sort-select">' +
          '<option value="shop"'+(shopFilters.sort==='shop'?' selected':'')+'>ترتيب المحل</option>' +
          '<option value="price_asc"'+(shopFilters.sort==='price_asc'?' selected':'')+'>السعر: الأقل أولاً</option>' +
          '<option value="price_desc"'+(shopFilters.sort==='price_desc'?' selected':'')+'>السعر: الأعلى أولاً</option>' +
        '</select>' +
      '</div>' +
      '<div class="filter-row budget-row">' +
        '<div class="budget-head"><span>ميزانيتك حتى</span><strong id="budgetVal">$'+Number(shopFilters.maxBudget).toLocaleString()+'</strong></div>' +
        '<input type="range" id="budgetSlider" class="budget-slider" min="50" max="'+maxP+'" step="10" value="'+shopFilters.maxBudget+'">' +
      '</div>';

    host.querySelectorAll('[data-cond]').forEach(function(b){
      b.onclick = function() {
        shopFilters.condition = b.getAttribute('data-cond');
        buildFiltersBar();
        if (typeof renderProducts === 'function') renderProducts();
      };
    });
    var sel = document.getElementById('sortSelect');
    if (sel) sel.onchange = function() {
      shopFilters.sort = sel.value;
      if (typeof renderProducts === 'function') renderProducts();
    };
    var slider = document.getElementById('budgetSlider');
    if (slider) {
      slider.oninput = function() {
        shopFilters.maxBudget = Number(slider.value);
        var v = document.getElementById('budgetVal');
        if (v) v.textContent = '$' + Number(shopFilters.maxBudget).toLocaleString();
      };
      slider.onchange = function() {
        shopFilters.maxBudget = Number(slider.value);
        if (typeof renderProducts === 'function') renderProducts();
      };
    }
  }

  function filteredList() {
    var list = (data.products || []).filter(function(p){ return !p.hidden; });
    if (currentCatId && currentCatId !== 'all') {
      list = list.filter(function(p){ return p.categoryId === currentCatId; });
    }
    if (typeof searchQuery === 'string' && searchQuery.trim()) {
      var q = searchQuery.toLowerCase().trim();
      list = list.filter(function(p){
        var name = (p.name||'').toLowerCase();
        var cat = (data.categories||[]).find(function(c){ return c.id===p.categoryId; });
        return name.indexOf(q)>=0 || (cat && (cat.name||'').toLowerCase().indexOf(q)>=0);
      });
    }
    if (shopFilters.condition && shopFilters.condition !== 'all') {
      list = list.filter(function(p){
        return getExtra(p.id).condition === shopFilters.condition;
      });
    }
    if (shopFilters.maxBudget != null) {
      list = list.filter(function(p){ return Number(p.priceUsd) <= Number(shopFilters.maxBudget); });
    }
    if (shopFilters.sort === 'price_asc') list = list.slice().sort(function(a,b){ return a.priceUsd - b.priceUsd; });
    else if (shopFilters.sort === 'price_desc') list = list.slice().sort(function(a,b){ return b.priceUsd - a.priceUsd; });
    return list;
  }

  function waLink(productName) {
    var num = (data.whatsapp || '').replace(/[^0-9]/g,'');
    if (!num) return null;
    var msg = encodeURIComponent('مرحبا، أريد الاستفسار عن: ' + productName);
    return 'https://wa.me/' + num + '?text=' + msg;
  }

  function conditionLabel(c) {
    return c === 'used' ? 'مستعمل' : 'جديد';
  }

  window.renderProducts = function() {
    var container = document.getElementById('productsContainer');
    if (!container) return;
    buildFiltersBar();
    var products = filteredList();
    if (!products.length) {
      container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>لا توجد منتجات ضمن هذه الفلاتر</h3></div>';
      return;
    }
    container.innerHTML = '<div class="products-grid modern-grid" id="productsGrid"></div>';
    var grid = document.getElementById('productsGrid');
    products.forEach(function(p) {
      var ex = getExtra(p.id);
      var card = document.createElement('div');
      card.className = 'product-card modern-card' + (adminUnlocked ? ' sortable' : '');
      card.dataset.id = p.id;
      if (adminUnlocked) card.draggable = true;

      var img = p.image
        ? '<img class="product-img" src="'+p.image+'" alt="'+escapeHtml(p.name)+'" loading="lazy">'
        : '<div class="product-img placeholder">📱</div>';

      var badgeClass = ex.condition === 'used' ? 'badge-used' : 'badge-new';
      var badge = '<span class="cond-badge '+badgeClass+'">'+conditionLabel(ex.condition)+'</span>';

      var storageHtml = ex.storage ? '<div class="meta-line storage">'+escapeHtml(ex.storage)+'</div>' : '';
      var batteryHtml = (ex.battery != null && ex.battery !== '')
        ? '<div class="meta-line battery"><span class="bat-val">'+escapeHtml(String(ex.battery))+'%</span> البطارية</div>'
        : '';

      var wa = waLink(p.name);
      var waBtn = wa
        ? '<a class="wa-fab" href="'+wa+'" target="_blank" rel="noopener" title="واتساب" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>'
        : '';

      card.innerHTML =
        '<div class="card-media">' +
          '<span class="reorder-hint">⠿ اسحب</span>' +
          (adminUnlocked ? '<button type="button" class="card-edit-btn">✏️</button>' : '') +
          badge + waBtn +
          '<div class="product-img-wrap">'+img+'</div>' +
        '</div>' +
        '<div class="product-body">' +
          '<div class="product-name">'+escapeHtml(p.name)+'</div>' +
          storageHtml + batteryHtml +
          '<div class="product-price">' +
            '<div class="price-usd">$'+Number(p.priceUsd).toLocaleString()+'</div>' +
            '<div class="price-syp">'+Number(p.priceSyp).toLocaleString()+' ل.س</div>' +
          '</div>' +
          '<button type="button" class="add-cart-btn">أضف إلى السلة</button>' +
        '</div>';

      card.querySelector('.add-cart-btn').onclick = function(e){ e.stopPropagation(); addToCart(p.id); };
      var editBtn = card.querySelector('.card-edit-btn');
      if (editBtn) editBtn.onclick = function(e){ e.stopPropagation(); openEditProduct(p.id); };
      if (adminUnlocked && typeof setupFrontDrag === 'function') setupFrontDrag(card);
      grid.appendChild(card);
    });
  };

  function ensureEditExtraFields() {
    var body = document.querySelector('#editProductModal .edit-body');
    if (!body || document.getElementById('editProductCondition')) return;
    var div = document.createElement('div');
    div.className = 'edit-extra-fields';
    div.innerHTML =
      '<div class="form-group"><label>الحالة</label>' +
      '<select id="editProductCondition" class="form-control lux-input">' +
      '<option value="new">جديد</option><option value="used">مستعمل</option></select></div>' +
      '<div class="form-row">' +
      '<div class="form-group"><label>السعة (مثال 256GB)</label><input type="text" class="form-control lux-input" id="editProductStorage" placeholder="256GB"></div>' +
      '<div class="form-group"><label>البطارية %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100" placeholder="100"></div>' +
      '</div>';
    var actions = body.querySelector('.edit-actions');
    if (actions) body.insertBefore(div, actions);
    else body.appendChild(div);
  }

  var _openEdit = window.openEditProduct;
  window.openEditProduct = function(id) {
    ensureEditExtraFields();
    if (typeof _openEdit === 'function') _openEdit(id);
    var ex = getExtra(id);
    var c = document.getElementById('editProductCondition');
    var s = document.getElementById('editProductStorage');
    var b = document.getElementById('editProductBattery');
    if (c) c.value = ex.condition || 'new';
    if (s) s.value = ex.storage || '';
    if (b) b.value = ex.battery != null ? ex.battery : '';
  };

  function hookSave() {
    var btn = document.getElementById('saveEditProduct');
    if (!btn || btn._extrasHooked) return;
    btn._extrasHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev) {
      if (editingProductId) {
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

  var origRS = window.renderSite;
  window.renderSite = function() {
    if (typeof origRS === 'function') origRS();
    buildFiltersBar();
    if (typeof renderProducts === 'function') renderProducts();
    hookSave();
    ensureEditExtraFields();
  };

  setTimeout(function(){
    try {
      buildFiltersBar();
      if (typeof renderProducts === 'function') renderProducts();
      hookSave();
      ensureEditExtraFields();
    } catch(e) { console.warn(e); }
  }, 600);
  setTimeout(function(){
    try { buildFiltersBar(); renderProducts(); } catch(e){}
  }, 2000);
})();
