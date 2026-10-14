const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_KEY = window.SUPABASE_ANON_KEY;
const DEFAULT_DATA = window.DEFAULT_DATA || { shopName: '007', logo: null, cover: null, whatsapp: '', facebook: '', instagram: '', categories: [], products: [] };
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let data = { shopName: '007', logo: null, cover: null, whatsapp: '', facebook: '', instagram: '', adminPassword: '', categories: [], products: [] };
let cart = [];
let currentCatId = 'all';
let searchQuery = '';
let editingProductId = null;
let adminUnlocked = false;
let frontDragId = null;
let cloudReady = false;

const CART_KEY = 'shop007_cart_v1';

function loadCart() {
  try { const s = localStorage.getItem(CART_KEY); if (s) cart = JSON.parse(s) || []; } catch (e) { cart = []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartUI(); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function showSetupBanner(msg) {
  let el = document.getElementById('setupBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'setupBanner';
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fff;padding:12px 16px;text-align:center;font-size:0.9rem;';
    document.body.prepend(el);
  }
  el.innerHTML = msg;
}

async function uploadImage(file, folder) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = folder + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const { error } = await sb.storage.from('shop-images').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  const { data: urlData } = sb.storage.from('shop-images').getPublicUrl(path);
  return urlData.publicUrl;
}

async function loadFromCloud() {
  const { data: settings, error: sErr } = await sb.from('shop_settings').select('*').eq('id', 1).maybeSingle();
  if (sErr) {
    console.error(sErr);
    if (sErr.code === 'PGRST205' || (sErr.message && sErr.message.includes('schema cache'))) {
      showSetupBanner('⚠️ يجب تشغيل ملف SETUP.sql مرة واحدة في Supabase → SQL Editor ثم أعد تحميل الصفحة');
      cloudReady = false;
      return false;
    }
    showToast('خطأ في الاتصال: ' + sErr.message);
    return false;
  }
  const { data: cats, error: cErr } = await sb.from('categories').select('*').order('sort_order');
  const { data: prods, error: pErr } = await sb.from('products').select('*').order('sort_order');
  if (cErr || pErr) {
    showSetupBanner('⚠️ الجداول غير جاهزة — شغّل SETUP.sql في Supabase SQL Editor');
    cloudReady = false;
    return false;
  }

  if (settings) {
    data.shopName = settings.shop_name || '007';
    data.logo = settings.logo_url || null;
    data.cover = settings.cover_url || null;
    data.whatsapp = settings.whatsapp || '';
    data.facebook = settings.facebook || '';
    data.instagram = settings.instagram || '';
    data.adminPassword = settings.admin_password || '';
  }

  data.categories = (cats || []).map(c => ({
    id: c.id, name: c.name, hidden: !!c.hidden, sort_order: c.sort_order
  }));
  data.products = (prods || []).map(p => ({
    id: p.id, name: p.name, categoryId: p.category_id,
    priceUsd: Number(p.price_usd) || 0, priceSyp: Number(p.price_syp) || 0,
    image: p.image_url || null, hidden: !!p.hidden, sort_order: p.sort_order
  }));

  if (data.categories.length === 0 && DEFAULT_DATA.categories && DEFAULT_DATA.categories.length) {
    await seedDefaults();
    return loadFromCloud();
  }

  cloudReady = true;
  const ban = document.getElementById('setupBanner');
  if (ban) ban.remove();
  return true;
}

async function seedDefaults() {
  showToast('جاري رفع البيانات الأولية...');
  const cats = DEFAULT_DATA.categories || [];
  const prods = DEFAULT_DATA.products || [];
  if (cats.length) {
    const rows = cats.map((c, i) => ({ id: c.id, name: c.name, hidden: !!c.hidden, sort_order: i }));
    const { error } = await sb.from('categories').upsert(rows);
    if (error) { console.error(error); showToast('فشل رفع الأقسام: ' + error.message); return; }
  }
  if (prods.length) {
    for (let i = 0; i < prods.length; i += 20) {
      const chunk = prods.slice(i, i + 20).map((p, idx) => ({
        id: p.id, name: p.name, category_id: p.categoryId,
        price_usd: p.priceUsd, price_syp: p.priceSyp,
        image_url: p.image || null, hidden: !!p.hidden, sort_order: i + idx
      }));
      const { error } = await sb.from('products').upsert(chunk);
      if (error) { console.error(error); showToast('فشل رفع المنتجات: ' + error.message); return; }
    }
  }
  await sb.from('shop_settings').upsert({
    id: 1, shop_name: DEFAULT_DATA.shopName || '007',
    whatsapp: DEFAULT_DATA.whatsapp || '', facebook: DEFAULT_DATA.facebook || '',
    instagram: DEFAULT_DATA.instagram || ''
  });
  showToast('تم رفع البيانات الأولية أونلاين ✓');
}
