(function(){
  var STYLE_ID = 'colors-display-fix-css';
  if(!document.getElementById(STYLE_ID)){
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.pd-colors{margin:14px 0 6px;padding:14px;border-radius:14px;background:linear-gradient(145deg,#1a1810,#12100c);border:1px solid rgba(201,162,39,.22);}',
      '.pd-colors h4{margin:0 0 10px;font-size:.85rem;color:#c9a227;font-weight:700;}',
      '.pd-color-chips{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;}',
      '.pd-color-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#16140f;border:1px solid rgba(201,162,39,.28);color:#f0ebe0;font-size:.82rem;font-weight:600;}',
      '.pd-color-dot{width:14px;height:14px;border-radius:50%;border:1.5px solid rgba(255,255,255,.28);flex-shrink:0;box-shadow:0 0 0 1px rgba(0,0,0,.35);}',
      '.pd-spec-colors .pd-color-chips{margin-top:4px;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function escapeHtml(t){
    return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function parseColors(str){
    if(!str) return [];
    if(Array.isArray(str)) return str.map(function(x){return String(x).trim();}).filter(Boolean);
    return String(str).split(/[,،|/]+/).map(function(x){return x.trim();}).filter(Boolean);
  }

  function colorHex(name){
    var n = String(name||'').toLowerCase().trim();
    var map = {
      '\u0627\u0633\u0648\u062f':'#1a1a1a','\u0623\u0633\u0648\u062f':'#1a1a1a','black':'#1a1a1a',
      '\u0627\u0628\u064a\u0636':'#f5f5f5','\u0623\u0628\u064a\u0636':'#f5f5f5','white':'#f5f5f5',
      '\u0630\u0647\u0628\u064a':'#c9a227','\u0630\u0647\u0628':'#c9a227','gold':'#c9a227',
      '\u0641\u0636\u064a':'#c0c0c0','silver':'#c0c0c0',
      '\u0627\u0632\u0631\u0642':'#2b6cb0','\u0623\u0632\u0631\u0642':'#2b6cb0','blue':'#2b6cb0',
      '\u0627\u062d\u0645\u0631':'#c53030','\u0623\u062d\u0645\u0631':'#c53030','red':'#c53030',
      '\u0627\u062e\u0636\u0631':'#2f855a','\u0623\u062e\u0636\u0631':'#2f855a','green':'#2f855a',
      '\u0648\u0631\u062f\u064a':'#d53f8c','pink':'#d53f8c',
      '\u0628\u0646\u0641\u0633\u062c\u064a':'#6b46c1','purple':'#6b46c1',
      '\u0631\u0645\u0627\u062f\u064a':'#718096','gray':'#718096','grey':'#718096',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645':'#8a8580','titanium':'#8a8580',
      '\u0633\u0645\u0627\u0648\u064a':'#0bc5ea','cyan':'#0bc5ea',
      '\u0628\u0631\u062a\u0642\u0627\u0644\u064a':'#dd6b20','orange':'#dd6b20',
      '\u0627\u0635\u0641\u0631':'#d69e2e','\u0623\u0635\u0641\u0631':'#d69e2e','yellow':'#d69e2e',
      '\u0646\u062d\u0627\u0633\u064a':'#b87333','copper':'#b87333',
      '\u0628\u064a\u062c':'#d4b896','beige':'#d4b896'
    };
    if(map[n]) return map[n];
    for(var k in map){ if(n.indexOf(k)>=0) return map[k]; }
    var h=0; for(var i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h);
    var c=(h&0x00ffffff).toString(16).toUpperCase();
    return '#'+('00000'.substring(0,6-c.length))+c;
  }

  function chipsHtml(colors){
    if(!colors||!colors.length) return '';
    return '<div class="pd-color-chips">'+colors.map(function(c){
      return '<span class="pd-color-chip"><span class="pd-color-dot" style="background:'+colorHex(c)+'"></span>'+escapeHtml(c)+'</span>';
    }).join('')+'</div>';
  }

  function getData(){
    try{ if(typeof data!=='undefined'&&data) return data; }catch(e){}
    try{ if(window.data) return window.data; }catch(e){}
    return null;
  }

  function getColors(id){
    var d = getData();
    var p = d && (d.products||[]).find(function(x){ return String(x.id)===String(id); });
    if(p && p.colors){
      var a = parseColors(p.colors);
      if(a.length) return a;
    }
    try{
      if(typeof getExtra==='function'){
        var ex = getExtra(id);
        if(ex && ex.colors){
          var b = parseColors(ex.colors);
          if(b.length) return b;
        }
      }
    }catch(e){}
    try{
      var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
      if(all[id] && all[id].colors){
        var c = parseColors(all[id].colors);
        if(c.length) return c;
      }
    }catch(e){}
    return [];
  }

  function injectIntoBody(id){
    var body = document.getElementById('productDetailBody');
    if(!body) return;
    var cols = getColors(id);
    var existing = body.querySelector('.pd-colors');
    if(existing) existing.remove();
    body.querySelectorAll('.pd-spec-colors').forEach(function(el){ el.remove(); });
    if(!cols.length) return;

    var box = document.createElement('div');
    box.className = 'pd-colors';
    box.innerHTML = '<h4>\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</h4>' + chipsHtml(cols);

    var price = body.querySelector('.pd-price');
    var specs = body.querySelector('.pd-specs');
    if(price && price.parentNode){
      if(price.nextSibling) price.parentNode.insertBefore(box, price.nextSibling);
      else price.parentNode.appendChild(box);
    } else if(specs){
      specs.parentNode.insertBefore(box, specs);
    } else {
      body.appendChild(box);
    }

    if(specs){
      var row = document.createElement('div');
      row.className = 'pd-spec pd-spec-colors';
      row.innerHTML = '<span class="pd-spec-label">\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</span><span class="pd-spec-val">'+escapeHtml(cols.join('\u060c '))+'</span>';
      specs.appendChild(row);
    }
  }

  function patchOpenDetail(){
    if(typeof window.openProductDetail !== 'function') return;
    var current = window.openProductDetail;
    if(current._cdfWrapped) return;
    var orig = current;
    function wrapped(id){
      var r = orig.apply(this, arguments);
      setTimeout(function(){ injectIntoBody(id); }, 20);
      setTimeout(function(){ injectIntoBody(id); }, 120);
      setTimeout(function(){ injectIntoBody(id); }, 350);
      return r;
    }
    wrapped._cdfWrapped = true;
    wrapped._orig = orig;
    window.openProductDetail = wrapped;
  }

  function hookSave(){
    var btn = document.getElementById('saveEditProduct');
    if(!btn || btn._cdfSave) return;
    btn._cdfSave = true;
    btn.addEventListener('click', function(){
      try{
        var id = window.editingProductId;
        var inp = document.getElementById('editProductColors');
        if(!id || !inp) return;
        var str = (inp.value||'').trim();
        var d = getData();
        var p = d && (d.products||[]).find(function(x){ return String(x.id)===String(id); });
        if(p) p.colors = str;
        try{
          if(typeof setExtra==='function') setExtra(id, { colors: str });
        }catch(e){}
        try{
          var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
          all[id] = Object.assign({}, all[id]||{}, { colors: str });
          localStorage.setItem('shop007_product_extras_v1', JSON.stringify(all));
        }catch(e){}
        setTimeout(function(){
          if(typeof saveProductExtrasCloud==='function') saveProductExtrasCloud();
        }, 200);
      }catch(e){}
    }, true);
  }

  function boot(){
    patchOpenDetail();
    hookSave();
  }
  boot();
  setTimeout(boot, 400);
  setTimeout(boot, 1200);
  setTimeout(boot, 2500);
  setInterval(function(){
    if(typeof window.openProductDetail==='function' && !window.openProductDetail._cdfWrapped){
      patchOpenDetail();
    }
  }, 1500);
})();
