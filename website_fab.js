(function(){
  var META_PATH = 'meta/site-meta.json';
  var STYLE_ID = 'website-fab-css';

  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '.web-float-btn{',
      '  position:fixed;bottom:90px;left:18px;z-index:1100;',
      '  width:58px;height:58px;border-radius:50%;',
      '  background:linear-gradient(145deg,#4B9BFF,#2563eb,#1d4ed8);',
      '  color:#fff;display:none;align-items:center;justify-content:center;',
      '  box-shadow:0 6px 24px rgba(37,99,235,.45);',
      '  text-decoration:none;transition:transform .2s,box-shadow .2s;',
      '}',
      '.web-float-btn:hover{transform:scale(1.06);box-shadow:0 8px 28px rgba(37,99,235,.55);}',
      '.web-float-btn svg{width:26px;height:26px;display:block;}',
      'body.has-web-fab .wa-float-btn{bottom:22px;}',
      '#websiteInput{direction:ltr;text-align:left;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function normalizeUrl(u){
    u = String(u||'').trim();
    if(!u) return '';
    if(!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  async function loadMeta(){
    if(typeof sb==='undefined'||!sb) return;
    try{
      var pub = sb.storage.from('shop-images').getPublicUrl(META_PATH).data.publicUrl;
      var res = await fetch(pub + '?t=' + Date.now(), {cache:'no-store'});
      if(!res.ok) return;
      var meta = await res.json();
      if(meta){
        if(meta.footerDesc!=null) data.footerDesc = meta.footerDesc;
        if(meta.website!=null) data.website = meta.website;
      }
    }catch(e){}
  }

  async function saveMeta(){
    if(typeof sb==='undefined'||!sb) return false;
    try{
      var meta = {
        footerDesc: (data.footerDesc||''),
        website: (data.website||'')
      };
      var blob = new Blob([JSON.stringify(meta)], {type:'application/json'});
      var r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
        upsert:true, contentType:'application/json', cacheControl:'0'
      });
      if(r.error){
        try{ await sb.storage.from('shop-images').remove([META_PATH]); }catch(e){}
        r = await sb.storage.from('shop-images').upload(META_PATH, blob, {
          upsert:true, contentType:'application/json', cacheControl:'0'
        });
      }
      return !r.error;
    }catch(e){ return false; }
  }

  function ensureWebsiteField(){
    if(document.getElementById('websiteInput')) return;
    var wa = document.getElementById('whatsappInput');
    if(!wa || !wa.parentNode) return;
    var group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML =
      '<label>رابط الموقع (زر فوق واتساب)</label>' +
      '<input type="url" class="form-control" id="websiteInput" placeholder="https://example.com">';
    var parent = wa.parentNode;
    if(parent.nextSibling) parent.parentNode.insertBefore(group, parent.nextSibling);
    else parent.parentNode.appendChild(group);
  }

  function fillWebsiteField(){
    ensureWebsiteField();
    var inp = document.getElementById('websiteInput');
    if(inp) inp.value = data.website || '';
  }

  function ensureWebFab(){
    injectCss();
    var url = normalizeUrl(data.website);
    var fab = document.getElementById('webFloatBtn');
    if(!url){
      if(fab) fab.style.display = 'none';
      document.body.classList.remove('has-web-fab');
      return;
    }
    if(!fab){
      fab = document.createElement('a');
      fab.id = 'webFloatBtn';
      fab.className = 'web-float-btn';
      fab.target = '_blank';
      fab.rel = 'noopener noreferrer';
      fab.setAttribute('aria-label', 'الموقع');
      fab.title = 'الموقع';
      fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
      document.body.appendChild(fab);
    }
    fab.href = url;
    fab.style.display = 'flex';
    document.body.classList.add('has-web-fab');
  }

  function hookSave(){
    var btn = document.getElementById('saveSettingsBtn');
    if(!btn || btn._webHooked) return;
    btn._webHooked = true;
    var prev = btn.onclick;
    btn.onclick = async function(ev){
      ensureWebsiteField();
      var inp = document.getElementById('websiteInput');
      if(inp) data.website = normalizeUrl(inp.value);
      if(typeof prev==='function') await prev.call(btn, ev);
      await saveMeta();
      ensureWebFab();
    };
  }

  function boot(){
    injectCss();
    ensureWebsiteField();
    fillWebsiteField();
    ensureWebFab();
    hookSave();
  }

  var _rs = window.renderSite;
  if(typeof _rs==='function' && !_rs._webPatched){
    window.renderSite = function(){
      var r = _rs.apply(this, arguments);
      fillWebsiteField();
      ensureWebFab();
      hookSave();
      return r;
    };
    window.renderSite._webPatched = true;
  }

  setTimeout(async function(){
    await loadMeta();
    boot();
    if(typeof renderSite==='function') try{ renderSite(); }catch(e){}
  }, 600);
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);
})();
