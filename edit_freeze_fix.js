(function(){
  var opening = false;
  var lastId = null;

  function showEditModal(){
    var m = document.getElementById('editProductModal');
    if(!m) return;
    m.style.zIndex = '1600';
    m.style.position = 'fixed';
    m.style.inset = '0';
    m.style.display = 'flex';
    m.style.alignItems = 'flex-end';
    m.style.justifyContent = 'center';
    m.style.background = 'rgba(0,0,0,.82)';
    m.classList.add('show');
  }

  function hideEditModal(){
    var m = document.getElementById('editProductModal');
    if(!m) return;
    m.classList.remove('show');
    m.style.display = 'none';
  }

  function ensureExtrasOnce(){
    try{
      var body = document.querySelector('#editProductModal .edit-body');
      if(!body || document.getElementById('editProductCondition')) return;
      var div = document.createElement('div');
      div.className = 'edit-extra-fields';
      div.innerHTML =
        '<div class="form-group"><label>\u0627\u0644\u062d\u0627\u0644\u0629</label>' +
        '<select id="editProductCondition" class="form-control lux-input">' +
        '<option value="new">\u062c\u062f\u064a\u062f</option><option value="used">\u0645\u0633\u062a\u0639\u0645\u0644</option></select></div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>\u0627\u0644\u0633\u0639\u0629</label><input type="text" class="form-control lux-input" id="editProductStorage" placeholder="256GB"></div>' +
        '<div class="form-group"><label>\u0627\u0644\u0631\u0627\u0645</label><input type="text" class="form-control lux-input" id="editProductRam" placeholder="8GB"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="form-group"><label>\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0629 %</label><input type="number" class="form-control lux-input" id="editProductBattery" min="0" max="100"></div>' +
        '<div class="form-group"><label>\u0646\u0638\u0627\u0641\u0629 \u0627\u0644\u062c\u0647\u0627\u0632</label><input type="number" class="form-control lux-input" id="editProductClean" min="0" max="100"></div>' +
        '</div>' +
        '<div class="form-group"><label>\u0648\u0635\u0641 \u0627\u0644\u062c\u0647\u0627\u0632</label><textarea class="form-control lux-input" id="editProductDesc" rows="2"></textarea></div>' +
        '<div class="form-group"><label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label>' +
        '<input type="text" class="form-control lux-input" id="editProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a\u060c \u0641\u0636\u064a">' +
        '<div style="font-size:.72rem;color:#888;margin-top:4px">\u0627\u0641\u0635\u0644 \u0628\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0628\u0641\u0627\u0635\u0644\u0629 \u060c</div></div>';
      body.appendChild(div);
    }catch(e){}
  }

  function fillFields(id){
    var p = null;
    try{ p = (data.products||[]).find(function(x){ return x.id === id; }); }catch(e){}
    if(!p) return;

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
      img.style.maxHeight = '160px';
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

    var ex = { condition:'new', storage:'', ram:'', battery:null, cleanliness:null, description:'', colors:'' };
    try{
      if(typeof getExtra === 'function'){
        var g = getExtra(id);
        if(g) ex = Object.assign(ex, g);
      }
    }catch(e){}
    if(p.condition) ex.condition = p.condition;
    if(p.storage) ex.storage = p.storage;
    if(p.ram) ex.ram = p.ram;
    if(p.battery != null) ex.battery = p.battery;
    if(p.cleanliness != null) ex.cleanliness = p.cleanliness;
    if(p.description) ex.description = p.description;
    if(p.colors) ex.colors = p.colors;

    function set(eid, val){
      var el = document.getElementById(eid);
      if(el) el.value = val != null ? val : '';
    }
    set('editProductCondition', ex.condition || 'new');
    set('editProductStorage', ex.storage || '');
    set('editProductRam', ex.ram || '');
    set('editProductBattery', ex.battery != null ? ex.battery : '');
    set('editProductClean', ex.cleanliness != null ? ex.cleanliness : '');
    set('editProductDesc', ex.description || '');
    set('editProductColors', ex.colors || '');
  }

  window.openEditProduct = function(id){
    if(opening && lastId === id) return;
    opening = true;
    lastId = id;

    try{
      ensureExtrasOnce();
      fillFields(id);
      showEditModal();

      var btn = document.getElementById('editUploadImgBtn');
      if(btn){
        btn.style.background = 'linear-gradient(145deg,#e8c547,#c9a227)';
        btn.style.color = '#1a1205';
        btn.style.borderRadius = '14px';
        btn.style.padding = '11px 18px';
        btn.style.fontWeight = '700';
        btn.style.border = 'none';
      }
    }catch(e){
      console.warn('openEditProduct', e);
      try{ showEditModal(); }catch(e2){}
    }

    setTimeout(function(){ opening = false; }, 400);
  };

  function hideEditModalSafe(){
    hideEditModal();
    opening = false;
  }

  function bindClose(){
    var closeBtn = document.getElementById('closeEditProduct');
    var cancelBtn = document.getElementById('cancelEditProduct');
    var modal = document.getElementById('editProductModal');
    if(closeBtn) closeBtn.onclick = hideEditModalSafe;
    if(cancelBtn) cancelBtn.onclick = hideEditModalSafe;
    if(modal && !modal._safeClose){
      modal._safeClose = true;
      modal.addEventListener('click', function(e){
        if(e.target === modal) hideEditModalSafe();
      });
    }
  }

  function bindAdminDelegation(){
    var list = document.getElementById('productsList');
    if(!list || list._editDeleg) return;
    list._editDeleg = true;
    list.addEventListener('click', function(e){
      var btn = e.target.closest('[data-act="edit"]');
      if(!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var li = btn.closest('[data-id]');
      if(!li) return;
      var id = li.getAttribute('data-id');
      if(id) window.openEditProduct(id);
    }, true);
  }

  bindClose();
  bindAdminDelegation();
  setTimeout(bindClose, 500);
  setTimeout(bindAdminDelegation, 500);
  setTimeout(bindAdminDelegation, 1500);
  setTimeout(function(){
    window.openEditProduct = window.openEditProduct;
  }, 2000);
})();
