(function(){
  if(document.getElementById('lux-upload-btn-css')) return;
  var s = document.createElement('style');
  s.id = 'lux-upload-btn-css';
  s.textContent = [
    '#editUploadImgBtn,',
    '#editProductModal .btn-upload-img,',
    '.edit-img-actions .btn-upload-img{',
    '  display:inline-flex!important;',
    '  align-items:center;',
    '  justify-content:center;',
    '  gap:8px;',
    '  margin-top:10px;',
    '  padding:12px 20px!important;',
    '  min-height:44px;',
    '  border:none!important;',
    '  border-radius:14px!important;',
    '  font-family:Cairo,sans-serif!important;',
    '  font-size:.9rem!important;',
    '  font-weight:700!important;',
    '  letter-spacing:.02em;',
    '  color:#1a1205!important;',
    '  cursor:pointer;',
    '  background:linear-gradient(145deg,#f0d878 0%,#e8c547 35%,#c9a227 70%,#a8841a 100%)!important;',
    '  box-shadow:0 4px 16px rgba(201,162,39,.45), inset 0 1px 0 rgba(255,255,255,.35)!important;',
    '  border:1px solid rgba(255,230,150,.4)!important;',
    '  transition:transform .15s ease, box-shadow .15s ease;',
    '  -webkit-tap-highlight-color:transparent;',
    '}',
    '#editUploadImgBtn:active,',
    '#editProductModal .btn-upload-img:active{',
    '  transform:scale(.97);',
    '  box-shadow:0 2px 8px rgba(201,162,39,.35)!important;',
    '}',
    '#editUploadImgBtn:hover,',
    '#editProductModal .btn-upload-img:hover{',
    '  box-shadow:0 6px 20px rgba(201,162,39,.55), inset 0 1px 0 rgba(255,255,255,.4)!important;',
    '}'
  ].join('\n');
  (document.head||document.documentElement).appendChild(s);

  function polish(){
    var btn = document.getElementById('editUploadImgBtn');
    if(!btn) return;
    var t = (btn.textContent||'').trim();
    if(t.indexOf('\u0631\u0641\u0639') >= 0 || !t){
      btn.innerHTML = '<span style="font-size:1.05rem">\ud83d\udcf7</span><span>\u0631\u0641\u0639 \u0635\u0648\u0631\u0629</span>';
    }
  }
  polish();
  setTimeout(polish, 500);
  setTimeout(polish, 1500);
})();
