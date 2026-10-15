(function () {
  window.__imgVer = String(Date.now());

  function bustUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    var clean = url.replace(/([?&])(v|t)=\d+/g, function (m, sep) {
      return sep === '?' ? '?' : '';
    }).replace(/\?&/, '?').replace(/[?&]$/, '');
    var sep = clean.indexOf('?') >= 0 ? '&' : '?';
    return clean + sep + 'v=' + window.__imgVer;
  }
  window.bustUrl = bustUrl;

  function applyBustToData() {
    try {
      if (!window.data) return;
      if (data.logo) data.logo = bustUrl(data.logo);
      if (data.cover) data.cover = bustUrl(data.cover);
      if (Array.isArray(data.products)) {
        data.products.forEach(function (p) {
          if (p && p.image) p.image = bustUrl(p.image);
        });
      }
    } catch (e) {}
  }

  function patchUpload() {
    if (typeof window.uploadImage !== 'function') return;
    if (window.uploadImage._bustPatched) return;
    var _up = window.uploadImage;
    window.uploadImage = async function (file, folder) {
      var url = await _up.apply(this, arguments);
      window.__imgVer = String(Date.now());
      return bustUrl(url);
    };
    window.uploadImage._bustPatched = true;
  }

  function patchLoad() {
    if (typeof window.loadFromCloud !== 'function') return;
    if (window.loadFromCloud._bustPatched) return;
    var _load = window.loadFromCloud;
    window.loadFromCloud = async function () {
      document.documentElement.classList.add('imgs-loading');
      if (document.body) document.body.classList.add('imgs-loading');
      try {
        var logo = document.getElementById('siteLogo');
        var cover = document.getElementById('coverImg');
        if (logo) { logo.removeAttribute('src'); logo.style.display = 'none'; }
        if (cover) { cover.removeAttribute('src'); cover.style.display = 'none'; }
      } catch (e) {}
      var ok = await _load.apply(this, arguments);
      window.__imgVer = String(Date.now());
      applyBustToData();
      document.documentElement.classList.remove('imgs-loading');
      if (document.body) document.body.classList.remove('imgs-loading');
      document.documentElement.classList.add('imgs-ready');
      if (document.body) document.body.classList.add('imgs-ready');
      return ok;
    };
    window.loadFromCloud._bustPatched = true;
  }

  function patchRender() {
    if (typeof window.renderSite !== 'function') return;
    if (window.renderSite._bustPatched) return;
    var _rs = window.renderSite;
    window.renderSite = function () {
      applyBustToData();
      var result = _rs.apply(this, arguments);
      try {
        if (data && data.logo) {
          var logoImg = document.getElementById('siteLogo');
          if (logoImg) logoImg.src = bustUrl(data.logo);
        }
        if (data && data.cover) {
          var coverImg = document.getElementById('coverImg');
          if (coverImg) coverImg.src = bustUrl(data.cover);
        }
      } catch (e) {}
      return result;
    };
    window.renderSite._bustPatched = true;
  }

  function injectCss() {
    if (document.getElementById('img-cache-css')) return;
    var s = document.createElement('style');
    s.id = 'img-cache-css';
    s.textContent = [
      'html.imgs-loading #siteLogo, body.imgs-loading #siteLogo,',
      'html.imgs-loading #coverImg, body.imgs-loading #coverImg { opacity:0 !important; }',
      'html.imgs-loading #coverPlaceholder, body.imgs-loading #coverPlaceholder {',
      '  display:block !important;',
      '  background: linear-gradient(90deg,#1a1810 25%,#252218 50%,#1a1810 75%);',
      '  background-size: 200% 100%;',
      '  animation: skShine 1.2s ease-in-out infinite;',
      '  min-height: 160px;',
      '}',
      'html.imgs-loading #logoPlaceholder, body.imgs-loading #logoPlaceholder {',
      '  display:flex !important;',
      '  background: linear-gradient(90deg,#1a1810 25%,#252218 50%,#1a1810 75%);',
      '  background-size: 200% 100%;',
      '  animation: skShine 1.2s ease-in-out infinite;',
      '  color: transparent !important;',
      '}',
      '@keyframes skShine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }',
      'html.imgs-ready #siteLogo, html.imgs-ready #coverImg { transition: opacity .25s ease; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  try { document.documentElement.classList.add('imgs-loading'); } catch (e) {}

  function boot() {
    injectCss();
    patchUpload();
    patchLoad();
    patchRender();
  }
  boot();
  setTimeout(boot, 0);
  setTimeout(boot, 300);
  setTimeout(boot, 1000);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
