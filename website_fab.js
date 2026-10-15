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
      '  width:60px;height:60px;border-radius:50%;',
      '  display:none;align-items:center;justify-content:center;',
      '  text-decoration:none;cursor:pointer;',
      '  background:',
      '    radial-gradient(circle at 30% 25%, rgba(255,240,180,.55), transparent 45%),',
      '    linear-gradient(145deg,#f0d060 0%,#c9a227 35%,#8a6d12 70%,#5c4a0a 100%);',
      '  box-shadow:',
      '    0 8px 28px rgba(201,162,39,.45),',
      '    0 2px 0 rgba(255,230,150,.35) inset,',
      '    0 -2px 6px rgba(0,0,0,.35) inset;',
      '  border:1.5px solid rgba(255,220,120,.55);',
      '  transition:transform .22s ease, box-shadow .22s ease;',
      '}',
      '.web-float-btn::before{',
      '  content:"";position:absolute;inset:4px;border-radius:50%;',
      '  background:radial-gradient(circle at 35% 30%, rgba(255,255,255,.25), transparent 55%);',
      '  pointer-events:none;',
      '}',
      '.web-float-btn:hover,.web-float-btn:active{',
      '  transform:scale(1.08);',
      '  box-shadow:0 10px 32px rgba(201,162,39,.6), 0 2px 0 rgba(255,230,150,.4) inset;',
      '}',
      '.web-float-btn .web-fab-inner{',
      '  position:relative;z-index:1;width:32px;height:32px;',
      '  display:flex;align-items:center;justify-content:center;',
      '  filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));',
      '}',
      '.web-float-btn .web-fab-inner svg{width:100%;height:100%;display:block;}',
      'body.has-web-fab .wa-float-btn{bottom:22px;}',
      '.web-admin-box{',
      '  background:linear-gradient(145deg,#1a1810,#12100c);',
      '  border:1px solid rgba(201,162,39,.28);',
      '  border-radius:16px;padding:14px;margin-top:4px;',
      '}',
      '.web-admin-box label.web-main-label{',
      '  display:block;font-size:.82rem;color:var(--text-muted,#aaa);',
      '  margin-bottom:10px;font-weight:600;',
      '}',
      '.web-upload-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;}',
      '.web-upload-btn{',
      '  flex:1;min-width:140px;padding:12px 14px;border-radius:12px;border:none;',
      '  background:linear-gradient(135deg,#e0b83a,#c9a227);color:#111;',
      '  font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;',
      '}',
      '.web-clear-btn{',
      '  padding:12px 14px;border-radius:12px;',
      '  background:#2a1a1a;border:1px solid rgba(239,68,68,.4);color:#fca5a5;',
      '  font-family:inherit;font-weight:600;font-size:.85rem;cursor:pointer;',
      '}',
      '.web-status{font-size:.8rem;color:#c9a227;margin-top:6px;line-height:1.5;word-break:break-all;}',
      '.web-status.empty{color:#888;}',
      '.web-or{text-align:center;color:#666;font-size:.75rem;margin:10px 0 8px;}',
      '#websiteInput{direction:ltr;text-align:left;font-size:.9rem;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function normalizeUrl(u){
    u = String(u||'').trim();
    if(!u) return '';
    if(!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function fabIconSvg(){
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#1a1205"/><stop offset="100%" stop-color="#3d2e0a"/>' +
      '</linearGradient></defs>' +
      '<circle cx="12" cy="12" r="10" fill="url(#g1)" stroke="#1a1205" stroke-width="0.5"/>' +
      '<ellipse cx="12" cy="12" rx="4.2" ry="10" fill="none" stroke="#f5e6b0" stroke-width="1.15" opacity="0.95"/>' +
      '<path d="M2.5 9.5h19M2.5 14.5h19" stroke="#f5e6b0" stroke-width="1.1" fill="none" opacity="0.9"/>' +
      '<path d="M12 2c2.2 2.8 3.4 6 3.4 10s-1.2 7.2-3.4 10c-2.2-2.8-3.4-6-3.4-10S9.8 4.8 12 2z" fill="none" stroke="#ffe9a0" stroke-width="1" opacity="0.7"/>' +
      '<circle cx="12" cy="12" r="10" fill="none" stroke="#fff4c0" stroke-width="0.6" opacity="0.35"/>' +
      '</svg>';
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
        if(meta.websiteName!=null) data.websiteName = meta.websiteName;
      }
    }catch(e){}
  }

  async function fetchExistingMeta(){
    if(typeof sb==='undefined'||!sb) return {};
    try{
      var pub = sb.storage.from('shop-images').getPublicUrl(META_PATH).data.publicUrl;
      var res = await fetch(pub + '?t=' + Date.now(), {cache:'no-store'});
      if(!res.ok) return {};
      var meta = await res.json();
      return meta && typeof meta === 'object' ? meta : {};
    }catch(e){ return {}; }
  }

  async function saveMeta(){
    if(typeof sb==='undefined'||!sb) return false;
    try{
      var existing = await fetchExistingMeta();
      var meta = Object.assign({}, existing, {
        footerDesc: (data.footerDesc != null ? data.footerDesc : (existing.footerDesc || '')),
        website: (data.website != null ? data.website : (existing.website || '')),
        websiteName: (data.websiteName != null ? data.websiteName : (existing.websiteName || ''))
      });
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

  async function uploadWebsiteFile(file){
    if(typeof sb==='undefined'||!sb) throw new Error('لا يوجد اتصال');
    var ext = (file.name.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'')||'bin';
    var path = 'website/' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.' + ext;
    var result = await sb.storage.from('shop-images').upload(path, file, {
      upsert:true,
      contentType: file.type || 'application/octet-stream'
    });
    if(result.error) throw result.error;
    var urlData = sb.storage.from('shop-images').getPublicUrl(path).data;
    return urlData.publicUrl;
  }

  function updateStatus(){
    var st = document.getElementById('websiteStatus');
    if(!st) return;
    var url = (data.website||'').trim();
    var name = (data.websiteName||'').trim();
    if(!url){
      st.className = 'web-status empty';
      st.textContent = 'لا يوجد موقع مربوط حالياً';
      return;
    }
    st.className = 'web-status';
    st.textContent = name ? ('✓ مربوط: ' + name) : ('✓ مربوط: ' + url);
  }

  function ensureWebsiteField(){
    if(document.getElementById('websiteAdminBox')) return;
    var wa = document.getElementById('whatsappInput');
    var oldInp = document.getElementById('websiteInput');

    var box = document.createElement('div');
    box.className = 'form-group';
    box.id = 'websiteAdminBox';
    box.innerHTML =
      '<div class="web-admin-box">' +
      '<label class="web-main-label">🌐 موقع الزر (فوق واتساب)</label>' +
      '<div class="web-upload-row">' +
      '<button type="button" class="web-upload-btn" id="websiteUploadBtn">📁 رفع من الجهاز</button>' +
      '<button type="button" class="web-clear-btn" id="websiteClearBtn">حذف</button>' +
      '</div>' +
      '<input type="file" id="websiteFileInput" accept="*/*" style="display:none">' +
      '<div class="web-or">— أو الصق رابط —</div>' +
      '<input type="url" class="form-control" id="websiteInput" placeholder="https://example.com">' +
      '<div class="web-status empty" id="websiteStatus">لا يوجد موقع مربوط حالياً</div>' +
      '</div>';

    if(oldInp){
      var oldGroup = oldInp.closest('.form-group');
      if(oldGroup && oldGroup.parentNode){
        oldGroup.parentNode.replaceChild(box, oldGroup);
      } else if(wa && wa.parentNode){
        var p = wa.parentNode;
        if(p.nextSibling) p.parentNode.insertBefore(box, p.nextSibling);
        else p.parentNode.appendChild(box);
      }
    } else if(wa && wa.parentNode){
      var p2 = wa.parentNode;
      if(p2.nextSibling) p2.parentNode.insertBefore(box, p2.nextSibling);
      else p2.parentNode.appendChild(box);
    } else return;

    var fileInp = document.getElementById('websiteFileInput');
    var upBtn = document.getElementById('websiteUploadBtn');
    var clearBtn = document.getElementById('websiteClearBtn');
    if(upBtn && fileInp){
      upBtn.onclick = function(){ fileInp.click(); };
      fileInp.onchange = async function(e){
        var file = e.target.files && e.target.files[0];
        if(!file) return;
        upBtn.disabled = true;
        upBtn.textContent = 'جاري الرفع...';
        try{
          var url = await uploadWebsiteFile(file);
          data.website = url;
          data.websiteName = file.name;
          var inp = document.getElementById('websiteInput');
          if(inp) inp.value = url;
          await saveMeta();
          ensureWebFab();
          updateStatus();
          if(typeof showToast==='function') showToast('تم رفع الموقع وربطه بالزر ✓');
        }catch(err){
          if(typeof showToast==='function') showToast('فشل الرفع: ' + (err.message||err));
          else alert('فشل الرفع');
        }
        upBtn.disabled = false;
        upBtn.textContent = '📁 رفع من الجهاز';
        fileInp.value = '';
      };
    }
    if(clearBtn){
      clearBtn.onclick = async function(){
        data.website = '';
        data.websiteName = '';
        var inp = document.getElementById('websiteInput');
        if(inp) inp.value = '';
        await saveMeta();
        ensureWebFab();
        updateStatus();
        if(typeof showToast==='function') showToast('تم حذف ربط الموقع');
      };
    }
  }

  function fillWebsiteField(){
    ensureWebsiteField();
    var inp = document.getElementById('websiteInput');
    if(inp && data.website) inp.value = data.website;
    updateStatus();
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
      fab.innerHTML = '<span class="web-fab-inner">' + fabIconSvg() + '</span>';
      document.body.appendChild(fab);
    } else {
      fab.innerHTML = '<span class="web-fab-inner">' + fabIconSvg() + '</span>';
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
      if(inp){
        var v = normalizeUrl(inp.value);
        data.website = v;
        if(!v) data.websiteName = '';
        else if(!data.websiteName) data.websiteName = v;
      }
      if(typeof prev==='function') await prev.call(btn, ev);
      await saveMeta();
      ensureWebFab();
      updateStatus();
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

  function hookCloudLoad(){
    if(typeof loadFromCloud !== 'function' || loadFromCloud._webMeta) return;
    var L = loadFromCloud;
    loadFromCloud = async function(){
      var ok = await L.apply(this, arguments);
      try{
        await loadMeta();
        ensureWebFab();
        fillWebsiteField();
      }catch(e){}
      return ok;
    };
    loadFromCloud._webMeta = true;
  }

  setTimeout(async function(){
    hookCloudLoad();
    await loadMeta();
    boot();
    if(typeof renderSite==='function') try{ renderSite(); }catch(e){}
  }, 600);
  setTimeout(function(){ hookCloudLoad(); boot(); }, 1500);
  setTimeout(function(){ hookCloudLoad(); boot(); }, 3000);
})();
