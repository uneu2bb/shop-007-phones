(function(){
  var META_PATH = 'meta/site-meta.json';
  var openAdminCatId = null;

  async function loadSiteMeta() {
    if (typeof sb === 'undefined' || !sb) return;
    try {
      var urlData = sb.storage.from('shop-images').getPublicUrl(META_PATH).data;
      var url = urlData.publicUrl + '?t=' + Date.now();
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      var meta = await res.json();
      if (meta && meta.footerDesc != null) data.footerDesc = meta.footerDesc;
    } catch (e) {}
  }

  async function saveSiteMeta() {
    if (typeof sb === 'undefined' || !sb) return false;
    try {
      var meta = { footerDesc: data.footerDesc || '' };
      var blob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
      var r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
        upsert: true, contentType: 'application/json', cacheControl: '0'
      });
      if (r.error) {
        try { await sb.storage.from('shop-images').remove([META_PATH]); } catch (e) {}
        r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
          upsert: true, contentType: 'application/json', cacheControl: '0'
        });
      }
      return !r.error;
    } catch (e) { return false; }
  }

  function ensureSettingsFields() {
    var tab = document.getElementById('tab-settings');
    if (!tab || document.getElementById('footerDescInput')) return;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label>وصف يظهر أسفل الموقع</label>' +
      '<textarea class="form-control" id="footerDescInput" rows="3" placeholder="مثال: محل 007 للهواتف — جديد ومستعمل — توصيل داخل المدينة"></textarea>';
    var shopName = document.getElementById('shopNameInput');
    if (shopName && shopName.parentNode) {
      var after = shopName.parentNode;
      after.parentNode.insertBefore(group, after.nextSibling);
    } else {
      tab.insertBefore(group, tab.firstChild);
    }
  }

  function fillSettingsFields() {
    ensureSettingsFields();
    var fd = document.getElementById('footerDescInput');
    if (fd) fd.value = data.footerDesc || '';
    var wa = document.getElementById('whatsappInput');
    if (wa && data.whatsapp) wa.value = data.whatsapp;
  }

  function renderFooterDesc() {
    var footer = document.getElementById('siteFooter');
    if (!footer) return;
    var el = document.getElementById('footerDesc');
    if (!el) {
      el = document.createElement('div');
      el.id = 'footerDesc';
      el.className = 'footer-desc';
      footer.insertBefore(el, footer.firstChild);
    }
    var text = (data.footerDesc || '').trim();
    if (text) {
      el.style.display = 'block';
      el.textContent = text;
    } else {
      el.style.display = 'none';
      el.textContent = '';
    }
  }

  function ensureWaFab() {
    var fab = document.getElementById('waFloatBtn');
    var num = (data.whatsapp || '').replace(/[^0-9]/g, '');
    if (!num) {
      if (fab) fab.style.display = 'none';
      return;
    }
    if (!fab) {
      fab = document.createElement('a');
      fab.id = 'waFloatBtn';
      fab.className = 'wa-float-btn';
      fab.target = '_blank';
      fab.rel = 'noopener';
      fab.setAttribute('aria-label', 'واتساب');
      fab.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
      document.body.appendChild(fab);
    }
    fab.href = 'https://wa.me/' + num;
    fab.style.display = 'flex';
  }

  window.renderAdminLists = function() {
    var catList = document.getElementById('categoriesList');
    if (catList) {
      catList.innerHTML = '';
      (data.categories || []).forEach(function(cat) {
        var li = document.createElement('li');
        li.className = 'admin-item' + (cat.hidden ? ' hidden-item' : '');
        li.draggable = true;
        li.dataset.id = cat.id;
        li.dataset.type = 'category';
        var hideLabel = cat.hidden ? 'إظهار' : 'إخفاء';
        var count = (data.products || []).filter(function(p){ return p.categoryId === cat.id; }).length;
        li.innerHTML = '<span class="drag-handle">⠿</span><div class="item-info"><strong>' + escapeHtml(cat.name) + (cat.hidden ? ' (مخفي)' : '') + '</strong><small>' + count + ' منتج</small></div><div class="item-actions"><button class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button><button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button><button class="btn btn-danger btn-sm" data-act="del">حذف</button></div>';
        li.querySelector('[data-act="hide"]').onclick = async function() {
          cat.hidden = !cat.hidden;
          await upsertCategory(cat);
          renderSite();
          showToast(cat.hidden ? 'تم إخفاء القسم' : 'تم إظهار القسم');
        };
        li.querySelector('[data-act="edit"]').onclick = function() { editCategory(cat.id); };
        li.querySelector('[data-act="del"]').onclick = function() { deleteCategory(cat.id); };
        if (typeof setupDrag === 'function') setupDrag(li);
        catList.appendChild(li);
      });
    }

    var prodList = document.getElementById('productsList');
    if (!prodList) return;
    prodList.innerHTML = '';
    prodList.classList.add('admin-products-grouped');

    var cats = (data.categories || []).slice();
    var uncategorized = (data.products || []).filter(function(p) {
      return !cats.some(function(c){ return c.id === p.categoryId; });
    });

    function renderCatSection(cat, products) {
      var section = document.createElement('li');
      section.className = 'admin-cat-section';
      section.dataset.catId = cat ? cat.id : 'none';
      var isOpen = openAdminCatId === (cat ? cat.id : 'none');
      var title = cat ? cat.name : 'بدون قسم';
      section.innerHTML =
        '<button type="button" class="admin-cat-header' + (isOpen ? ' open' : '') + '">' +
          '<span class="admin-cat-chevron">' + (isOpen ? '▾' : '▸') + '</span>' +
          '<span class="admin-cat-title">' + escapeHtml(title) + '</span>' +
          '<span class="admin-cat-count">' + products.length + '</span>' +
        '</button>' +
        '<ul class="admin-cat-products" style="display:' + (isOpen ? 'block' : 'none') + '"></ul>';
      var header = section.querySelector('.admin-cat-header');
      var list = section.querySelector('.admin-cat-products');
      header.onclick = function() {
        var id = cat ? cat.id : 'none';
        openAdminCatId = openAdminCatId === id ? null : id;
        renderAdminLists();
      };
      products.forEach(function(p) {
        var li = document.createElement('li');
        li.className = 'admin-item' + (p.hidden ? ' hidden-item' : '');
        li.draggable = true;
        li.dataset.id = p.id;
        li.dataset.type = 'product';
        var thumb = p.image
          ? '<img class="thumb" src="' + p.image + '">' 
          : '<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem">📱</div>';
        var hideLabel = p.hidden ? 'إظهار' : 'إخفاء';
        li.innerHTML =
          '<span class="drag-handle">⠿</span>' + thumb +
          '<div class="item-info"><strong>' + escapeHtml(p.name) + (p.hidden ? ' (مخفي)' : '') + '</strong>' +
          '<small>$' + p.priceUsd + ' / ' + Number(p.priceSyp).toLocaleString() + ' ل.س</small></div>' +
          '<div class="item-actions">' +
            '<button class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button>' +
            '<button class="btn btn-secondary btn-sm" data-act="edit">تعديل</button>' +
            '<button class="btn btn-danger btn-sm" data-act="del">حذف</button>' +
          '</div>';
        li.querySelector('[data-act="hide"]').onclick = async function() {
          p.hidden = !p.hidden;
          await upsertProduct(p);
          renderSite();
          showToast(p.hidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج');
        };
        li.querySelector('[data-act="edit"]').onclick = function() { openEditProduct(p.id); };
        li.querySelector('[data-act="del"]').onclick = function() { deleteProduct(p.id); };
        if (typeof setupDrag === 'function') setupDrag(li);
        list.appendChild(li);
      });
      if (!products.length) {
        list.innerHTML = '<li class="admin-empty-cat">لا منتجات في هذا القسم</li>';
      }
      prodList.appendChild(section);
    }

    cats.forEach(function(cat) {
      var prods = (data.products || []).filter(function(p){ return p.categoryId === cat.id; });
      renderCatSection(cat, prods);
    });
    if (uncategorized.length) renderCatSection(null, uncategorized);
  };

  function hookSaveSettings() {
    var btn = document.getElementById('saveSettingsBtn');
    if (!btn || btn._footerHooked) return;
    btn._footerHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev) {
      ensureSettingsFields();
      var fd = document.getElementById('footerDescInput');
      if (fd) data.footerDesc = fd.value.trim();
      var wa = document.getElementById('whatsappInput');
      if (wa) data.whatsapp = wa.value.trim();
      if (typeof prev === 'function') await prev.call(btn, ev);
      else {
        data.shopName = (document.getElementById('shopNameInput') || {}).value || '007';
        data.facebook = (document.getElementById('facebookInput') || {}).value || '';
        data.instagram = (document.getElementById('instagramInput') || {}).value || '';
        if (typeof saveSettingsCloud === 'function') await saveSettingsCloud();
      }
      await saveSiteMeta();
      renderFooterDesc();
      ensureWaFab();
      if (typeof renderSocial === 'function') renderSocial();
      showToast('تم حفظ الإعدادات أونلاين ✓');
    };
  }

  var _rs = window.renderSite;
  window.renderSite = function() {
    if (typeof _rs === 'function') _rs();
    fillSettingsFields();
    renderFooterDesc();
    ensureWaFab();
    hookSaveSettings();
    try { if (typeof renderAdminLists === 'function') renderAdminLists(); } catch (e) {}
  };

  setTimeout(async function() {
    await loadSiteMeta();
    ensureSettingsFields();
    fillSettingsFields();
    renderFooterDesc();
    ensureWaFab();
    hookSaveSettings();
    if (typeof renderAdminLists === 'function') renderAdminLists();
  }, 900);
  setTimeout(hookSaveSettings, 2000);
})();
