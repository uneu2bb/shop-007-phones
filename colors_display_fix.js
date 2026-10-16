(function(){
  var STYLE_ID = 'colors-display-fix-css-v3';
  if(!document.getElementById(STYLE_ID)){
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.pd-colors{margin:14px 0 8px;padding:14px;border-radius:14px;background:linear-gradient(145deg,#1a1810,#12100c);border:1px solid rgba(201,162,39,.28);}',
      '.pd-colors h4{margin:0 0 10px;font-size:.85rem;color:#c9a227;font-weight:700;}',
      '.pd-color-chips{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;}',
      '.pd-color-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:#16140f;border:1px solid rgba(201,162,39,.32);color:#f0ebe0;font-size:.82rem;font-weight:600;}',
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
    if(!name) return '#6c757d';
    var cleanName = String(name).trim();
    var colorMap = {
      '\u062e\u0645\u0631\u064a': '#722f37',
      '\u0639\u0646\u0627\u0628\u064a': '#800020',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645 \u0635\u062d\u0631\u0627\u0648\u064a': '#c2b29f',
      '\u0635\u062d\u0631\u0627\u0648\u064a': '#c2b29f',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645 \u0637\u0628\u064a\u0639\u064a': '#878681',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645': '#878681',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645 \u0623\u0633\u0648\u062f': '#232426',
      '\u0623\u0633\u0648\u062f \u0641\u062e\u0645': '#1a1a1a',
      '\u062a\u064a\u062a\u0627\u0646\u064a\u0648\u0645 \u0623\u0628\u064a\u0636': '#f2f1ed',
      '\u0646\u064a\u0644\u064a': '#1f3044',
      '\u0623\u0632\u0631\u0642 \u062f\u0627\u0643\u0646': '#1b263b',
      '\u0623\u0633\u0648\u062f': '#000000',
      '\u0623\u0628\u064a\u0636': '#ffffff',
      '\u0643\u062d\u0644\u064a': '#0d1b2a',
      '\u0631\u0645\u0627\u062f\u064a': '#4a4a4a',
      '\u0641\u0636\u064a': '#e0e0e0',
      '\u0630\u0647\u0628\u064a': '#d4af37',
      '\u0632\u064a\u062a\u064a': '#3b4d3a',
      '\u0623\u062e\u0636\u0631 \u063a\u0627\u0645\u0642': '#1b4332',
      '\u0648\u0631\u062f\u064a': '#ffccd5',
      '\u0632\u0647\u0631\u064a': '#ffb6c1',
      '\u0628\u0646\u0641\u0633\u062c\u064a': '#3a0ca3',
      '\u0627\u0633\u0648\u062f': '#000000',
      '\u0627\u0628\u064a\u0636': '#ffffff',
      '\u0627\u062d\u0645\u0631': '#c53030',
      '\u0623\u062d\u0645\u0631': '#c53030',
      '\u0627\u062e\u0636\u0631': '#2f855a',
      '\u0623\u062e\u0636\u0631': '#2f855a',
      '\u0627\u0632\u0631\u0642': '#2b6cb0',
      '\u0623\u0632\u0631\u0642': '#2b6cb0',
      '\u0628\u0631\u062a\u0642\u0627\u0644\u064a': '#dd6b20',
      '\u0623\u0635\u0641\u0631': '#d69e2e',
      '\u0627\u0635\u0641\u0631': '#d69e2e'
    };
    if(colorMap[cleanName]) return colorMap[cleanName];
    var keys = Object.keys(colorMap).sort(function(a,b){ return b.length - a.length; });
    for(var i=0;i<keys.length;i++){
      if(cleanName.indexOf(keys[i]) >= 0) return colorMap[keys[i]];
    }
    return '#6c757d';
  }
  function getDynamicColor(colorName){
    return colorHex(colorName);
  }
  function chipsHtml(colors){
    if(!colors||!colors.length) return '';
    return '<div class="pd-color-chips">'+colors.map(function(c){
      return '<span class="pd-color-chip"><span class="pd-color-dot" style="background:'+getDynamicColor(c)+'"></span>'+esc(c)+'</span>';
    }).join('')+'</div>';
  }

  var cloudMap = null;
  function loadCloud(cb){
    if(cloudMap){ if(cb) cb(cloudMap); return; }
    var url = 'https://iqwxrgwaladixagtnayx.supabase.co/storage/v1/object/public/shop-images/meta/product-extras.json?t='+Date.now();
    fetch(url).then(function(r){ return r.ok ? r.json() : {}; }).then(function(map){
      cloudMap = map || {};
      try {
        var local = JSON.parse(localStorage.getItem('shop007_product_extras_v1')||'{}')||{};
        Object.keys(cloudMap).forEach(function(k){ local[k] = Object.assign({}, local[k]||{}, cloudMap[k]); });
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
    }).catch(function(){ cloudMap = cloudMap||{}; if(cb) cb(cloudMap); });
  }

  function getColorsById(id){
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
      if(all[sid] && all[sid].colors){ var b=parseColors(all[sid].colors); if(b.length) return b; }
      if(all[id] && all[id].colors){ var c=parseColors(all[id].colors); if(c.length) return c; }
    } catch(e){}
    if(cloudMap){
      var e = cloudMap[sid] || cloudMap[id];
      if(e && e.colors){ var d=parseColors(e.colors); if(d.length) return d; }
    }
    return [];
  }

  function getColorsByName(name){
    if(!name) return [];
    var n = String(name).trim().toLowerCase();
    try {
      if(typeof data !== 'undefined' && data && data.products){
        for(var i=0;i<data.products.length;i++){
          var p = data.products[i];
          if(String(p.name||'').trim().toLowerCase()===n){
            var cols = getColorsById(p.id);
            if(cols.length) return cols;
            if(cloudMap && cloudMap[p.id]) return parseColors(cloudMap[p.id].colors);
          }
        }
      }
    } catch(e){}
    return [];
  }

  function injectIntoDetail(cols){
    var body = document.getElementById('productDetailBody');
    if(!body || !cols || !cols.length) return false;
    if(body.querySelector('.pd-colors')) return true;
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
    if(specs && !specs.querySelector('.pd-spec-colors')){
      var row = document.createElement('div');
      row.className = 'pd-spec pd-spec-colors';
      row.innerHTML = '<span class="pd-spec-label">\u0627\u0644\u0623\u0644\u0648\u0627\u0646 \u0627\u0644\u0645\u062a\u0648\u0641\u0631\u0629</span><span class="pd-spec-val">'+esc(cols.join('\u060c '))+'</span>';
      specs.appendChild(row);
    }
    return true;
  }

  function tryInject(){
    var body = document.getElementById('productDetailBody');
    var modal = document.getElementById('productDetailModal');
    if(!body || !modal) return;
    if(!modal.classList.contains('show') && modal.style.display === 'none') return;
    if(body.querySelector('.pd-colors')) return;

    var titleEl = body.querySelector('.pd-title, h2');
    var name = titleEl ? titleEl.textContent.trim() : '';
    var cols = getColorsByName(name);
    if(!cols.length && name){
      try {
        if(typeof data !== 'undefined' && data && data.products){
          for(var i=0;i<data.products.length;i++){
            var pn = String(data.products[i].name||'');
            if(pn && (name.indexOf(pn)>=0 || pn.indexOf(name)>=0)){
              cols = getColorsById(data.products[i].id);
              if(cols.length) break;
            }
          }
        }
      } catch(e){}
    }
    if(cols.length) injectIntoDetail(cols);
  }

  function watchModal(){
    var modal = document.getElementById('productDetailModal');
    if(!modal) return;
    if(modal._colorsObs) return;
    modal._colorsObs = true;
    var obs = new MutationObserver(function(){
      setTimeout(tryInject, 30);
      setTimeout(tryInject, 150);
      setTimeout(function(){ loadCloud(function(){ tryInject(); }); }, 50);
    });
    obs.observe(modal, { attributes:true, attributeFilter:['class','style'], childList:true, subtree:true });
  }

  var bodyObs = new MutationObserver(function(){
    watchModal();
    tryInject();
  });
  bodyObs.observe(document.documentElement, { childList:true, subtree:true });

  document.addEventListener('click', function(){
    setTimeout(tryInject, 80);
    setTimeout(tryInject, 250);
    setTimeout(function(){ loadCloud(function(){ tryInject(); }); }, 100);
  }, true);

  loadCloud(function(){});
  setTimeout(watchModal, 500);
  setTimeout(watchModal, 1500);
  setInterval(function(){ watchModal(); tryInject(); }, 2000);
})();
