(function(){
  var STYLE_ID = 'admin-cat-ui-css';
  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#productCategory{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;}',
      '.lux-cat-wrap{position:relative;width:100%;}',
      '.lux-cat-btn{',
      '  width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;',
      '  background:linear-gradient(145deg,#1a1810,#12100c);',
      '  border:1px solid rgba(201,162,39,.35);',
      '  border-radius:14px;padding:13px 16px;',
      '  color:#f0ebe0;font-family:inherit;font-size:1rem;font-weight:600;',
      '  cursor:pointer;text-align:right;appearance:none;',
      '  box-shadow:0 2px 12px rgba(0,0,0,.25), inset 0 1px 0 rgba(201,162,39,.08);',
      '  transition:border-color .2s, box-shadow .2s;',
      '}',
      '.lux-cat-btn:hover,.lux-cat-btn.open{',
      '  border-color:#c9a227;',
      '  box-shadow:0 0 0 3px rgba(201,162,39,.12), 0 4px 16px rgba(0,0,0,.3);',
      '}',
      '.lux-cat-btn .lux-cat-label{',
      '  flex:1;background:linear-gradient(135deg,#e8c547,#c9a227);',
      '  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
      '}',
      '.lux-cat-btn .lux-cat-chevron{',
      '  width:18px;height:18px;flex-shrink:0;color:#c9a227;',
      '  transition:transform .25s ease;',
      '}',
      '.lux-cat-btn.open .lux-cat-chevron{transform:rotate(180deg);}',
      '.lux-cat-menu{',
      '  display:none;position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:50;',
      '  background:linear-gradient(180deg,#1c1a14,#14120e);',
      '  border:1px solid rgba(201,162,39,.3);',
      '  border-radius:16px;padding:8px;',
      '  max-height:260px;overflow-y:auto;-webkit-overflow-scrolling:touch;',
      '  box-shadow:0 12px 40px rgba(0,0,0,.55), 0 0 0 1px rgba(201,162,39,.08);',
      '}',
      '.lux-cat-menu.open{display:block;animation:luxCatIn .2s ease;}',
      '@keyframes luxCatIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}',
      '.lux-cat-option{',
      '  display:flex;align-items:center;justify-content:space-between;gap:10px;',
      '  width:100%;padding:12px 14px;margin:0;border:none;border-radius:12px;',
      '  background:transparent;color:#e8e2d6;font-family:inherit;font-size:.95rem;font-weight:600;',
      '  cursor:pointer;text-align:right;',
      '  transition:background .15s, color .15s;',
      '}',
      '.lux-cat-option:hover{background:rgba(201,162,39,.1);color:#f5e6b8;}',
      '.lux-cat-option.active{',
      '  background:linear-gradient(135deg,rgba(201,162,39,.22),rgba(201,162,39,.08));',
      '  color:#e8c547;border:1px solid rgba(201,162,39,.35);',
      '}',
      '.lux-cat-option .dot{',
      '  width:10px;height:10px;border-radius:50%;flex-shrink:0;',
      '  border:2px solid rgba(201,162,39,.4);background:transparent;',
      '}',
      '.lux-cat-option.active .dot{',
      '  background:#c9a227;border-color:#e8c547;',
      '  box-shadow:0 0 8px rgba(201,162,39,.5);',
      '}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function ensureWrap(){
    var sel = document.getElementById('productCategory');
    if(!sel) return null;
    if(sel.parentElement && sel.parentElement.classList.contains('lux-cat-wrap')){
      return sel.parentElement;
    }
    var wrap = document.createElement('div');
    wrap.className = 'lux-cat-wrap';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lux-cat-btn';
    btn.id = 'luxCatBtn';
    btn.innerHTML = '<span class="lux-cat-label" id="luxCatLabel">اختر القسم</span>' +
      '<svg class="lux-cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
    wrap.appendChild(btn);

    var menu = document.createElement('div');
    menu.className = 'lux-cat-menu';
    menu.id = 'luxCatMenu';
    wrap.appendChild(menu);

    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
    });
    document.addEventListener('click', function(e){
      if(!wrap.contains(e.target)){
        menu.classList.remove('open');
        btn.classList.remove('open');
      }
    });
    return wrap;
  }

  function syncFromSelect(){
    var sel = document.getElementById('productCategory');
    var label = document.getElementById('luxCatLabel');
    var menu = document.getElementById('luxCatMenu');
    if(!sel || !label || !menu) return;
    var opts = Array.from(sel.options || []);
    menu.innerHTML = '';
    if(!opts.length){
      label.textContent = 'لا توجد أقسام';
      return;
    }
    var current = sel.value;
    var currentText = '';
    opts.forEach(function(opt){
      if(!opt.value && opts.length > 1) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lux-cat-option' + (opt.value === current ? ' active' : '');
      b.dataset.value = opt.value;
      b.innerHTML = '<span class="dot"></span><span>' + (opt.textContent || opt.value) + '</span>';
      if(opt.value === current) currentText = opt.textContent;
      b.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        sel.value = opt.value;
        try{ sel.dispatchEvent(new Event('change', {bubbles:true})); }catch(err){}
        label.textContent = opt.textContent || 'اختر القسم';
        menu.querySelectorAll('.lux-cat-option').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        menu.classList.remove('open');
        var btn = document.getElementById('luxCatBtn');
        if(btn) btn.classList.remove('open');
      });
      menu.appendChild(b);
    });
    if(!currentText && opts[0]) {
      currentText = opts[0].textContent;
      if(!sel.value && opts[0].value) sel.value = opts[0].value;
    }
    label.textContent = currentText || 'اختر القسم';
  }

  function build(){
    injectCss();
    ensureWrap();
    syncFromSelect();
  }

  function hookPopulate(){
    if(typeof window.populateCategorySelect !== 'function') return;
    if(window.populateCategorySelect._luxHooked) return;
    var orig = window.populateCategorySelect;
    window.populateCategorySelect = function(){
      var r = orig.apply(this, arguments);
      setTimeout(function(){ build(); }, 0);
      return r;
    };
    window.populateCategorySelect._luxHooked = true;
  }

  function boot(){
    injectCss();
    hookPopulate();
    build();
  }
  boot();
  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
})();
