(function(){
  var STYLE_ID = 'edit-ui-colors-fix-v1';

  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#editProductModal .edit-img-box{',
      '  display:flex;flex-direction:column;align-items:center;gap:12px;',
      '  margin-bottom:1rem;padding:12px;border-radius:16px;',
      '  background:linear-gradient(145deg,#1a1810,#12100c);',
      '  border:1px solid rgba(201,162,39,.22);',
      '}',
      '#editProductModal #editProductPreview,',
      '#editProductModal .edit-img-box img{',
      '  max-width:100% !important;',
      '  max-height:180px !important;',
      '  width:auto !important;',
      '  height:auto !important;',
      '  object-fit:contain !important;',
      '  border-radius:14px;',
      '  display:block;',
      '  margin:0 auto;',
      '}',
      '#editProductModal .edit-img-ph{',
      '  width:100%;max-width:160px;height:120px;border-radius:14px;',
      '  display:flex;align-items:center;justify-content:center;',
      '  background:#16140f;border:1px dashed rgba(201,162,39,.3);',
      '  font-size:2.5rem;color:#c9a227;',
      '}',
      '#editProductModal .edit-img-actions{',
      '  display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%;',
      '}',
      '#editUploadImgBtn, #editProductModal .btn-upload-img{',
      '  display:inline-flex !important;align-items:center;justify-content:center;gap:8px;',
      '  padding:11px 18px !important;border-radius:14px !important;',
      '  font-family:inherit !important;font-size:.9rem !important;font-weight:700 !important;',
      '  cursor:pointer;border:none !important;',
      '  background:linear-gradient(145deg,#e8c547,#c9a227,#9a7b1a) !important;',
      '  color:#1a1205 !important;',
      '  box-shadow:0 4px 16px rgba(201,162,39,.35);',
      '  border:1px solid rgba(255,220,120,.4) !important;',
      '  transition:transform .15s, box-shadow .15s;',
      '}',
      '#editUploadImgBtn:active, #editProductModal .btn-upload-img:active{',
      '  transform:scale(.97);',
      '}',
      '#editDeleteImgBtn, #editProductModal .btn-delete-img{',
      '  display:inline-flex !important;align-items:center;justify-content:center;gap:6px;',
      '  padding:11px 16px !important;border-radius:14px !important;',
      '  font-family:inherit !important;font-size:.85rem !important;font-weight:700 !important;',
      '  cursor:pointer;',
      '  background:transparent !important;color:#f87171 !important;',
      '  border:1px solid rgba(239,68,68,.45) !important;',
      '}',
      '.pd-colors{',
      '  margin:12px 0 8px;padding:14px;border-radius:14px;',
      '  background:linear-gradient(145deg,#1a1810,#12100c);',
      '  border:1px solid rgba(201,162,39,.22);',
      '}',
      '.pd-colors h4{',
      '  margin:0 0 10px;font-size:.85rem;color:#c9a227;font-weight:700;',
      '}',
      '.pd-color-chips{display:flex;flex-wrap:wrap;gap:8px;}',
      '.pd-color-chip{',
      '  display:inline-flex;align-items:center;gap:7px;',
      '  padding:7px 12px;border-radius:999px;',
      '  background:#16140f;border:1px solid rgba(201,162,39,.25);',
      '  color:#f0ebe0;font-size:.82rem;font-weight:600;',
      '}',
      '.pd-color-dot{',
      '  width:14px;height:14px;border-radius:50%;',
      '  border:1.5px solid rgba(255,255,255,.25);flex-shrink:0;',
      '}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function escapeHtml(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function parseColors(str){
    if(!str) return [];
    return String(str).split(/[,\u060c;|/]+/).map(function(x){ return x.trim(); }).filter(Boolean);
  }

  function colorHex(name){
    var n = String(name||'').toLowerCase().trim();
    var map = {
      '\u0623\u0633\u0648\u062f':'#1a1a1a', '\u0627\u0633\u0648\u062f':'#1a1a1a', 'black':'#1a1a1a',
      '\u0623\u0628\u064a\u0636':'#f5f5f5', '\u0627\u0628\u064a\u0636':'#f5f5f5', 'white':'#f5f5f5',
      '\u0630\u0647\u0628\u064a':'#d4af37', 'gold':'#d4af37',
      '\u0641\u0636\u064a':'#c0c0c0', 'silver':'#c0c0c0',
      '\u0623\u0632\u0631\u0642':'#1e3a8a', '\u0627\u0632\u0631\u0642':'#1e3a8a', 'blue':'#1e3a8a',
      '\u0623\u062d\u0645\u0631':'#dc2626', '\u0627\u062d\u0645\u0631':'#dc2626', 'red':'#dc2626',
      '\u0623\u062e\u0636\u0631':'#16a34a', '\u0627\u062e\u0636\u0631':'#16a34a', 'green':'#16a34a',
      '\u0648\u0631\u062f\u064a':'#ec4899', 'pink':'#ec4899',
      '\u0628\u0646\u0641\u0633\u062c\u064a':'#a855f7', 'purple':'#a855f7',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645':'#8a8a8a', 'titanium':'#8a8a8a',
      '\u0646\u062d\u0627\u0633\u064a':'#b87333', 'copper':'#b87333',
      '\u0631\u0645\u0627\u062f\u064a':'#6b7280', 'gray':'#6b7280', 'grey':'#6b7280'
    };
    for(var k in map){ if(n.indexOf(k) >= 0) return map[k]; }
    var h = 0;
    for(var i=0;i<n.length;i++) h = ((h<<5)-h)+n.charCodeAt(i);
    return 'hsl('+Math.abs(h)%360+',45%,45%)';
  }

  function chipsHtml(colors){
    if(!colors || !colors.length) return '';
    return '<div class="pd-color-chips">'+colors.map(function(c){
      return '<span class="pd-color-chip"><span class="pd-color-dot" style="background:'+colorHex(c)+'"></span>'+escapeHtml(c)+'</span>';
    }).join('')+'</div>';
  }

  function getColors(id){
    try {
      var p = (data.products||[]).find(function(x){ return x.id === id; });
      if(p && p.colors) {
        var c1 = parseColors(p.colors);
        if(c1.length) return c1;
      }
    } catch(e){}
    try {
      if(typeof getExtra === 'function'){
        var ex = getExtra(id);
        if(ex && ex.colors){
          var c2 = parseColors(ex.colors);
          if(c2.length) return c2;
        }
      }
    } catch(e){}
    try {
      var raw = localStorage.getItem('shop007_product_extras') || localStorage.getItem('product_extras_v1');
      if(raw){
        var all = JSON.parse(raw);
        if(all && all[id] && all[id].colors){
          var c3 = parseColors(all[id].colors);
          if(c3.length) return c3;
        }
      }
    } catch(e){}
    try {
      if(window.__extrasMap && window.__extrasMap[id] && window.__extrasMap[id].colors){
        return parseColors(window.__extrasMap[id].colors);
      }
    } catch(e){}
    return [];
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
    var specs = body.querySelector('.pd-specs');
    var desc = body.querySelector('.pd-desc');
    var actions = body.querySelector('.pd-actions');
    if(specs && specs.parentNode){
      specs.parentNode.insertBefore(box, specs.nextSibling);
    } else if(desc){
      desc.parentNode.insertBefore(box, desc);
    } else if(actions){
      actions.parentNode.insertBefore(box, actions);
    } else {
      body.appendChild(box);
    }
  }

  function styleUploadBtn(){
    var btn = document.getElementById('editUploadImgBtn');
    if(btn){
      btn.innerHTML = '<span style="font-size:1.05rem">\ud83d\udcf7</span><span>\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0646\u062a\u062c</span>';
      btn.className = 'btn-upload-img';
    }
    var del = document.getElementById('editDeleteImgBtn');
    if(del){
      del.innerHTML = '<span>\ud83d\uddd1\ufe0f</span><span>\u062d\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629</span>';
    }
    var img = document.getElementById('editProductPreview');
    if(img){
      img.style.maxWidth = '100%';
      img.style.maxHeight = '180px';
      img.style.objectFit = 'contain';
      img.style.width = 'auto';
      img.style.height = 'auto';
    }
  }

  function hookOpenDetail(){
    if(typeof window.openProductDetail !== 'function') return;
    if(window.openProductDetail._colorFix2) return;
    var orig = window.openProductDetail;
    window.openProductDetail = function(id){
      var r = orig.apply(this, arguments);
      setTimeout(function(){ injectDetailColors(id); }, 20);
      setTimeout(function(){ injectDetailColors(id); }, 120);
      setTimeout(function(){ injectDetailColors(id); }, 400);
      return r;
    };
    window.openProductDetail._colorFix2 = true;
  }

  function hookOpenEdit(){
    if(typeof window.openEditProduct !== 'function') return;
    if(window.openEditProduct._imgFix) return;
    var orig = window.openEditProduct;
    window.openEditProduct = function(id){
      var r = orig.apply(this, arguments);
      setTimeout(styleUploadBtn, 30);
      setTimeout(styleUploadBtn, 150);
      setTimeout(styleUploadBtn, 400);
      return r;
    };
    window.openEditProduct._imgFix = true;
  }

  function boot(){
    injectCss();
    styleUploadBtn();
    hookOpenDetail();
    hookOpenEdit();
  }

  boot();
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  setTimeout(boot, 2500);

  if(typeof MutationObserver !== 'undefined'){
    setTimeout(function(){
      var obs = new MutationObserver(function(){
        var m = document.getElementById('editProductModal');
        if(m && m.classList.contains('show')) styleUploadBtn();
      });
      if(document.body) obs.observe(document.body, { attributes:true, subtree:true, attributeFilter:['class'] });
    }, 500);
  }
})();
