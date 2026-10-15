(function(){
  var META_PATH = 'meta/site-meta.json';
  var openAdminCatId = null;

  async function loadSiteMeta() {
    if (typeof sb === 'undefined' || !sb) return;
    try {
      var urlData = sb.storage.from('shop-images').getPublicUrl(META_PATH).data;
      var url = urlData.publicUrl + '?t=' + Date.now();
      var res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      var meta = await res.json();
      if (meta) {
        if (meta.footerDesc != null) data.footerDesc = meta.footerDesc;
        if (meta.website != null) data.website = meta.website;
        if (meta.websiteName != null) data.websiteName = meta.websiteName;
      }
    } catch (e) {}
  }

  async function saveSiteMeta() {
    if (typeof sb === 'undefined' || !sb) return false;
    try {
      var meta = {
        footerDesc: data.footerDesc || '',
        website: data.website || '',
        websiteName: data.websiteName || ''
      };
      var blob = new Blob([JSON.stringify(meta)], { type: 'application/json' });
      var r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
        upsert: true, contentType: 'application/json', cacheControl: '0'
      });
      if (r.error) {
        try { await sb.storage.from('shop-images').remove([META_PATH]); } catch (e) {}
        r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
          upsert: true, contentType: 'application/json', cacheControl: '0'
        });
      }
      return !r.error;
    } catch (e) { return false; }
  }
