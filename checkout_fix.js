(function(){
  function checkout(e){
    if(e){ try{ e.preventDefault(); e.stopPropagation(); }catch(err){} }
    var list=null;
    try{ if(typeof cart!=='undefined' && Array.isArray(cart)) list=cart; }catch(err){}
    if(!list){ try{ if(window.cart&&Array.isArray(window.cart)) list=window.cart; }catch(err){} }
    if(!list) list=[];
    if(!list.length){
      if(typeof showToast==='function') showToast('السلة فارغة');
      return;
    }
    var shop='007';
    try{ if(typeof data!=='undefined'&&data&&data.shopName) shop=String(data.shopName).trim()||'007'; }catch(err){}
    if(shop==='007'){
      var el=document.getElementById('shopName');
      if(el&&el.textContent.trim()) shop=el.textContent.trim();
    }
    var lines=['طلب من محل '+shop+':',''];
    list.forEach(function(i){
      var name=i.name||'منتج';
      var qty=Number(i.qty)||1;
      var usd=Number(i.priceUsd)||0;
      var syp=Number(i.priceSyp)||0;
      lines.push('• '+name+' × '+qty+' — $'+(usd*qty)+' / '+(syp*qty).toLocaleString()+' ل.س');
    });
    var totalUsd=list.reduce(function(s,i){return s+(Number(i.priceUsd)||0)*(Number(i.qty)||1);},0);
    var totalSyp=list.reduce(function(s,i){return s+(Number(i.priceSyp)||0)*(Number(i.qty)||1);},0);
    lines.push('');
    lines.push('المجموع: $'+totalUsd.toLocaleString()+' / '+totalSyp.toLocaleString()+' ل.س');
    var msg=lines.join('\n');
    var phone='';
    try{ if(typeof data!=='undefined'&&data&&data.whatsapp) phone=String(data.whatsapp).replace(/[^0-9]/g,''); }catch(err){}
    if(!phone){
      var waInp=document.getElementById('whatsappInput');
      if(waInp&&waInp.value) phone=String(waInp.value).replace(/[^0-9]/g,'');
    }
    if(!phone){
      if(typeof showToast==='function') showToast('أضف رقم واتساب من لوحة التحكم أولاً');
      else alert('أضف رقم واتساب من لوحة التحكم أولاً');
      return;
    }
    var url='https://wa.me/'+phone+'?text='+encodeURIComponent(msg);
    var opened=false;
    try{ var w=window.open(url,'_blank'); opened=!!w; }catch(err){}
    if(!opened) window.location.href=url;
  }
  function bind(){
    var btn=document.getElementById('checkoutBtn');
    if(!btn) return;
    btn.onclick=checkout;
  }
  bind();
  setTimeout(bind,100);
  setTimeout(bind,500);
  setTimeout(bind,1200);
  setTimeout(bind,2500);
})();
