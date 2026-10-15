(function(){
  var CACHE_KEY = 'shop007_swr_v1';
  var hydrated = false;

  function safeParse(s){
    try { return JSON.parse(s); } catch(e){ return null; }
  }

  function readCache(){
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return null;
      var obj = safeParse(raw);
      if(!obj || !obj.products || !obj.categories) return null;
      return obj;
    } catch(e){ return null; }
  }

  function writeCache(d){
    try {
      var payload = {
        shopName: d.shopName || '007',
        logo: d.logo || null,
        cover: d.cover || null,
        whatsapp: d.whatsapp || '',
        facebook: d.facebook || '',
        instagram: d.instagram || '',
        categories: (d.categories || []).map(function(c){
          return { id: c.id, name: c.name, hidden: !!c.hidden, sort_order: c.sort_order };
        }),
        products: (d.products || []).map(function(p){
          return {
            id: p.id, name: p.name, categoryId: p.categoryId,
            priceUsd: p.priceUsd, priceSyp: p.priceSyp,
            image: p.image || null, hidden: !!p.hidden, sort_order: p.sort_order,
            condition: p.condition || 'new', storage: p.storage || '', ram: p.ram || '',
            battery: p.battery, cleanliness: p.cleanliness,
            description: p.description || '',
            colors: p.colors || ''
          };
        }),
        ts: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch(e){}
  }

  function applyToData(cached){
    if(typeof data === 'undefined') return;
    data.shopName = cached.shopName || data.shopName;
    data.logo = cached.logo || null;
    data.cover = cached.cover || null;
    data.whatsapp = cached.whatsapp || '';
    data.facebook = cached.facebook || '';
    data.instagram = cached.instagram || '';
    data.categories = cached.categories || [];
    data.products = cached.products || [];
  }

  function snapshotHash(d){
    try {
      return JSON.stringify({
        n: d.shopName, l: d.logo, c: d.cover,
        w: d.whatsapp, f: d.facebook, i: d.instagram,
        cats: (d.categories||[]).map(function(x){ return [x.id,x.name,x.hidden,x.sort_order]; }),
        prods: (d.products||[]).map(function(x){
          return [x.id,x.name,x.categoryId,x.priceUsd,x.priceSyp,x.image,x.hidden,x.condition,x.storage,x.ram,x.battery,x.cleanliness,x.description,x.colors];
        })
      });
    } catch(e){ return String(Date.now()); }
  }

  function hydrateFromCache(){
    if(hydrated) return false;
    if(typeof data === 'undefined') return false;
    var cached = readCache();
    if(!cached) return false;
    applyToData(cached);
    hydrated = true;
    try {
      if(typeof renderSite === 'function') renderSite();
    } catch(e){}
    return true;
  }

  hydrateFromCache();
  var tries = 0;
  var earlyTimer = setInterval(function(){
    tries++;
    if(hydrateFromCache() || tries > 40) clearInterval(earlyTimer);
  }, 50);

  function patchLoad(){
    if(typeof loadFromCloud !== 'function' || loadFromCloud._swr) return;
    var orig = loadFromCloud;
    loadFromCloud = async function(){
      var before = snapshotHash(typeof data !== 'undefined' ? data : {});
      var ok = false;
      try {
        if(typeof sb !== 'undefined' && sb && sb.from){
          var sRes = await sb.from('shop_settings')
            .select('shop_name,logo_url,cover_url,whatsapp,facebook,instagram,admin_password')
            .eq('id', 1).maybeSingle();
          if(sRes.error){
            ok = await orig.apply(this, arguments);
          } else {
            var cRes = await sb.from('categories')
              .select('id,name,hidden,sort_order')
              .order('sort_order');
            var pRes = await sb.from('products')
              .select('id,name,category_id,price_usd,price_syp,image_url,hidden,sort_order,condition,storage,ram,battery,cleanliness,description')
              .order('sort_order');
            if(cRes.error || pRes.error){
              ok = await orig.apply(this, arguments);
            } else {
              var settings = sRes.data;
              if(settings){
                data.shopName = settings.shop_name || '007';
                data.logo = settings.logo_url || null;
                data.cover = settings.cover_url || null;
                data.whatsapp = settings.whatsapp || '';
                data.facebook = settings.facebook || '';
                data.instagram = settings.instagram || '';
                data.adminPassword = settings.admin_password || '';
              }
              data.categories = (cRes.data || []).map(function(c){
                return { id: c.id, name: c.name, hidden: !!c.hidden, sort_order: c.sort_order };
              });
              data.products = (pRes.data || []).map(function(p){
                return {
                  id: p.id, name: p.name, categoryId: p.category_id,
                  priceUsd: Number(p.price_usd) || 0, priceSyp: Number(p.price_syp) || 0,
                  image: p.image_url || null, hidden: !!p.hidden, sort_order: p.sort_order,
                  condition: p.condition || 'new', storage: p.storage || '', ram: p.ram || '',
                  battery: p.battery != null ? Number(p.battery) : null,
                  cleanliness: p.cleanliness != null ? Number(p.cleanliness) : null,
                  description: p.description || ''
                };
              });
              if(typeof cloudReady !== 'undefined') cloudReady = true;
              var ban = document.getElementById('setupBanner');
              if(ban) ban.remove();
              ok = true;
            }
          }
        } else {
          ok = await orig.apply(this, arguments);
        }
      } catch(e){
        try { ok = await orig.apply(this, arguments); } catch(e2){ ok = false; }
      }

      if(ok && typeof data !== 'undefined'){
        writeCache(data);
        var after = snapshotHash(data);
        if(after !== before && typeof renderSite === 'function'){
          try { renderSite(); } catch(e){}
        }
      }
      return ok;
    };
    loadFromCloud._swr = true;
  }

  function patchMutations(){
    ['upsertProduct','upsertCategory','deleteProductCloud','deleteCategoryCloud','saveSettingsCloud','saveProductOrder','saveCategoryOrder'].forEach(function(name){
      if(typeof window[name] === 'function' && !window[name]._swrCache){
        var prev = window[name];
        window[name] = async function(){
          var r = await prev.apply(this, arguments);
          try { if(typeof data !== 'undefined') writeCache(data); } catch(e){}
          return r;
        };
        window[name]._swrCache = true;
      }
    });
  }

  function enhanceImages(root){
    var scope = root || document;
    var imgs = scope.querySelectorAll('img.product-img, .product-img-wrap img, .pd-img, .cart-body img');
    imgs.forEach(function(img, idx){
      if(!img.getAttribute('decoding')) img.setAttribute('decoding', 'async');
      if(idx < 4 && img.classList.contains('product-img')){
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('fetchpriority', 'low');
      }
    });
  }

  function patchRenderProducts(){
    if(typeof renderProducts !== 'function' || renderProducts._lazy) return;
    var prev = renderProducts;
    window.renderProducts = function(){
      var r = prev.apply(this, arguments);
      enhanceImages(document.getElementById('productsContainer') || document);
      return r;
    };
    renderProducts._lazy = true;
  }

  function observeImgs(){
    if(typeof MutationObserver === 'undefined') return;
    var obs = new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes && m.addedNodes.forEach(function(n){
          if(n.nodeType === 1) enhanceImages(n);
        });
      });
    });
    if(document.body) obs.observe(document.body, { childList: true, subtree: true });
  }

  function boot(){
    patchLoad();
    patchMutations();
    patchRenderProducts();
    enhanceImages();
  }

  boot();
  setTimeout(boot, 100);
  setTimeout(boot, 400);
  setTimeout(boot, 1000);
  setTimeout(observeImgs, 200);

  setTimeout(function(){
    if(typeof data !== 'undefined' && data.products && data.products.length) writeCache(data);
  }, 3000);
})();
