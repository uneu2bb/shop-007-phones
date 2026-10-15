(function(){
  var busy = false;

  function $(id){ return document.getElementById(id); }

  function showOverlay(id){
    var m = $(id);
    if(!m) return;
    m.classList.add('show');
    m.style.display = 'flex';
    m.style.zIndex = '2000';
    m.style.position = 'fixed';
    m.style.inset = '0';
    m.style.alignItems = 'flex-end';
    m.style.justifyContent = 'center';
    m.style.background = 'rgba(0,0,0,.85)';
  }

  function hideOverlay(id){
    var m = $(id);
    if(!m) return;
    m.classList.remove('show');
    m.style.display = 'none';
  }

  function openProductEdit(id){
    if(busy) return;
    busy = true;
    try {
      if(typeof data === 'undefined' || !data || !data.products){
        if(typeof showToast === 'function') showToast('\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u062c\u0627\u0647\u0632\u0629');
        busy = false;
        return;
      }
      var p = data.products.find(function(x){ return String(x.id) === String(id); });
      if(!p){
        if(typeof showToast === 'function') showToast('\u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
        busy = false;
        return;
      }
      window.editingProductId = p.id;
      try { editingProductId = p.id; } catch(e){}

      var body = document.querySelector('#editProductModal .edit-body');
      if(body && !$('editProductCondition')){
        var box = document.createElement('div');
        box.id = 'editExtrasBox';
        box.innerHTML =
          '<div class="form-group"><label>\u0627\u0644\u062d\u0627\u0644\u0629</label><select id="editProductCondition" class="form-control lux-input"><option value="new">\u062c\u062f\u064a\u062f</option><option value="used">\u0645\u0633\u062a\u0639\u0645\u0644</option></select></div>' +
          '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0633\u0639\u0629</label><input type="text" class="form-control lux-input" id="editProductStorage"></div>' +
          '<div class="form-group"><label>\u0627\u0644\u0631\u0627\u0645</label><input type="text" class="form-control lux-input" id="editProductRam"></div></div>' +
          '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0629 %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100"></div>' +
          '<div class="form-group"><label>\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062c\u0647\u0627\u0632</label><input type="number" class="form-control lux-input" id="editProductClean" min="0" max="100"></div></div>' +
          '<div class="form-group"><label>\u0648\u0635\u0641 \u0627\u0644\u062c\u0647\u0627\u0632</label><textarea class="form-control lux-input" id="editProductDesc" rows="2"></textarea></div>' +
          '<div class="form-group"><label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label><input type="text" class="form-control lux-input" id="editProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a\u060c \u0641\u0636\u064a"></div>';
        body.appendChild(box);
      }

      function set(eid, v){ var el = $(eid); if(el) el.value = (v != null && v !== undefined) ? v : ''; }
      set('editProductName', p.name);
      set('editProductUsd', p.priceUsd);
      set('editProductSyp', p.priceSyp);

      var img = $('editProductPreview');
      var ph = $('editProductPreviewPh');
      if(img){
        img.style.maxHeight = '140px';
        img.style.maxWidth = '100%';
        img.style.objectFit = 'contain';
        if(p.image){
          img.src = p.image;
          img.style.display = 'block';
          if(ph) ph.style.display = 'none';
        } else {
          img.removeAttribute('src');
          img.style.display = 'none';
          if(ph) ph.style.display = 'flex';
        }
      }

      var cond = p.condition || 'new', storage = p.storage || '', ram = p.ram || '';
      var battery = p.battery != null ? p.battery : '', clean = p.cleanliness != null ? p.cleanliness : '';
      var desc = p.description || '', colors = p.colors || '';
      try {
        if(typeof getExtra === 'function'){
          var ex = getExtra(p.id);
          if(ex){
            if(ex.condition) cond = ex.condition;
            if(ex.storage) storage = ex.storage;
            if(ex.ram) ram = ex.ram;
            if(ex.battery != null) battery = ex.battery;
            if(ex.cleanliness != null) clean = ex.cleanliness;
            if(ex.description) desc = ex.description;
            if(ex.colors) colors = ex.colors;
          }
        }
      } catch(e){}
      set('editProductCondition', cond);
      set('editProductStorage', storage);
      set('editProductRam', ram);
      set('editProductBattery', battery);
      set('editProductClean', clean);
      set('editProductDesc', desc);
      set('editProductColors', colors);

      showOverlay('editProductModal');
    } catch(err){
      console.warn(err);
      if(typeof showToast === 'function') showToast('\u062e\u0637\u0623 \u0641\u064a \u0641\u062a\u062d \u0627\u0644\u062a\u0639\u062f\u064a\u0644');
    }
    setTimeout(function(){ busy = false; }, 250);
  }

  function openCategoryEdit(id){
    if(busy) return;
    busy = true;
    try {
      if(typeof data === 'undefined' || !data || !data.categories){
        if(typeof showToast === 'function') showToast('\u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u063a\u064a\u0631 \u062c\u0627\u0647\u0632\u0629');
        busy = false;
        return;
      }
      var cat = data.categories.find(function(c){ return String(c.id) === String(id); });
      if(!cat){
        if(typeof showToast === 'function') showToast('\u0627\u0644\u0642\u0633\u0645 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
        busy = false;
        return;
      }
      window.editingCategoryId = cat.id;
      try { editingCategoryId = cat.id; } catch(e){}
      var nameEl = $('editCategoryName');
      if(nameEl) nameEl.value = cat.name || '';
      showOverlay('editCategoryModal');
      setTimeout(function(){
        if(nameEl){ try { nameEl.focus(); nameEl.select(); } catch(e){} }
      }, 200);
    } catch(err){
      console.warn(err);
    }
    setTimeout(function(){ busy = false; }, 250);
  }

  function install(){
    window.openEditProduct = openProductEdit;
    window.editCategory = openCategoryEdit;
  }
  install();
  var n = 0;
  var iv = setInterval(function(){ install(); n++; if(n > 24) clearInterval(iv); }, 300);

  function bindClose(){
    var cp = $('closeEditProduct'), canP = $('cancelEditProduct');
    if(cp) cp.onclick = function(e){ e && e.preventDefault(); hideOverlay('editProductModal'); };
    if(canP) canP.onclick = function(e){ e && e.preventDefault(); hideOverlay('editProductModal'); };
    var cc = $('closeEditCategory'), canC = $('cancelEditCategory');
    if(cc) cc.onclick = function(e){ e && e.preventDefault(); hideOverlay('editCategoryModal'); };
    if(canC) canC.onclick = function(e){ e && e.preventDefault(); hideOverlay('editCategoryModal'); };
    var mp = $('editProductModal');
    if(mp && !mp._bgClose){ mp._bgClose = true; mp.addEventListener('click', function(e){ if(e.target === mp) hideOverlay('editProductModal'); }); }
    var mc = $('editCategoryModal');
    if(mc && !mc._bgClose){ mc._bgClose = true; mc.addEventListener('click', function(e){ if(e.target === mc) hideOverlay('editCategoryModal'); }); }

    var saveCat = $('saveEditCategory');
    if(saveCat && !saveCat._fixBound){
      saveCat._fixBound = true;
      saveCat.onclick = async function(e){
        e && e.preventDefault();
        var id = window.editingCategoryId;
        var cat = (data.categories||[]).find(function(c){ return String(c.id) === String(id); });
        if(!cat) return;
        var nameEl = $('editCategoryName');
        var name = nameEl ? nameEl.value.trim() : '';
        if(!name){ if(typeof showToast==='function') showToast('\u0623\u062f\u062e\u0644 \u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645'); return; }
        cat.name = name;
        try { if(typeof upsertCategory==='function') await upsertCategory(cat); } catch(err){}
        try { if(typeof renderSite==='function') renderSite(); } catch(err){}
        try { if(typeof renderAdminLists==='function') renderAdminLists(); } catch(err){}
        hideOverlay('editCategoryModal');
        if(typeof showToast==='function') showToast('\u062a\u0645 \u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0642\u0633\u0645');
      };
    }
  }
  bindClose();
  setTimeout(bindClose, 600);

  if(!document._adminEditFix){
    document._adminEditFix = true;
    document.addEventListener('click', function(e){
      var t = e.target;
      if(!t || !t.closest) return;
      var admin = $('adminModal');
      if(!admin) return;
      if(!admin.classList.contains('show') && admin.style.display === 'none') return;

      var btn = t.closest('[data-act="edit"]');
      if(!btn) return;

      var prodLi = btn.closest('#productsList [data-id]');
      if(!prodLi) prodLi = btn.closest('#productsList li[data-id]');
      if(prodLi){
        var pid = prodLi.getAttribute('data-id');
        if(pid){
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openProductEdit(pid);
          return;
        }
      }

      var catLi = btn.closest('#categoriesList [data-id]');
      if(!catLi) catLi = btn.closest('#categoriesList li[data-id]');
      if(catLi){
        var cid = catLi.getAttribute('data-id');
        if(cid){
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openCategoryEdit(cid);
          return;
        }
      }
    }, true);
  }
})();
