(function(){
  var EXTRAS_PATH = 'meta/product-extras.json';

  function buildExtrasMap() {
    var map = {};
    try {
      var local = JSON.parse(localStorage.getItem('shop007_product_extras_v1') || '{}') || {};
      Object.keys(local).forEach(function(k){ map[k] = local[k]; });
    } catch(e) {}
    (data.products || []).forEach(function(p) {
      map[p.id] = {
        condition: p.condition || (map[p.id] && map[p.id].condition) || 'new',
        storage: p.storage || (map[p.id] && map[p.id].storage) || '',
        ram: p.ram || (map[p.id] && map[p.id].ram) || '',
        battery: p.battery != null ? p.battery : (map[p.id] && map[p.id].battery != null ? map[p.id].battery : null),
        cleanliness: p.cleanliness != null ? p.cleanliness : (map[p.id] && map[p.id].cleanliness != null ? map[p.id].cleanliness : null),
        description: p.description || (map[p.id] && map[p.id].description) || ''
      };
    });
    return map;
  }

  function applyExtrasMap(map) {
    if (!map || typeof map !== 'object') return;
    try {
      localStorage.setItem('shop007_product_extras_v1', JSON.stringify(map));
    } catch(e) {}
    (data.products || []).forEach(function(p) {
      var e = map[p.id];
      if (!e) return;
      p.condition = e.condition || 'new';
      p.storage = e.storage || '';
      p.ram = e.ram || '';
      p.battery = e.battery != null && e.battery !== '' ? Number(e.battery) : null;
      p.cleanliness = e.cleanliness != null && e.cleanliness !== '' ? Number(e.cleanliness) : null;
      p.description = e.description || '';
    });
  }

  window.saveProductExtrasCloud = async function() {
    if (typeof sb === 'undefined' || !sb) return false;
    try {
      var map = buildExtrasMap();
      var blob = new Blob([JSON.stringify(map)], { type: 'application/json' });
      var { error } = await sb.storage.from('shop-images').upload(EXTRAS_PATH, blob, {
        upsert: true,
        contentType: 'application/json',
        cacheControl: '0'
      });
      if (error) {
        console.warn('extras upload', error);
        try { await sb.storage.from('shop-images').remove([EXTRAS_PATH]); } catch(e) {}
        var r2 = await sb.storage.from('shop-images').upload(EXTRAS_PATH, blob, {
          upsert: true,
          contentType: 'application/json',
          cacheControl: '0'
        });
        if (r2.error) { console.warn('extras upload2', r2.error); return false; }
      }
      return true;
    } catch (e) {
      console.warn('saveProductExtrasCloud', e);
      return false;
    }
  };

  window.loadProductExtrasCloud = async function() {
    if (typeof sb === 'undefined' || !sb) return false;
    try {
      var { data: urlData } = sb.storage.from('shop-images').getPublicUrl(EXTRAS_PATH);
      var url = urlData.publicUrl + (urlData.publicUrl.indexOf('?') >= 0 ? '&' : '?') + 't=' + Date.now();
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return false;
      var map = await res.json();
      applyExtrasMap(map);
      return true;
    } catch (e) {
      console.warn('loadProductExtrasCloud', e);
      return false;
    }
  };

  var _load = window.loadFromCloud;
  if (typeof _load === 'function') {
    window.loadFromCloud = async function() {
      var ok = await _load.apply(this, arguments);
      try { await loadProductExtrasCloud(); } catch(e) {}
      return ok;
    };
  }

  function hookSaveExtras() {
    var btn = document.getElementById('saveEditProduct');
    if (!btn || btn._cloudExtrasHooked) return;
    btn._cloudExtrasHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev) {
      var result;
      if (typeof prev === 'function') result = await prev.call(btn, ev);
      try {
        if (typeof editingProductId !== 'undefined' && editingProductId) {
          var p = data.products.find(function(x){ return x.id === editingProductId; });
          if (p) {
            var c = document.getElementById('editProductCondition');
            var s = document.getElementById('editProductStorage');
            var b = document.getElementById('editProductBattery');
            var r = document.getElementById('editProductRam');
            var cl = document.getElementById('editProductClean');
            var d = document.getElementById('editProductDesc');
            if (c) p.condition = c.value || 'new';
            if (s) p.storage = s.value.trim();
            if (r) p.ram = r.value.trim();
            if (b) p.battery = b.value !== '' ? Number(b.value) : null;
            if (cl) p.cleanliness = cl.value !== '' ? Number(cl.value) : null;
            if (d) p.description = d.value.trim();
            if (typeof upsertProduct === 'function') {
              try { await upsertProduct(p); } catch(e) {}
            }
          }
        }
        await saveProductExtrasCloud();
        if (typeof renderProducts === 'function') renderProducts();
      } catch(e) { console.warn(e); }
      return result;
    };
  }

  setTimeout(async function(){
    try {
      await loadProductExtrasCloud();
      if (typeof renderProducts === 'function') renderProducts();
      if (typeof renderSite === 'function') renderSite();
    } catch(e) {}
    hookSaveExtras();
  }, 800);
  setTimeout(hookSaveExtras, 2000);
  setTimeout(async function(){
    try {
      await loadProductExtrasCloud();
      if (typeof renderProducts === 'function') renderProducts();
    } catch(e) {}
  }, 2500);

  var _rs = window.renderSite;
  window.renderSite = function() {
    if (typeof _rs === 'function') _rs();
    hookSaveExtras();
  };
})();
