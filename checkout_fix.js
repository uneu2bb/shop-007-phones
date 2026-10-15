(function(){
  function currentShopName() {
    var shop = '';
    try {
      if (window.data && data.shopName) shop = String(data.shopName).trim();
    } catch (e) {}
    if (!shop) {
      var el = document.getElementById('shopName');
      if (el) shop = (el.textContent || '').trim();
    }
    if (!shop) {
      var inp = document.getElementById('shopNameInput');
      if (inp && inp.value) shop = String(inp.value).trim();
    }
    return shop || '007';
  }

  function buildOrderMessage() {
    if (!window.cart || !cart.length) return null;
    var shop = currentShopName();
    var msg = 'طلب من محل ' + shop + ':\n\n';
    cart.forEach(function(i) {
      msg += '• ' + i.name + ' × ' + i.qty + ' — $' + (i.priceUsd * i.qty) + ' / ' + (i.priceSyp * i.qty).toLocaleString() + ' ل.س\n';
    });
    var totalUsd = cart.reduce(function(s, i){ return s + i.priceUsd * i.qty; }, 0);
    var totalSyp = cart.reduce(function(s, i){ return s + i.priceSyp * i.qty; }, 0);
    msg += '\nالمجموع: $' + totalUsd.toLocaleString() + ' / ' + totalSyp.toLocaleString() + ' ل.س';
    return msg;
  }

  window.buildWhatsAppOrderMessage = buildOrderMessage;
  window.getShopNameForOrder = currentShopName;

  function doCheckout() {
    var msg = buildOrderMessage();
    if (!msg) return;
    var phone = String((window.data && data.whatsapp) || '').replace(/[^0-9]/g, '');
    if (phone) {
      window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
    } else if (typeof showToast === 'function') {
      showToast('أضف رقم واتساب من لوحة التحكم أولاً');
    }
  }

  function bindCheckout() {
    var btn = document.getElementById('checkoutBtn');
    if (!btn) return;
    btn.onclick = doCheckout;
  }

  bindCheckout();
  setTimeout(bindCheckout, 200);
  setTimeout(bindCheckout, 800);
  setTimeout(bindCheckout, 2000);

  var _rs = window.renderSite;
  if (typeof _rs === 'function' && !_rs._checkoutPatched) {
    window.renderSite = function() {
      _rs.apply(this, arguments);
      bindCheckout();
    };
    window.renderSite._checkoutPatched = true;
  }
})();
