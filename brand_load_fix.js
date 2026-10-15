(function(){
  var STYLE_ID = 'header-load-skeleton-v1';
  var ready = false;

  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      'html:not(.brand-ready) #shopName,',
      'html:not(.brand-ready) #siteLogo,',
      'html:not(.brand-ready) #logoPlaceholder{',
      '  opacity:0 !important;visibility:hidden !important;',
      '}',
      'html:not(.brand-ready) .logo-area{',
      '  position:relative;min-width:120px;min-height:40px;',
      '}',
      'html:not(.brand-ready) .logo-area::before{',
      '  content:"";position:absolute;right:0;top:50%;transform:translateY(-50%);',
      '  width:36px;height:36px;border-radius:10px;',
      '  background:linear-gradient(90deg,#1a1810 25%,#2a2618 50%,#1a1810 75%);',
      '  background-size:200% 100%;animation:skel 1.2s ease-in-out infinite;',
      '}',
      'html:not(.brand-ready) .logo-area::after{',
      '  content:"";position:absolute;right:48px;top:50%;transform:translateY(-50%);',
      '  width:72px;height:16px;border-radius:8px;',
      '  background:linear-gradient(90deg,#1a1810 25%,#2a2618 50%,#1a1810 75%);',
      '  background-size:200% 100%;animation:skel 1.2s ease-in-out infinite;',
      '}',
      '@keyframes skel{0%{background-position:200% 0}100%{background-position:-200% 0}}',
      'html.brand-ready #shopName{opacity:1!important;visibility:visible!important;}',
      'html.brand-ready #siteLogo{opacity:1!important;visibility:visible!important;}',
      'html.brand-ready #logoPlaceholder{opacity:1!important;visibility:visible!important;}',
      'html:not(.brand-ready) #coverImg{opacity:0!important;}',
      'html.brand-ready #coverImg{opacity:1!important;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function clearHardcoded(){
    try{
      var nameEl = document.getElementById('shopName');
      if(nameEl && !ready){
        if(nameEl.textContent === '007' || nameEl.textContent === ''){
          nameEl.textContent = '';
        }
      }
      var ph = document.getElementById('logoPlaceholder');
      if(ph && !ready){
        if(ph.textContent === '007') ph.textContent = '';
      }
      if(!ready && document.title && document.title.indexOf('007') === 0){
        document.title = '\u0645\u062d\u0644 \u0627\u0644\u0647\u0648\u0627\u062a\u0641';
      }
    }catch(e){}
  }

  function markReady(){
    ready = true;
    document.documentElement.classList.add('brand-ready');
    document.documentElement.classList.remove('imgs-loading');
    document.documentElement.classList.add('imgs-ready');
  }

  function applyBrand(){
    if(typeof data === 'undefined' || !data) return false;
    var hasName = !!(data.shopName && String(data.shopName).trim());
    var hasLogo = !!data.logo;
    if(!hasName && !(data.products && data.products.length)) return false;

    var nameEl = document.getElementById('shopName');
    if(nameEl) nameEl.textContent = data.shopName || '';

    var logoImg = document.getElementById('siteLogo');
    var logoPh = document.getElementById('logoPlaceholder');
    if(hasLogo && logoImg){
      var src = data.logo;
      try{ if(typeof bustUrl === 'function') src = bustUrl(src); }catch(e){}
      logoImg.src = src;
      logoImg.style.display = 'block';
      logoImg.style.opacity = '1';
      if(logoPh) logoPh.style.display = 'none';
    } else if(logoPh){
      logoPh.textContent = (data.shopName || '').slice(0,3) || '';
      logoPh.style.display = hasName ? 'flex' : 'none';
      if(logoImg) logoImg.style.display = 'none';
    }

    if(data.shopName) document.title = data.shopName + ' | \u0645\u062d\u0644 \u0627\u0644\u0647\u0648\u0627\u062a\u0641';
    markReady();
    return true;
  }

  injectCss();
  clearHardcoded();
  document.documentElement.classList.remove('brand-ready');

  function patchRender(){
    if(typeof renderSite !== 'function' || renderSite._brandFix) return;
    var R = renderSite;
    window.renderSite = function(){
      var r = R.apply(this, arguments);
      applyBrand();
      return r;
    };
    renderSite._brandFix = true;
  }

  function patchLoad(){
    if(typeof loadFromCloud !== 'function' || loadFromCloud._brandFix) return;
    var L = loadFromCloud;
    loadFromCloud = async function(){
      document.documentElement.classList.remove('brand-ready');
      clearHardcoded();
      var ok = await L.apply(this, arguments);
      applyBrand();
      return ok;
    };
    loadFromCloud._brandFix = true;
  }

  function boot(){
    clearHardcoded();
    patchRender();
    patchLoad();
    applyBrand();
  }

  boot();
  setTimeout(boot, 50);
  setTimeout(boot, 200);
  setTimeout(boot, 600);
  setTimeout(boot, 1500);
  setTimeout(function(){
    if(!ready){
      applyBrand();
      markReady();
    }
  }, 5000);
})();
