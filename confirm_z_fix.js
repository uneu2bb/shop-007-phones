(function(){
  var STYLE_ID = 'lux-confirm-z-fix';
  function inject(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#luxConfirmModal.modal-overlay,',
      '#luxConfirmModal{',
      '  z-index: 1700 !important;',
      '  position: fixed !important;',
      '  inset: 0 !important;',
      '  background: rgba(0,0,0,.85) !important;',
      '  backdrop-filter: blur(12px);',
      '  -webkit-backdrop-filter: blur(12px);',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 1rem !important;',
      '}',
      '#luxConfirmModal.show,',
      '#luxConfirmModal.edit-layer.show{',
      '  display: flex !important;',
      '}',
      '#luxConfirmModal .lux-confirm-modal{',
      '  position: relative;',
      '  z-index: 1;',
      '  max-width: 360px;',
      '  width: 100%;',
      '  padding: 1.75rem 1.5rem 1.5rem;',
      '  text-align: center;',
      '  border-radius: 20px;',
      '  background: linear-gradient(180deg, #1c1a14, #12100c);',
      '  border: 1px solid rgba(201,162,39,.35);',
      '  box-shadow: 0 20px 60px rgba(0,0,0,.6);',
      '}',
      '#adminModal.modal-overlay{z-index:1300 !important;}',
      '#editProductModal.modal-overlay,#editCategoryModal.modal-overlay{z-index:1600 !important;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function forceOnTop(m){
    if(!m) return;
    m.style.zIndex = '1700';
    m.style.position = 'fixed';
    m.style.inset = '0';
    m.style.display = 'flex';
    m.style.alignItems = 'center';
    m.style.justifyContent = 'center';
    m.classList.add('show','edit-layer');
    try{
      if(m.parentNode === document.body) document.body.appendChild(m);
      else document.body.appendChild(m);
    }catch(e){}
  }

  var orig = window.luxConfirm;
  window.luxConfirm = function(message, title, okLabel){
    inject();
    if(typeof orig === 'function'){
      var p = orig(message, title, okLabel);
      setTimeout(function(){
        forceOnTop(document.getElementById('luxConfirmModal'));
      }, 0);
      setTimeout(function(){
        forceOnTop(document.getElementById('luxConfirmModal'));
      }, 50);
      return p;
    }
    return new Promise(function(resolve){
      var m = document.getElementById('luxConfirmModal');
      if(!m){
        m = document.createElement('div');
        m.id = 'luxConfirmModal';
        m.className = 'modal-overlay';
        m.innerHTML = '<div class="lux-modal lux-confirm-modal"><div class="lux-confirm-icon">\u26a0\ufe0f</div><h2 id="luxConfirmTitle">\u062a\u0623\u0643\u064a\u062f</h2><p class="lux-confirm-msg" id="luxConfirmMsg"></p><div class="lux-confirm-actions"><button type="button" class="btn btn-danger" id="luxConfirmOk">\u062d\u0630\u0641</button><button type="button" class="btn btn-secondary" id="luxConfirmCancel">\u0625\u0644\u063a\u0627\u0621</button></div></div>';
        document.body.appendChild(m);
      }
      document.getElementById('luxConfirmTitle').textContent = title || '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0639\u0645\u0644\u064a\u0629';
      document.getElementById('luxConfirmMsg').textContent = message || '';
      document.getElementById('luxConfirmOk').textContent = okLabel || '\u062a\u0623\u0643\u064a\u062f';
      forceOnTop(m);
      function close(v){
        m.classList.remove('show','edit-layer');
        m.style.display = 'none';
        resolve(v);
      }
      document.getElementById('luxConfirmOk').onclick = function(){ close(true); };
      document.getElementById('luxConfirmCancel').onclick = function(){ close(false); };
      m.onclick = function(e){ if(e.target === m) close(false); };
    });
  };

  inject();
  setTimeout(inject, 500);
  setTimeout(inject, 1500);
})();
