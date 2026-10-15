(function(){
  var opening = false;

  function $(id){ return document.getElementById(id); }

  function showModal(){
    var m = $('editProductModal');
    if(!m) return;
    m.classList.add('show');
    m.style.cssText = 'display:flex!important;z-index:2000!important;position:fixed;inset:0;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.85);padding:0;';
  }

  function hideModal(){
    var m = $('editProductModal');
    if(!m) return;
    m.classList.remove('show');
    m.style.display = 'none';
    opening = false;
  }

  function ensureFields(){
    var body = document.querySelector('#editProductModal .edit-body');
    if(!body || $('editProductCondition')) return;
    var div = document.createElement('div');
    div.id = 'editExtrasBox';
    div.innerHTML =
      '<div class="form-group"><label>\u0627\u0644\u062d\u0627\u0644\u0629</label>' +
      '<select id="editProductCondition" class="form-control lux-input"><option value="new">\u062c\u062f\u064a\u062f</option><option value="used">\u0645\u0633\u062a\u0639\u0645\u0644</option></select></div>' +
      '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0633\u0639\u0629</label><input type="text" class="form-control lux-input" id="editProductStorage"></div>' +
      '<div class="form-group"><label>\u0627\u0644\u0631\u0627\u0645</label><input type="text" class="form-control lux-input" id="editProductRam"></div></div>' +
      '<div class="form-row"><div class="form-group"><label>\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0629 %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100"></div>' +
      '<div class="form-group"><label>\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062c\u0647\u0627\u0632</label><input type="number" class="form-control lux-input" id="editProductClean" min="0" max="100"></div></div>' +
      '<div class="form-group"><label>\u0648\u0635\u0641 \u0627\u0644\u062c\u0647\u0627\u0632</label><textarea class="form-control lux-input" id="editProductDesc" rows="2"></textarea></div>' +
      '<div class="form-group"><label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label><input type="text" class="form-control lux-input" id="editProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a\u060c \u0641\u0636\u064a"></div>';
    body.appendChild(div);
  }

  function setVal(id, v){
    var el = $(id);
    if(el) el.value = (v != null && v !== undefined) ? v : '';
  }

  function openEdit(id){
    if(opening) return;
    opening = true;
    try {
      if(typeof data === 'undefined' || !data.products){
        opening = false;
        return;
      }
      var p = data.products.find(function(x){ return String(x.id) === String(id); });
      if(!p){
        opening = false;
        if(typeof showToast === 'function') showToast('\u0627\u0644\u0645\u0646\u062a\u062c \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f');
        return;
      }

      window.editingProductId = p.id;
      try { editingProductId = p.id; } catch(e){}

      ensureFields();

      setVal('editProductName', p.name);
      setVal('editProductUsd', p.priceUsd);
      setVal('editProductSyp', p.priceSyp);

      var img = $('editProductPreview');
      var ph = $('editProductPreviewPh');
      if(img){
        img.style.maxHeight = '150px';
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

      var cond = p.condition || 'new';
      var storage = p.storage || '';
      var ram = p.ram || '';
      var battery = p.battery != null ? p.battery : '';
      var clean = p.cleanliness != null ? p.cleanliness : '';
      var desc = p.description || '';
      var colors = p.colors || '';
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

      setVal('editProductCondition', cond);
      setVal('editProductStorage', storage);
      setVal('editProductRam', ram);
      setVal('editProductBattery', battery);
      setVal('editProductClean', clean);
      setVal('editProductDesc', desc);
      setVal('editProductColors', colors);

      showModal();
    } catch(err){
      console.warn('openEdit error', err);
      try { showModal(); } catch(e2){}
    }
    setTimeout(function(){ opening = false; }, 300);
  }

  function lockOpenEdit(){
    try {
      Object.defineProperty(window, 'openEditProduct', {
        value: openEdit,
        writable: true,
        configurable: true
      });
    } catch(e){
      window.openEditProduct = openEdit;
    }
  }
  lockOpenEdit();

  var n = 0;
  var iv = setInterval(function(){
    lockOpenEdit();
    n++;
    if(n > 20) clearInterval(iv);
  }, 250);

  function onAdminClick(e){
    var t = e.target;
    if(!t) return;
    var editBtn = t.closest ? t.closest('[data-act="edit"]') : null;
    if(!editBtn){
      if(t.tagName === 'BUTTON' && (t.textContent||'').trim() === '\u062a\u0639\u062f\u064a\u0644'){
        editBtn = t;
      }
    }
    if(editBtn){
      var li = editBtn.closest('[data-id]');
      if(!li) li = editBtn.closest('li');
      if(li){
        var id = li.getAttribute('data-id');
        if(id){
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openEdit(id);
          return false;
        }
      }
    }
  }

  function bindCapture(){
    if(document._editCaptureBound) return;
    document._editCaptureBound = true;
    document.addEventListener('click', function(e){
      var admin = $('adminModal');
      if(!admin || !admin.classList.contains('show')) return;
      onAdminClick(e);
    }, true);
  }
  bindCapture();
  setTimeout(bindCapture, 500);

  function bindClose(){
    var closeBtn = $('closeEditProduct');
    var cancelBtn = $('cancelEditProduct');
    if(closeBtn) closeBtn.onclick = function(e){ e && e.preventDefault(); hideModal(); };
    if(cancelBtn) cancelBtn.onclick = function(e){ e && e.preventDefault(); hideModal(); };
    var m = $('editProductModal');
    if(m && !m._closeBound2){
      m._closeBound2 = true;
      m.addEventListener('click', function(e){ if(e.target === m) hideModal(); });
    }
  }
  bindClose();
  setTimeout(bindClose, 800);

  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('.card-edit-btn');
    if(!btn) return;
    var card = btn.closest('[data-id]');
    if(card && card.getAttribute('data-id')){
      e.preventDefault();
      e.stopPropagation();
      openEdit(card.getAttribute('data-id'));
    }
  }, true);
})();
