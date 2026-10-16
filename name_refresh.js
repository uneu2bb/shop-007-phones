(function(){
  function bind(){
    var el = document.getElementById('shopName');
    if(!el || el._refreshBound) return;
    el._refreshBound = true;
    el.style.cursor = 'pointer';
    el.title = '\u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0635\u0641\u062d\u0629';

    var area = document.querySelector('.logo-area');
    if(area) area.style.cursor = 'pointer';

    var count = 0;
    var resetTimer = null;
    var singleTimer = null;

    function onTap(e){
      count++;
      if(resetTimer) clearTimeout(resetTimer);
      if(singleTimer) clearTimeout(singleTimer);
      resetTimer = setTimeout(function(){ count = 0; }, 1500);

      if(count === 1){
        singleTimer = setTimeout(function(){
          if(count === 1){
            try { window.scrollTo(0, 0); } catch(err){}
            var base = location.pathname + (location.search || '');
            var sep = base.indexOf('?') >= 0 ? '&' : '?';
            location.href = base.replace(/[?&]_r=\d+/g, function(m){ return m.charAt(0) === '?' ? '?' : ''; }).replace(/\?&/, '?').replace(/[?&]$/, '') + (location.search && location.search.indexOf('_r=') >= 0 ? location.search.replace(/([?&])_r=\d+/, '$1_r=' + Date.now()) : (location.search || '') + sep + '_r=' + Date.now());
            setTimeout(function(){ location.reload(); }, 80);
          }
        }, 480);
      } else {
        if(singleTimer){ clearTimeout(singleTimer); singleTimer = null; }
      }
    }

    el.addEventListener('click', onTap, true);
    if(area){
      area.addEventListener('click', function(e){
        if(!e.target) return;
        if(e.target.id === 'siteLogo' || e.target.id === 'logoPlaceholder'){
          onTap(e);
        }
      }, true);
    }
  }
  bind();
  setTimeout(bind, 800);
  setTimeout(bind, 2000);
})();
