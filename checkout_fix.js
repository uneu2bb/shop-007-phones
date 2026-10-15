(function(){
  function bindCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;
    btn.onclick = function() {
      if (!cart || !cart.length) return;
      var shop = (data && data.shopName) ? String(data.shopName).trim() : '007';
      if (!shop) shop = '007';
      var msg = 'طلب من محل ' + shop + ':\n\n';
      cart.forEach(function(i) {
        msg += '• ' + i.name + ' × ' + i.qty + ' — $' + (i.priceUsd * i.qty) + ' / ' + (i.priceSyp * i.qty).toLocaleString() + ' ل.س\n';
      });
      var totalUsd = cart.reduce(function(s, i){ return s + i.priceUsd * i.qty; }, 0);
      var totalSyp = cart.reduce(function(s, i){ return s + i.priceSyp * i.qty; }, 0);
      msg += '\nالمجموع: $' + totalUsd.toLocaleString() + ' / ' + totalSyp.toLocaleString() + ' ل.س';
      var phone = String((data && data.whatsapp) || '').replace(/[^0-9]/g, '');
      if (phone) {
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
      } else {
        showToast('أضف رقم واتساب من لوحة التحكم أولاً');
      }
    };
  }
  bindCheckout();
  setTimeout(bindCheckout, 500);
  setTimeout(bindCheckout, 1500);
  var _rs = window.renderSite;
  if (typeof _rs === 'function') {
    window.renderSite = function() {
      _rs.apply(this, arguments);
      bindCheckout();
    };
  }
})();
