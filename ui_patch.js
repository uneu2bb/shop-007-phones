(function(){
  window.SVG_WA = "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z\"/></svg>";
  window.SVG_FB = "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z\"/></svg>";
  window.SVG_IG = "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8A3.6 3.6 0 007.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6A3.6 3.6 0 0016.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z\"/></svg>";

  window.renderSocial = function() {
    const el = document.getElementById('socialLinks');
    if (!el) return;
    el.innerHTML = '';
    const items = [];
    if (data.whatsapp) items.push({ cls:'wa', href:'https://wa.me/'+String(data.whatsapp).replace(/[^0-9]/g,''), title:'واتساب', svg:SVG_WA });
    if (data.facebook) items.push({ cls:'fb', href:data.facebook, title:'فيسبوك', svg:SVG_FB });
    if (data.instagram) items.push({ cls:'ig', href:data.instagram, title:'إنستغرام', svg:SVG_IG });
    items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'social-btn ' + it.cls;
      a.href = it.href; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.title = it.title; a.setAttribute('aria-label', it.title);
      a.innerHTML = '<span class="social-icon">'+it.svg+'</span><span class="social-ring"></span>';
      el.appendChild(a);
    });
  };

  function getVisibleCats() {
    return (data.categories || []).filter(c => !c.hidden);
  }
  function currentCatName() {
    if (!currentCatId || currentCatId === 'all') return 'اختر القسم';
    const c = data.categories.find(x => x.id === currentCatId);
    return c ? c.name : 'اختر القسم';
  }

  window.renderCategories = function() {
    const nav = document.getElementById('categoriesNav');
    if (!nav) return;
    nav.innerHTML = '';
    const cats = getVisibleCats();
    if (!cats.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'cat-picker-wrap';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-picker-btn';
    btn.id = 'catPickerBtn';
    btn.innerHTML = '<span class="cat-picker-icon">📂</span><span class="cat-picker-label">'+escapeHtml(currentCatName())+'</span><span class="cat-picker-chevron">▾</span>';
    btn.onclick = openCatPicker;
    wrap.appendChild(btn);
    nav.appendChild(wrap);
  };

  function openCatPicker() {
    let modal = document.getElementById('catPickerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'catPickerModal';
      modal.className = 'modal-overlay edit-layer';
      modal.innerHTML = '<div class="lux-modal cat-picker-modal"><div class="lux-glow"></div><div class="modal-header-lux"><h2>اختر القسم</h2><button type="button" class="close-btn" id="closeCatPicker">&times;</button></div><div class="cat-picker-grid" id="catPickerGrid"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) closeCatPicker(); });
      document.getElementById('closeCatPicker').onclick = closeCatPicker;
    }
    const grid = document.getElementById('catPickerGrid');
    grid.innerHTML = '';
    getVisibleCats().forEach(cat => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-picker-item' + (currentCatId === cat.id ? ' active' : '');
      b.innerHTML = '<span class="cat-item-name">'+escapeHtml(cat.name)+'</span>' + (currentCatId === cat.id ? '<span class="cat-item-check">✓</span>' : '');
      b.onclick = () => {
        currentCatId = cat.id;
        closeCatPicker();
        renderCategories();
        renderProducts();
      };
      grid.appendChild(b);
    });
    modal.classList.add('show', 'edit-layer');
  }
  function closeCatPicker() {
    const modal = document.getElementById('catPickerModal');
    if (modal) modal.classList.remove('show', 'edit-layer');
  }

  const _renderSite = window.renderSite;
  if (typeof _renderSite === 'function') {
    window.renderSite = function() {
      if ((currentCatId === 'all' || !currentCatId) && data.categories && data.categories.length) {
        const first = data.categories.find(c => !c.hidden);
        if (first) currentCatId = first.id;
      }
      _renderSite();
      try { renderSocial(); } catch(e) {}
    };
  }

  if (typeof data !== 'undefined' && data) {
    try { renderSocial(); renderCategories(); } catch(e) {}
  }
})();
