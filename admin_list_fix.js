(function(){
  var STYLE_ID = 'admin-list-lux-css';
  var openAdminCatId = null;

  function injectCss(){
    if(document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#productsList.admin-products-grouped, .admin-products-grouped{',
      '  list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px;',
      '}',
      '.admin-cat-section{',
      '  list-style:none;border:1px solid rgba(201,162,39,.28);border-radius:16px;',
      '  overflow:hidden;background:linear-gradient(145deg,#1a1810,#12100c);',
      '  box-shadow:0 4px 18px rgba(0,0,0,.35);',
      '}',
      '.admin-cat-header{',
      '  display:flex;align-items:center;gap:10px;width:100%;',
      '  padding:14px 16px;',
      '  background:linear-gradient(145deg,#221e14,#16140f);',
      '  border:none;border-bottom:1px solid rgba(201,162,39,.15);',
      '  color:#f0ebe0;font-family:inherit;font-size:.95rem;font-weight:700;',
      '  cursor:pointer;text-align:right;',
      '}',
      '.admin-cat-header:hover{background:linear-gradient(145deg,#2a2418,#1a1810);}',
      '.admin-cat-title{',
      '  flex:1;background:linear-gradient(135deg,#e8c547,#c9a227);',
      '  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;',
      '}',
      '.admin-cat-count{',
      '  background:rgba(201,162,39,.2);color:#c9a227;font-size:.75rem;',
      '  padding:4px 11px;border-radius:999px;font-weight:700;border:1px solid rgba(201,162,39,.3);',
      '}',
      '.admin-cat-chevron{color:#c9a227;font-size:.85rem;width:18px;text-align:center;}',
      '.admin-cat-products{',
      '  list-style:none;padding:10px;margin:0;display:flex;flex-direction:column;gap:8px;',
      '  background:#0f0e0b;',
      '}',
      '.admin-cat-products .admin-item{',
      '  display:flex;align-items:center;gap:10px;flex-wrap:wrap;',
      '  padding:12px 12px;border-radius:14px;',
      '  background:linear-gradient(145deg,#1c1a14,#14120e);',
      '  border:1px solid rgba(201,162,39,.18);',
      '}',
      '.admin-cat-products .admin-item.hidden-item{opacity:.55;}',
      '.admin-cat-products .item-info{flex:1;min-width:120px;text-align:right;}',
      '.admin-cat-products .item-info strong{',
      '  display:block;color:#f0ebe0;font-size:.92rem;font-weight:700;',
      '  word-break:break-word;line-height:1.35;',
      '}',
      '.admin-cat-products .item-info small{color:#a89b7a;font-size:.78rem;}',
      '.admin-cat-products .item-actions{',
      '  display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-start;',
      '}',
      '.admin-cat-products .item-actions .btn{',
      '  padding:7px 12px;border-radius:10px;font-size:.78rem;font-weight:700;',
      '  font-family:inherit;border:none;cursor:pointer;white-space:nowrap;',
      '}',
      '.admin-cat-products .item-actions .btn-secondary{',
      '  background:#252218;color:#e8e2d6;border:1px solid rgba(201,162,39,.25);',
      '}',
      '.admin-cat-products .item-actions .btn-danger{',
      '  background:transparent;color:#f87171;border:1px solid rgba(239,68,68,.45);',
      '}',
      '.admin-cat-products .drag-handle{',
      '  color:#c9a227;cursor:grab;font-size:1.1rem;padding:0 4px;user-select:none;',
      '}',
      '#categoriesList .admin-item{',
      '  display:flex;align-items:center;gap:10px;flex-wrap:wrap;',
      '  padding:12px;border-radius:14px;margin-bottom:8px;',
      '  background:linear-gradient(145deg,#1c1a14,#14120e);',
      '  border:1px solid rgba(201,162,39,.2);',
      '}',
      '#categoriesList .item-info{flex:1;text-align:right;}',
      '#categoriesList .item-info strong{color:#f0ebe0;}',
      '#categoriesList .item-actions{display:flex;gap:6px;flex-wrap:wrap;}',
      '#categoriesList .item-actions .btn{padding:7px 12px;border-radius:10px;font-size:.78rem;font-weight:700;font-family:inherit;border:none;cursor:pointer;}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(s);
  }

  function escapeHtml(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function doEditProduct(id){
    if(typeof openEditProduct === 'function') return openEditProduct(id);
    if(typeof editProduct === 'function') return editProduct(id);
    if(typeof window.openEditProduct === 'function') return window.openEditProduct(id);
  }

  function doEditCategory(id){
    if(typeof editCategory === 'function') return editCategory(id);
  }

  function doDeleteProduct(id){
    if(typeof deleteProduct === 'function') return deleteProduct(id);
  }

  function doDeleteCategory(id){
    if(typeof deleteCategory === 'function') return deleteCategory(id);
  }

  window.renderAdminLists = function(){
    injectCss();
    var catList = document.getElementById('categoriesList');
    if(catList){
      catList.innerHTML = '';
      (data.categories || []).forEach(function(cat){
        var li = document.createElement('li');
        li.className = 'admin-item' + (cat.hidden ? ' hidden-item' : '');
        li.draggable = true;
        li.dataset.id = cat.id;
        li.dataset.type = 'category';
        var hideLabel = cat.hidden ? 'إظهار' : 'إخفاء';
        var count = (data.products || []).filter(function(p){ return p.categoryId === cat.id; }).length;
        li.innerHTML =
          '<span class="drag-handle">⣿</span>' +
          '<div class="item-info"><strong>' + escapeHtml(cat.name) + (cat.hidden ? ' (مخفي)' : '') + '</strong>' +
          '<small>' + count + ' منتج</small></div>' +
          '<div class="item-actions">' +
          '<button type="button" class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" data-act="edit">تعديل</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-act="del">حذف</button></div>';
        li.querySelector('[data-act="hide"]').onclick = async function(e){
          e.preventDefault(); e.stopPropagation();
          cat.hidden = !cat.hidden;
          if(typeof upsertCategory === 'function') await upsertCategory(cat);
          if(typeof renderSite === 'function') renderSite();
          else window.renderAdminLists();
          if(typeof showToast === 'function') showToast(cat.hidden ? 'تم إخفاء القسم' : 'تم إظهار القسم');
        };
        li.querySelector('[data-act="edit"]').onclick = function(e){
          e.preventDefault(); e.stopPropagation();
          doEditCategory(cat.id);
        };
        li.querySelector('[data-act="del"]').onclick = async function(e){
          e.preventDefault(); e.stopPropagation();
          doDeleteCategory(cat.id);
        };
        if(typeof setupDrag === 'function') setupDrag(li);
        catList.appendChild(li);
      });
    }

    var prodList = document.getElementById('productsList');
    if(!prodList) return;
    prodList.innerHTML = '';
    prodList.className = 'admin-list admin-products-grouped';

    var cats = (data.categories || []).slice();
    var uncategorized = (data.products || []).filter(function(p){
      return !cats.some(function(c){ return c.id === p.categoryId; });
    });

    function renderCatSection(cat, prods){
      var section = document.createElement('li');
      section.className = 'admin-cat-section';
      var catKey = cat ? cat.id : '__none__';
      var isOpen = openAdminCatId === catKey;

      var header = document.createElement('button');
      header.type = 'button';
      header.className = 'admin-cat-header';
      header.innerHTML =
        '<span class="admin-cat-title">' + escapeHtml(cat ? cat.name : 'بدون قسم') + '</span>' +
        '<span class="admin-cat-count">' + prods.length + '</span>' +
        '<span class="admin-cat-chevron">' + (isOpen ? '▾' : '◂') + '</span>';
      header.onclick = function(e){
        e.preventDefault(); e.stopPropagation();
        openAdminCatId = isOpen ? null : catKey;
        window.renderAdminLists();
      };
      section.appendChild(header);

      if(isOpen){
        var ul = document.createElement('ul');
        ul.className = 'admin-cat-products';
        prods.forEach(function(p){
          var li = document.createElement('li');
          li.className = 'admin-item' + (p.hidden ? ' hidden-item' : '');
          li.draggable = true;
          li.dataset.id = p.id;
          li.dataset.type = 'product';
          var hideLabel = p.hidden ? 'إظهار' : 'إخفاء';
          var priceLine = '$' + (p.priceUsd || 0) + ' / ' + Number(p.priceSyp || 0).toLocaleString() + ' ل.س';
          li.innerHTML =
            '<span class="drag-handle">⣿</span>' +
            '<div class="item-info"><strong>' + escapeHtml(p.name) + (p.hidden ? ' (مخفي)' : '') + '</strong>' +
            '<small>' + priceLine + '</small></div>' +
            '<div class="item-actions">' +
            '<button type="button" class="btn btn-secondary btn-sm" data-act="hide">' + hideLabel + '</button>' +
            '<button type="button" class="btn btn-secondary btn-sm" data-act="edit">تعديل</button>' +
            '<button type="button" class="btn btn-danger btn-sm" data-act="del">حذف</button></div>';
          li.querySelector('[data-act="hide"]').onclick = async function(e){
            e.preventDefault(); e.stopPropagation();
            p.hidden = !p.hidden;
            if(typeof upsertProduct === 'function') await upsertProduct(p);
            if(typeof renderSite === 'function') renderSite();
            window.renderAdminLists();
            if(typeof showToast === 'function') showToast(p.hidden ? 'تم إخفاء المنتج' : 'تم إظهار المنتج');
          };
          li.querySelector('[data-act="edit"]').onclick = function(e){
            e.preventDefault(); e.stopPropagation();
            doEditProduct(p.id);
          };
          li.querySelector('[data-act="del"]').onclick = function(e){
            e.preventDefault(); e.stopPropagation();
            doDeleteProduct(p.id);
          };
          if(typeof setupDrag === 'function') setupDrag(li);
          ul.appendChild(li);
        });
        section.appendChild(ul);
      }
      prodList.appendChild(section);
    }

    cats.forEach(function(cat){
      var prods = (data.products || []).filter(function(p){ return p.categoryId === cat.id; });
      renderCatSection(cat, prods);
    });
    if(uncategorized.length) renderCatSection(null, uncategorized);
  };

  function boot(){
    injectCss();
    if(typeof data !== 'undefined' && data) {
      try { window.renderAdminLists(); } catch(e){}
    }
  }

  setTimeout(boot, 200);
  setTimeout(boot, 800);
  setTimeout(boot, 1800);
  setTimeout(boot, 3000);

  var _rs = window.renderSite;
  if(typeof _rs === 'function'){
    window.renderSite = function(){
      var r = _rs.apply(this, arguments);
      setTimeout(function(){ try{ window.renderAdminLists(); }catch(e){} }, 20);
      return r;
    };
  }

  var _oa = window.openAdmin;
  if(typeof _oa === 'function'){
    window.openAdmin = function(){
      var r = _oa.apply(this, arguments);
      setTimeout(function(){ try{ window.renderAdminLists(); }catch(e){} }, 50);
      return r;
    };
  }
})();
