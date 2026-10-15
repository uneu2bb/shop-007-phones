(function(){
  var STYLE_ID = 'product-colors-css';

  var COLOR_MAP = {
    'أسود': '#1a1a1a', 'اسود': '#1a1a1a', 'black': '#1a1a1a',
    'أبيض': '#f5f5f5', 'ابيض': '#f5f5f5', 'white': '#f5f5f5',
    'ذهبي': '#c9a227', 'ذهبى': '#c9a227', 'gold': '#c9a227',
    'فضي': '#c0c0c0', 'فضى': '#c0c0c0', 'silver': '#c0c0c0',
    'رمادي': '#6b7280', 'رمادى': '#6b7280', 'gray': '#6b7280', 'grey': '#6b7280',
    'أزرق': '#2563eb', 'ازرق': '#2563eb', 'blue': '#2563eb',
    'أخضر': '#16a34a', 'اخضر': '#16a34a', 'green': '#16a34a',
    'أحمر': '#dc2626', 'احمر': '#dc2626', 'red': '#dc2626',
    'وردي': '#ec4899', 'pink': '#ec4899',
    'بنفسجي': '#7c3aed', 'purple': '#7c3aed',
    'تيتانيوم': '#8a8a8a', 'titanium': '#8a8a8a',
    'صحراوي': '#c2a878', 'desert': '#c2a878',
    'طبيعي': '#d4c4a8', 'natural': '#d4c4a8',
    'كحلي': '#1e3a5f', 'navy': '#1e3a5f',
    'سماوي': '#38bdf8', 'sky': '#38bdf8'
  };

  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.pd-colors{margin:14px 0 4px;padding:14px;border-radius:14px;background:linear-gradient(145deg,#1a1810,#12100c);border:1px solid rgba(201,162,39,.22);}',
      '.pd-colors h4{margin:0 0 10px;font-size:.85rem;color:#c9a227;font-weight:700;}',
      '.pd-color-chips{display:flex;flex-wrap:wrap;gap:8px;}',
      '.pd-color-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#16140f;border:1px solid rgba(201,162,39,.25);color:#f0ebe0;font-size:.82rem;font-weight:600;}',
      '.pd-color-dot{width:14px;height:14px;border-radius:50%;border:1.5px solid rgba(255,255,255,.25);flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.3);}',
      '.color-admin-box{margin-top:8px;}',
      '.color-admin-box .color-hint{font-size:.72rem;color:#888;margin-top:4px;}',
      '.color-preview-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;min-height:0;}',
      '.color-preview-row .pd-color-chip{font-size:.75rem;padding:5px 10px;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function parseColors(str){
    if(!str) return [];
    if(Array.isArray(str)) return str.map(function(x){ return String(x).trim(); }).filter(Boolean);
    return String(str).split(/[,\u060c|/]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  }

  function colorHex(name){
    var k = String(name||'').trim().toLowerCase();
    if(COLOR_MAP[name]) return COLOR_MAP[name];
    for(var key in COLOR_MAP){
      if(key.toLowerCase() === k) return COLOR_MAP[key];
    }
    var h = 0;
    for(var i=0;i<k.length;i++) h = (h*31 + k.charCodeAt(i))|0;
    var hue = Math.abs(h)%360;
    return 'hsl('+hue+',45%,45%)';
  }

  function chipsHtml(colors){
    if(!colors || !colors.length) return '';
    return '<div class="pd-color-chips">'+colors.map(function(c){
      var hex = colorHex(c);
      return '<span class="pd-color-chip"><span class="pd-color-dot" style="background:'+hex+'"></span>'+escapeHtml(c)+'</span>';
    }).join('')+'</div>';
  }

  function escapeHtml(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function getColors(id){
    var p = (window.data && data.products) ? data.products.find(function(x){ return x.id === id; }) : null;
    if(p && p.colors) return parseColors(p.colors);
    if(typeof getExtra === 'function'){
      try {
        var ex = getExtra(id);
        if(ex && ex.colors) return parseColors(ex.colors);
      }catch(e){}
    }
    try {
      var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
      if(all[id] && all[id].colors) return parseColors(all[id].colors);
    }catch(e){}
    return [];
  }

  function setColors(id, colorsArr){
    var str = Array.isArray(colorsArr) ? colorsArr.join('\u060c ') : String(colorsArr||'').trim();
    var p = (window.data && data.products) ? data.products.find(function(x){ return x.id === id; }) : null;
    if(p) p.colors = str;
    if(typeof setExtra === 'function'){
      try { setExtra(id, { colors: str }); }catch(e){}
    } else {
      try {
        var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
        all[id] = Object.assign({}, all[id]||{}, { colors: str });
        localStorage.setItem('shop007_product_extras_v1', JSON.stringify(all));
      }catch(e){}
    }
  }

  function ensureEditColorsField(){
    var body = document.querySelector('#editProductModal .edit-body');
    if(!body || document.getElementById('editProductColors')) return;
    var div = document.createElement('div');
    div.className = 'form-group color-admin-box';
    div.innerHTML =
      '<label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label>' +
      '<input type="text" class="form-control lux-input" id="editProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a\u060c \u0641\u0636\u064a">' +
      '<div class="color-hint">\u0627\u0641\u0635\u0644 \u0628\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0628\u0641\u0627\u0635\u0644\u0629 \u060c</div>' +
      '<div class="color-preview-row" id="editColorsPreview"></div>';
    var desc = document.getElementById('editProductDesc');
    var actions = body.querySelector('.edit-actions');
    if(desc && desc.closest('.form-group')){
      desc.closest('.form-group').parentNode.insertBefore(div, desc.closest('.form-group'));
    } else if(actions){
      body.insertBefore(div, actions);
    } else {
      body.appendChild(div);
    }
    var inp = document.getElementById('editProductColors');
    if(inp){
      inp.addEventListener('input', function(){
        var prev = document.getElementById('editColorsPreview');
        if(prev) prev.innerHTML = chipsHtml(parseColors(inp.value));
      });
    }
  }

  function ensureAdminAddColors(){
    var tab = document.getElementById('tab-products');
    if(!tab || document.getElementById('adminProductColors')) return;
    var addBtn = document.getElementById('addProductBtn');
    if(!addBtn) return;
    var div = document.createElement('div');
    div.className = 'form-group color-admin-box';
    div.innerHTML =
      '<label>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</label>' +
      '<input type="text" class="form-control" id="adminProductColors" placeholder="\u0623\u0633\u0648\u062f\u060c \u0630\u0647\u0628\u064a\u060c \u0641\u0636\u064a">' +
      '<div class="color-hint">\u0627\u0641\u0635\u0644 \u0628\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0628\u0641\u0627\u0635\u0644\u0629 \u060c</div>';
    addBtn.parentNode.insertBefore(div, addBtn);
  }

  function fillEditColors(id){
    ensureEditColorsField();
    var inp = document.getElementById('editProductColors');
    if(!inp) return;
    var cols = getColors(id);
    inp.value = cols.join('\u060c ');
    var prev = document.getElementById('editColorsPreview');
    if(prev) prev.innerHTML = chipsHtml(cols);
  }

  function injectDetailColors(id){
    var body = document.getElementById('productDetailBody');
    if(!body) return;
    var existing = body.querySelector('.pd-colors');
    if(existing) existing.remove();
    var cols = getColors(id);
    if(!cols.length) return;
    var box = document.createElement('div');
    box.className = 'pd-colors';
    box.innerHTML = '<h4>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</h4>' + chipsHtml(cols);
    var desc = body.querySelector('.pd-desc');
    var btn = body.querySelector('.pd-add-btn, .btn-primary, button');
    if(desc) desc.parentNode.insertBefore(box, desc);
    else if(btn) btn.parentNode.insertBefore(box, btn);
    else body.appendChild(box);
  }

  function hookOpenDetail(){
    if(typeof window.openProductDetail !== 'function') return;
    if(window.openProductDetail._colors) return;
    var orig = window.openProductDetail;
    window.openProductDetail = function(id){
      var r = orig.apply(this, arguments);
      setTimeout(function(){ injectDetailColors(id); }, 30);
      setTimeout(function(){ injectDetailColors(id); }, 150);
      return r;
    };
    window.openProductDetail._colors = true;
  }

  function hookOpenEdit(){
    ['openEditProduct','editProduct'].forEach(function(name){
      if(typeof window[name] !== 'function' || window[name]._colors) return;
      var orig = window[name];
      window[name] = function(id){
        ensureEditColorsField();
        var r = orig.apply(this, arguments);
        setTimeout(function(){ fillEditColors(id); }, 50);
        setTimeout(function(){ fillEditColors(id); }, 200);
        return r;
      };
      window[name]._colors = true;
    });
  }

  function hookSaveEdit(){
    var btn = document.getElementById('saveEditProduct');
    if(!btn || btn._colorsHooked) return;
    btn._colorsHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev){
      var id = (typeof editingProductId !== 'undefined') ? editingProductId : null;
      if(!id && window._editingProductId) id = window._editingProductId;
      var inp = document.getElementById('editProductColors');
      if(id && inp){
        setColors(id, parseColors(inp.value));
      }
      var result;
      if(typeof prev === 'function') result = await prev.call(btn, ev);
      if(typeof saveProductExtrasCloud === 'function'){
        try { await saveProductExtrasCloud(); }catch(e){}
      }
      return result;
    };
  }

  function hookAddProduct(){
    var btn = document.getElementById('addProductBtn');
    if(!btn || btn._colorsAddHooked) return;
    btn._colorsAddHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev){
      var before = (data.products||[]).map(function(p){ return p.id; });
      var result;
      if(typeof prev === 'function') result = await prev.call(btn, ev);
      var added = (data.products||[]).find(function(p){ return before.indexOf(p.id) < 0; });
      var inp = document.getElementById('adminProductColors');
      if(added && inp && inp.value.trim()){
        setColors(added.id, parseColors(inp.value));
        if(typeof saveProductExtrasCloud === 'function'){
          try { await saveProductExtrasCloud(); }catch(e){}
        }
        inp.value = '';
      }
      return result;
    };
  }

  function patchExtrasCloud(){
    try {
      var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
      (data.products||[]).forEach(function(p){
        if(all[p.id] && all[p.id].colors) p.colors = all[p.id].colors;
      });
    }catch(e){}

    if(typeof saveProductExtrasCloud === 'function' && !saveProductExtrasCloud._colors){
      var orig = saveProductExtrasCloud;
      saveProductExtrasCloud = async function(){
        try {
          var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
          (data.products||[]).forEach(function(p){
            if(p.colors != null){
              all[p.id] = Object.assign({}, all[p.id]||{}, { colors: p.colors });
            }
          });
          localStorage.setItem('shop007_product_extras_v1', JSON.stringify(all));
        }catch(e){}
        return orig.apply(this, arguments);
      };
      saveProductExtrasCloud._colors = true;
    }
  }

  function boot(){
    injectCss();
    ensureEditColorsField();
    ensureAdminAddColors();
    hookOpenDetail();
    hookOpenEdit();
    hookSaveEdit();
    hookAddProduct();
    patchExtrasCloud();
  }

  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);

  var _rs = window.renderSite;
  if(typeof _rs === 'function' && !_rs._colorsPatched){
    window.renderSite = function(){
      var r = _rs.apply(this, arguments);
      setTimeout(boot, 30);
      return r;
    };
    window.renderSite._colorsPatched = true;
  }
})();
