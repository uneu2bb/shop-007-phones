(function(){
  var locked = false;

  function $(id){ return document.getElementById(id); }

  function getData(){
    try {
      if(typeof data !== 'undefined' && data) return data;
    } catch(e){}
    try {
      if(window.data) return window.data;
    } catch(e){}
    return null;
  }

  function show(id){
    var m = $(id);
    if(!m) return;
    m.classList.add('show');
    m.style.cssText = 'display:flex!important;z-index:3000!important;position:fixed;inset:0;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.88);';
  }
  function hide(id){
    var m = $(id);
    if(!m) return;
    m.classList.remove('show');
    m.style.display = 'none';
  }

  function setVal(id, v){
    var el = $(id);
    if(!el) return;
    try { el.value = (v == null || v === undefined) ? '' : String(v); } catch(e){}
  }

  function safeImage(url){
    if(!url || typeof url !== 'string') return '';
    if(url.indexOf('data:') === 0 && url.length > 80000) return '';
    return url;
  }

  function findProduct(id){
    var d = getData();
    if(!d || !d.products) return null;
    var list = d.products;
    for(var i=0;i<list.length;i++){
      if(String(list[i].id) === String(id)) return list[i];
    }
    return null;
  }

  function findCategory(id){
    var d = getData();
    if(!d || !d.categories) return null;
    var list = d.categories;
    for(var i=0;i<list.length;i++){
      if(String(list[i].id) === String(id)) return list[i];
    }
    return null;
  }

  function openProduct(id){
    if(locked) return;
    locked = true;
    setTimeout(function(){ locked = false; }, 400);

    var p = findProduct(id);
    if(!p){
      try{ if(typeof showToast==='function') showToast('\u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f'); }catch(e){}
      return;
    }

    try { window.editingProductId = p.id; editingProductId = p.id; } catch(e){ window.editingProductId = p.id; }

    setVal('editProductName', p.name || '');
    setVal('editProductUsd', p.priceUsd != null ? p.priceUsd : '');
    setVal('editProductSyp', p.priceSyp != null ? p.priceSyp : '');

    var img = $('editProductPreview');
    var ph = $('editProductPreviewPh');
    var src = safeImage(p.image);
    if(img){
      img.style.maxHeight = '120px';
      img.style.maxWidth = '100%';
      img.style.objectFit = 'contain';
      if(src){
        img.style.display = 'none';
        if(ph) ph.style.display = 'flex';
        setTimeout(function(){
          try {
            img.onload = function(){ img.style.display = 'block'; if(ph) ph.style.display = 'none'; };
            img.onerror = function(){ img.style.display = 'none'; if(ph) ph.style.display = 'flex'; };
            img.src = src;
          } catch(e){}
        }, 20);
      } else {
        try { img.removeAttribute('src'); } catch(e){}
        img.style.display = 'none';
        if(ph) ph.style.display = 'flex';
      }
    }

    try {
      setVal('editProductCondition', p.condition || 'new');
      setVal('editProductStorage', p.storage || '');
      setVal('editProductRam', p.ram || '');
      setVal('editProductBattery', p.battery != null ? p.battery : '');
      setVal('editProductClean', p.cleanliness != null ? p.cleanliness : '');
      setVal('editProductDesc', p.description || '');
      setVal('editProductColors', p.colors || '');
    } catch(e){}

    show('editProductModal');
  }

  function openCategory(id){
    if(locked) return;
    locked = true;
    setTimeout(function(){ locked = false; }, 400);

    var cat = findCategory(id);
    if(!cat){
      try{ if(typeof showToast==='function') showToast('\u0627\u0644\u0642\u0633\u0645 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f'); }catch(e){}
      return;
    }
    try { window.editingCategoryId = cat.id; editingCategoryId = cat.id; } catch(e){ window.editingCategoryId = cat.id; }
    setVal('editCategoryName', cat.name || '');
    show('editCategoryModal');
  }

  function install(){
    window.openEditProduct = openProduct;
    window.editCategory = openCategory;
  }
  install();
  var ticks = 0;
  var timer = setInterval(function(){ install(); ticks++; if(ticks > 50) clearInterval(timer); }, 200);

  document.addEventListener('click', function(e){
    var t = e.target;
    if(!t || !t.closest) return;
    var btn = t.closest('[data-act="edit"]');
    if(!btn) return;
    if(!$('adminModal')) return;

    var prodItem = btn.closest('#productsList li.admin-item, #productsList [data-type="product"]');
    if(prodItem){
      var pid = prodItem.getAttribute('data-id') || (prodItem.dataset && prodItem.dataset.id);
      if(pid){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openProduct(pid);
        return false;
      }
    }

    var catItem = btn.closest('#categoriesList li.admin-item, #categoriesList [data-type="category"]');
    if(catItem){
      var cid = catItem.getAttribute('data-id') || (catItem.dataset && catItem.dataset.id);
      if(cid){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openCategory(cid);
        return false;
      }
    }
  }, true);

  function bindClose(){
    [['closeEditProduct','editProductModal'],['cancelEditProduct','editProductModal'],
     ['closeEditCategory','editCategoryModal'],['cancelEditCategory','editCategoryModal']].forEach(function(pair){
      var b = $(pair[0]);
      if(b) b.onclick = function(ev){ if(ev) ev.preventDefault(); hide(pair[1]); };
    });
    ['editProductModal','editCategoryModal'].forEach(function(id){
      var m = $(id);
      if(m && !m._nClose){
        m._nClose = true;
        m.addEventListener('click', function(ev){ if(ev.target === m) hide(id); });
      }
    });
    var saveCat = $('saveEditCategory');
    if(saveCat && !saveCat._nBound){
      saveCat._nBound = true;
      saveCat.onclick = async function(ev){
        if(ev) ev.preventDefault();
        var id = window.editingCategoryId;
        var cat = findCategory(id);
        if(!cat) return;
        var name = (($('editCategoryName')||{}).value || '').trim();
        if(!name){ if(typeof showToast==='function') showToast('\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645'); return; }
        cat.name = name;
        try{ if(typeof upsertCategory==='function') await upsertCategory(cat); }catch(e){}
        try{ if(typeof renderSite==='function') renderSite(); }catch(e){}
        try{ if(typeof renderAdminLists==='function') renderAdminLists(); }catch(e){}
        hide('editCategoryModal');
        if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0642\u0633\u0645');
      };
    }
  }
  bindClose();
  setTimeout(bindClose, 800);

  setTimeout(function(){
    try {
      var body = document.querySelector('#editProductModal .edit-body');
      if(!body || $('editProductCondition')) return;
      var box = document.createElement('div');
      box.id = 'editExtrasBox';
      box.innerHTML =
        '<div class="form-group"><label>\u0627\u0644\u062d\u0627\u0644\u0629</label><select id="editProductCondition" class="form-control lux-input"><option value="new">\u062c\u062f\u064a\u062f</option><option value="used">\u0645\u0633\u062a\u0639\u0645\u0644</option></select></div>' +
        '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0633\u0639\u0629</label><input type="text" class="form-control lux-input" id="editProductStorage"></div><div class="form-group"><label>\u0627\u0644\u0631\u0627\u0645</label><input type="text" class="form-control lux-input" id="editProductRam"></div></div>' +
        '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0629 %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100"></div><div class="form-group"><label>\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062c\u0647\u0627\u0632</label><input type="number" class="form-control lux-input" id="editProductClean" min="0" max="100"></div></div>' +
        '<div class="form-group"><label>\u0648\u0635\u0641 \u0627\u0644\u062c\u0647\u0627\u0632</label><textarea class="form-control lux-input" id="editProductDesc" rows="2"></textarea></div>' +
        '<div class="form-group"><label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label><input type="text" class="form-control lux-input" id="editProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a"></div>';
      body.appendChild(box);
    } catch(e){}
  }, 1500);
})();
