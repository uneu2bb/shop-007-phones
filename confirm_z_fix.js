(function(){
  var STYLE_ID = 'lux-confirm-z-fix-v2';

  function inject(){
    var old = document.getElementById('lux-confirm-z-fix');
    if(old) try{ old.remove(); }catch(e){}
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
      '#luxConfirmModal.show{ display: flex !important; }',
      '#luxConfirmModal:not(.show){ display: none !important; }',
      '#luxConfirmModal .lux-confirm-modal{',
      '  position: relative; z-index: 1; max-width: 360px; width: 100%;',
      '  padding: 1.75rem 1.5rem 1.5rem; text-align: center; border-radius: 20px;',
      '  background: linear-gradient(180deg, #1c1a14, #12100c);',
      '  border: 1px solid rgba(201,162,39,.35);',
      '  box-shadow: 0 20px 60px rgba(0,0,0,.6);',
      '}',
      '#adminModal.modal-overlay{z-index:1300 !important;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function hideConfirm(){
    var m = document.getElementById('luxConfirmModal');
    if(!m) return;
    m.classList.remove('show', 'edit-layer');
    m.style.display = 'none';
    m.style.pointerEvents = 'none';
  }

  function showConfirm(){
    var m = document.getElementById('luxConfirmModal');
    if(!m) return;
    try{ document.body.appendChild(m); }catch(e){}
    m.style.zIndex = '1700';
    m.style.position = 'fixed';
    m.style.inset = '0';
    m.style.display = 'flex';
    m.style.alignItems = 'center';
    m.style.justifyContent = 'center';
    m.style.pointerEvents = 'auto';
    m.classList.add('show');
  }

  var pendingResolve = null;

  function bindButtons(){
    var ok = document.getElementById('luxConfirmOk');
    var cancel = document.getElementById('luxConfirmCancel');
    var m = document.getElementById('luxConfirmModal');
    if(ok){
      ok.onclick = function(e){
        if(e){ e.preventDefault(); e.stopPropagation(); }
        var r = pendingResolve;
        pendingResolve = null;
        hideConfirm();
        if(r) r(true);
      };
    }
    if(cancel){
      cancel.onclick = function(e){
        if(e){ e.preventDefault(); e.stopPropagation(); }
        var r = pendingResolve;
        pendingResolve = null;
        hideConfirm();
        if(r) r(false);
      };
    }
    if(m){
      m.onclick = function(e){
        if(e.target === m){
          var r = pendingResolve;
          pendingResolve = null;
          hideConfirm();
          if(r) r(false);
        }
      };
    }
  }

  window.luxConfirm = function(message, title, okLabel){
    inject();
    var m = document.getElementById('luxConfirmModal');
    if(!m){
      m = document.createElement('div');
      m.id = 'luxConfirmModal';
      m.className = 'modal-overlay';
      m.innerHTML =
        '<div class="lux-modal lux-confirm-modal">' +
          '<div class="lux-confirm-icon">\u26a0\ufe0f</div>' +
          '<h2 id="luxConfirmTitle">\u062a\u0623\u0643\u064a\u062f</h2>' +
          '<p class="lux-confirm-msg" id="luxConfirmMsg"></p>' +
          '<div class="lux-confirm-actions">' +
            '<button type="button" class="btn btn-danger" id="luxConfirmOk">\u062d\u0630\u0641</button>' +
            '<button type="button" class="btn btn-secondary" id="luxConfirmCancel">\u0625\u0644\u063a\u0627\u0621</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(m);
    }
    var t = document.getElementById('luxConfirmTitle');
    var msg = document.getElementById('luxConfirmMsg');
    var ok = document.getElementById('luxConfirmOk');
    if(t) t.textContent = title || '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0639\u0645\u0644\u064a\u0629';
    if(msg) msg.textContent = message || '';
    if(ok) ok.textContent = okLabel || '\u062a\u0623\u0643\u064a\u062f';

    showConfirm();
    bindButtons();

    return new Promise(function(resolve){
      pendingResolve = resolve;
    });
  };

  function patchDeletes(){
    if(typeof window.deleteCategory === 'function' && !window.deleteCategory._z2){
      window.deleteCategory = async function(id){
        var cat = (data.categories || []).find(function(c){ return c.id === id; });
        var name = cat ? cat.name : '\u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645';
        var ok = await window.luxConfirm(
          '\u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0642\u0633\u0645 \u00ab' + name + '\u00bb \u0648\u062c\u0645\u064a\u0639 \u0645\u0646\u062a\u062c\u0627\u062a\u0647 \u0646\u0647\u0627\u0626\u064a\u0627\u064b. \u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u0644\u062a\u0631\u0627\u062c\u0639.',
          '\u062d\u0630\u0641 \u0627\u0644\u0642\u0633\u0645\u061f',
          '\u062d\u0630\u0641 \u0646\u0647\u0627\u0626\u064a\u0627\u064b'
        );
        if(!ok) return;
        if(typeof deleteCategoryCloud === 'function') await deleteCategoryCloud(id);
        data.categories = data.categories.filter(function(c){ return c.id !== id; });
        data.products = data.products.filter(function(p){ return p.categoryId !== id; });
        if(typeof renderSite === 'function') renderSite();
        if(typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641 \u0623\u0648\u0646\u0644\u0627\u064a\u0646');
      };
      window.deleteCategory._z2 = true;
    }
    if(typeof window.deleteProduct === 'function' && !window.deleteProduct._z2){
      window.deleteProduct = async function(id){
        var p = (data.products || []).find(function(x){ return x.id === id; });
        var name = p ? p.name : '\u0647\u0630\u0627 \u0627\u0644\u0645\u0646\u062a\u062c';
        var ok = await window.luxConfirm(
          '\u0633\u064a\u062a\u0645 \u062d\u0630\u0641 \u00ab' + name + '\u00bb \u0646\u0647\u0627\u0626\u064a\u0627\u064b \u0645\u0646 \u0627\u0644\u0645\u062a\u062c\u0631.',
          '\u062d\u0630\u0641 \u0627\u0644\u0645\u0646\u062a\u062c\u061f',
          '\u062d\u0630\u0641 \u0646\u0647\u0627\u0626\u064a\u0627\u064b'
        );
        if(!ok) return;
        if(typeof deleteProductCloud === 'function') await deleteProductCloud(id);
        data.products = data.products.filter(function(x){ return x.id !== id; });
        if(typeof renderSite === 'function') renderSite();
        if(typeof showToast === 'function') showToast('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641 \u0623\u0648\u0646\u0644\u0627\u064a\u0646');
      };
      window.deleteProduct._z2 = true;
    }
  }

  inject();
  patchDeletes();
  setTimeout(patchDeletes, 300);
  setTimeout(patchDeletes, 1000);
  setTimeout(patchDeletes, 2000);
})();
