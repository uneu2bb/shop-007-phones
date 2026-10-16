(function(){
  var STYLE_ID = 'colors-display-fix-css-v2';
  if(!document.getElementById(STYLE_ID)){
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.pd-colors{margin:14px 0 8px;padding:14px;border-radius:14px;background:linear-gradient(145deg,#1a1810,#12100c);border:1px solid rgba(201,162,39,.25);}',
      '.pd-colors h4{margin:0 0 10px;font-size:.85rem;color:#c9a227;font-weight:700;}',
      '.pd-color-chips{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;}',
      '.pd-color-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#16140f;border:1px solid rgba(201,162,39,.3);color:#f0ebe0;font-size:.82rem;font-weight:600;}',
      '.pd-color-dot{width:14px;height:14px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);flex-shrink:0;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function esc(t){
    return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function parseColors(str){
    if(!str) return [];
    if(Array.isArray(str)) return str.map(function(x){return String(x).trim();}).filter(Boolean);
    return String(str).split(/[,،|/]+/).map(function(x){return x.trim();}).filter(Boolean);
  }
  function colorHex(name){
    var n = String(name||'').toLowerCase().replace(/\s+/g,'').trim();
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
      return '<span class="pd-color-chip"><span class="pd-color-dot" style="background:'+colorHex(c)+'"></span>'+esc(c)+'</span>';
    }).join('')+'</div>';
  }

  var cloudMap = null;
  var cloudLoading = false;
  function loadCloudMap(cb){
    if(cloudMap){ if(cb) cb(cloudMap); return; }
    if(cloudLoading){ setTimeout(function(){ loadCloudMap(cb); }, 200); return; }
    cloudLoading = true;
    var url = 'https://iqwxrgwaladixagtnayx.supabase.co/storage/v1/object/public/shop-images/meta/product-extras.json?t='+Date.now();
    fetch(url).then(function(r){ return r.ok ? r.json() : {}; }).then(function(map){
      cloudMap = map || {};
      cloudLoading = false;
      try {
        var local = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
        Object.keys(cloudMap).forEach(function(k){
          local[k] = Object.assign({}, local[k]||{}, cloudMap[k]);
        });
        localStorage.setItem('shop007_product_extras_v1', JSON.stringify(local));
      } catch(e){}
      try {
        if(typeof data !== 'undefined' && data && data.products){
          data.products.forEach(function(p){
            var e = cloudMap[p.id] || cloudMap[String(p.id)];
            if(e && e.colors) p.colors = e.colors;
          });
        }
      } catch(e){}
      if(cb) cb(cloudMap);
    }).catch(function(){ cloudLoading = false; cloudMap = cloudMap||{}; if(cb) cb(cloudMap); });
  }

  function getColors(id){
    var sid = String(id);
    try {
      if(typeof data !== 'undefined' && data && data.products){
        for(var i=0;i<data.products.length;i++){
          if(String(data.products[i].id)===sid){
            var a = parseColors(data.products[i].colors);
            if(a.length) return a;
            break;
          }
        }
      }
    } catch(e){}
    try {
      var all = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
      if(all[id] && all[id].colors){ var b=parseColors(all[id].colors); if(b.length) return b; }
      if(all[sid] && all[sid].colors){ var c=parseColors(all[sid].colors); if(c.length) return c; }
    } catch(e){}
    if(cloudMap){
      var e = cloudMap[id] || cloudMap[sid];
      if(e && e.colors){ var d=parseColors(e.colors); if(d.length) return d; }
    }
    return [];
  }

  function injectColors(id){
    var body = document.getElementById('productDetailBody');
    if(!body) return;
    var cols = getColors(id);
    var old = body.querySelector('.pd-colors');
    if(old) old.remove();
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
    } else if(specs && specs.parentNode){
      specs.parentNode.insertBefore(box, specs);
    } else {
      body.appendChild(box);
    }

    if(specs){
      var row = document.createElement('div');
      row.className = 'pd-spec pd-spec-colors';
      row.innerHTML = '<span class="pd-spec-label">\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</span><span class="pd-spec-val">'+esc(cols.join('\u060c '))+'</span>';
      specs.appendChild(row);
    }
  }

  function patchGetExtra(){
    if(typeof window.getExtra === 'function' && !window.getExtra._colorsPatched){
      var orig = window.getExtra;
      window.getExtra = function(id){
        var r = orig.apply(this, arguments) || {};
        var cols = getColors(id);
        if(cols.length) r.colors = cols.join('\u060c ');
        else if(!r.colors) r.colors = '';
        return r;
      };
      window.getExtra._colorsPatched = true;
    }
  }

  function installOpenDetail(){
    if(typeof window.openProductDetail !== 'function') return;
    if(window.openProductDetail._v2Colors) return;
    var orig = window.openProductDetail;
    window.openProductDetail = function(id){
      var r = orig.apply(this, arguments);
      injectColors(id);
      setTimeout(function(){ injectColors(id); }, 50);
      setTimeout(function(){ injectColors(id); }, 200);
      loadCloudMap(function(){ injectColors(id); setTimeout(function(){ injectColors(id); }, 100); });
      return r;
    };
    window.openProductDetail._v2Colors = true;
  }

  function patchSetExtra(){
    if(typeof window.setExtra === 'function' && !window.setExtra._colorsPatched){
      var orig = window.setExtra;
      window.setExtra = function(id, obj){
        var r = orig.apply(this, arguments);
        if(obj && obj.colors != null){
          try {
            if(typeof data !== 'undefined' && data && data.products){
              var p = data.products.find(function(x){ return String(x.id)===String(id); });
              if(p) p.colors = obj.colors;
            }
          } catch(e){}
        }
        return r;
      };
      window.setExtra._colorsPatched = true;
    }
  }

  function boot(){
    loadCloudMap();
    patchGetExtra();
    patchSetExtra();
    installOpenDetail();
  }
  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);
  setInterval(function(){
    if(typeof window.openProductDetail==='function' && !window.openProductDetail._v2Colors){
      installOpenDetail();
    }
  }, 2000);
})();
