const SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || '';
const { createClient } = supabase;
let sb = null;
let cloudReady = false;

function initSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function showSetupBanner(msg) {
  let ban = document.getElementById('setupBanner');
  if (!ban) {
    ban = document.createElement('div');
    ban.id = 'setupBanner';
    ban.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fff;padding:10px 14px;font-size:.85rem;text-align:center';
    document.body.prepend(ban);
  }
  ban.textContent = msg;
}

async function uploadImage(file, folder) {
  if (!sb) throw new Error('Supabase not ready');
  const ext = (file.name && file.name.split('.').pop()) || 'jpg';
  const path = folder + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const { error } = await sb.storage.from('shop-images').upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
  if (error) throw error;
  const { data: urlData } = sb.storage.from('shop-images').getPublicUrl(path);
  return urlData.publicUrl;
}

async function loadFromCloud() {
  if (!sb) return false;
  const { data: settings, error: sErr } = await sb.from('shop_settings').select('*').eq('id', 1).maybeSingle();
  if (sErr) {
    if (String(sErr.message || '').includes('relation') || sErr.code === '42P01') {
      showSetupBanner('⚠️ الجداول غير جاهزة — شغّل SETUP.sql في Supabase SQL Editor');
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
  data.categories = (cats || []).map(c => ({ id: c.id, name: c.name, hidden: !!c.hidden, sort_order: c.sort_order }));
  data.products = (prods || []).map(p => ({
    id: p.id, name: p.name, categoryId: p.category_id,
    priceUsd: Number(p.price_usd) || 0, priceSyp: Number(p.price_syp) || 0,
    image: p.image_url || null, hidden: !!p.hidden, sort_order: p.sort_order,
    condition: p.condition || 'new',
    storage: p.storage || '',
    ram: p.ram || '',
    battery: p.battery != null ? Number(p.battery) : null,
    cleanliness: p.cleanliness != null ? Number(p.cleanliness) : null,
    description: p.description || ''
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
      const chunk = prods.slice(i, i + 20).map((p, idx) => ({ id: p.id, name: p.name, category_id: p.categoryId, price_usd: p.priceUsd, price_syp: p.priceSyp, image_url: p.image || null, hidden: !!p.hidden, sort_order: i + idx }));
      const { error } = await sb.from('products').upsert(chunk);
      if (error) { console.error(error); showToast('فشل رفع المنتجات: ' + error.message); return; }
    }
  }
  await sb.from('shop_settings').upsert({ id: 1, shop_name: DEFAULT_DATA.shopName || '007', whatsapp: DEFAULT_DATA.whatsapp || '', facebook: DEFAULT_DATA.facebook || '', instagram: DEFAULT_DATA.instagram || '' });
  showToast('تم رفع البيانات الأولية أونلاين ✓');
}

async function saveSettingsCloud() {
  const { error } = await sb.from('shop_settings').upsert({ id: 1, shop_name: data.shopName, logo_url: data.logo, cover_url: data.cover, whatsapp: data.whatsapp || '', facebook: data.facebook || '', instagram: data.instagram || '', admin_password: data.adminPassword || '', updated_at: new Date().toISOString() });
  if (error) { showToast('خطأ الحفظ: ' + error.message); return false; }
  return true;
}
async function upsertCategory(cat, sortOrder) {
  const { error } = await sb.from('categories').upsert({ id: cat.id, name: cat.name, hidden: !!cat.hidden, sort_order: sortOrder != null ? sortOrder : data.categories.findIndex(c => c.id === cat.id) });
  if (error) showToast('خطأ: ' + error.message);
  return !error;
}
async function deleteCategoryCloud(id) {
  await sb.from('products').delete().eq('category_id', id);
  const { error } = await sb.from('categories').delete().eq('id', id);
  if (error) showToast('خطأ: ' + error.message);
  return !error;
}
async function upsertProduct(p, sortOrder) {
  const row = {
    id: p.id, name: p.name, category_id: p.categoryId,
    price_usd: p.priceUsd, price_syp: p.priceSyp,
    image_url: p.image || null, hidden: !!p.hidden,
    sort_order: sortOrder != null ? sortOrder : data.products.findIndex(x => x.id === p.id),
    condition: p.condition || 'new',
    storage: p.storage || '',
    ram: p.ram || '',
    battery: p.battery != null && p.battery !== '' ? Number(p.battery) : null,
    cleanliness: p.cleanliness != null && p.cleanliness !== '' ? Number(p.cleanliness) : null,
    description: p.description || ''
  };
  const { error } = await sb.from('products').upsert(row);
  if (error) showToast('خطأ: ' + error.message);
  return !error;
}
async function deleteProductCloud(id) {
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) showToast('خطأ: ' + error.message);
  return !error;
}
async function saveCategoryOrder() {
  const rows = data.categories.map((c, i) => ({ id: c.id, name: c.name, hidden: !!c.hidden, sort_order: i }));
  const { error } = await sb.from('categories').upsert(rows);
  if (error) showToast('خطأ الترتيب: ' + error.message);
}
async function saveProductOrder() {
  const rows = data.products.map((p, i) => ({
    id: p.id, name: p.name, category_id: p.categoryId,
    price_usd: p.priceUsd, price_syp: p.priceSyp, image_url: p.image || null, hidden: !!p.hidden, sort_order: i,
    condition: p.condition || 'new', storage: p.storage || '', ram: p.ram || '',
    battery: p.battery != null && p.battery !== '' ? Number(p.battery) : null,
    cleanliness: p.cleanliness != null && p.cleanliness !== '' ? Number(p.cleanliness) : null,
    description: p.description || ''
  }));
  for (let i = 0; i < rows.length; i += 25) {
    const { error } = await sb.from('products').upsert(rows.slice(i, i + 25));
    if (error) { showToast('خطأ الترتيب: ' + error.message); return; }
  }
}
