(function(){
  function shopName(){
    try{ if(data&&data.shopName) return String(data.shopName).trim(); }catch(e){}
    var el=document.getElementById('shopName');
    if(el&&el.textContent) return el.textContent.trim();
    var inp=document.getElementById('shopNameInput');
    if(inp&&inp.value) return String(inp.value).trim();
    return '007';
  }
  function checkout(){
    if(!window.cart||!cart.length){
      if(typeof showToast==='function') showToast('السلة فارغة');
      return;
    }
    var shop=shopName();
    var lines=['طلب من محل '+shop+':',''];
    cart.forEach(function(i){
      lines.push('• '+i.name+' × '+i.qty+' — $'+(i.priceUsd*i.qty)+' / '+(i.priceSyp*i.qty).toLocaleString()+' ل.س');
    });
    var totalUsd=cart.reduce(function(s,i){return s+i.priceUsd*i.qty;},0);
    var totalSyp=cart.reduce(function(s,i){return s+i.priceSyp*i.qty;},0);
    lines.push('');
    lines.push('المجموع: $'+totalUsd.toLocaleString()+' / '+totalSyp.toLocaleString()+' ل.س');
    var msg=lines.join('\n');
    var phone=String((window.data&&data.whatsapp)||'').replace(/[^0-9]/g,'');
    if(!phone){
      if(typeof showToast==='function') showToast('أضف رقم واتساب من لوحة التحكم أولاً');
      else alert('أضف رقم واتساب من لوحة التحكم أولاً');
      return;
    }
    var url='https://wa.me/'+phone+'?text='+encodeURIComponent(msg);
    var opened=false;
    try{
      var w=window.open(url,'_blank');
      opened=!!w;
    }catch(e){}
    if(!opened){
      window.location.href=url;
    }
  }
  function bind(){
    var btn=document.getElementById('checkoutBtn');
    if(!btn) return;
    btn.onclick=function(e){
      if(e){ e.preventDefault(); e.stopPropagation(); }
      checkout();
    };
  }
  bind();
  setTimeout(bind,100);
  setTimeout(bind,500);
  setTimeout(bind,1500);
  setTimeout(bind,3000);
  document.addEventListener('click',function(e){
    var t=e.target;
    if(!t) return;
    if(t.id==='checkoutBtn'||(t.closest&&t.closest('#checkoutBtn'))){
      e.preventDefault();
      e.stopPropagation();
      checkout();
    }
  },true);
})();
