(function(){
  function compressImageFile(file, opts){
    opts = opts || {};
    var maxDim = opts.maxDim || 1600;
    var quality = opts.quality != null ? opts.quality : 0.82;
    var minBytes = opts.minBytes != null ? opts.minBytes : 180 * 1024;

    return new Promise(function(resolve){
      try {
        if(!file || !(file instanceof Blob)) return resolve(file);
        var type = file.type || '';
        if(type && type.indexOf('image/') !== 0) return resolve(file);
        if(file.size && file.size < minBytes) return resolve(file);

        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function(){
          try {
            var w = img.naturalWidth || img.width;
            var h = img.naturalHeight || img.height;
            if(!w || !h){ URL.revokeObjectURL(url); return resolve(file); }

            if(w > maxDim || h > maxDim){
              if(w >= h){ h = Math.round(h * maxDim / w); w = maxDim; }
              else { w = Math.round(w * maxDim / h); h = maxDim; }
            }

            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);

            canvas.toBlob(function(blob){
              if(!blob){ resolve(file); return; }
              if(blob.size >= file.size * 0.98){ resolve(file); return; }
              var base = (file.name || 'image').replace(/\.[^.]+$/, '');
              var out = new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
              resolve(out);
            }, 'image/jpeg', quality);
          } catch(e){
            try { URL.revokeObjectURL(url); } catch(x){}
            resolve(file);
          }
        };
        img.onerror = function(){
          try { URL.revokeObjectURL(url); } catch(x){}
          resolve(file);
        };
        img.src = url;
      } catch(e){
        resolve(file);
      }
    });
  }

  function optsForFolder(folder){
    folder = String(folder || '');
    if(folder === 'logo') return { maxDim: 800, quality: 0.88, minBytes: 80 * 1024 };
    if(folder === 'cover') return { maxDim: 1920, quality: 0.85, minBytes: 200 * 1024 };
    return { maxDim: 1600, quality: 0.82, minBytes: 180 * 1024 };
  }

  window.compressImageFile = compressImageFile;

  function wrapUpload(){
    if(typeof window.uploadImage === 'function' && !window.uploadImage._compressed){
      var orig = window.uploadImage;
      window.uploadImage = async function(file, folder){
        var compressed = await compressImageFile(file, optsForFolder(folder));
        return orig.call(this, compressed, folder);
      };
      window.uploadImage._compressed = true;
    }
    if(typeof window.uploadImageSafe === 'function' && !window.uploadImageSafe._compressed){
      var origS = window.uploadImageSafe;
      window.uploadImageSafe = async function(file, folder){
        var compressed = await compressImageFile(file, optsForFolder(folder));
        return origS.call(this, compressed, folder);
      };
      window.uploadImageSafe._compressed = true;
    }
  }

  function hookFileInput(input){
    if(!input || input._compressHooked) return;
    input._compressHooked = true;
    input.addEventListener('change', function(){
      var files = input.files;
      if(!files || !files[0]) return;
      var file = files[0];
      if(!file.type || file.type.indexOf('image/') !== 0) return;

      var folder = 'products';
      if(input.id === 'logoInput') folder = 'logo';
      else if(input.id === 'coverInput') folder = 'cover';

      compressImageFile(file, optsForFolder(folder)).then(function(out){
        if(out === file) return;
        try {
          var dt = new DataTransfer();
          dt.items.add(out);
          input.files = dt.files;
        } catch(err){}
        try {
          if(input.id === 'productImgInput'){
            try { productImageFile = out; } catch(e){}
            window.productImageFile = out;
          }
          if(input.id === 'editProductImgInput'){
            try { editImageFile = out; } catch(e){}
            window.editImageFile = out;
          }
        } catch(err){}
      });
    }, true);
  }

  function hookAllInputs(){
    ['productImgInput','editProductImgInput','logoInput','coverInput'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) hookFileInput(el);
    });
    document.querySelectorAll('input[type="file"][accept*="image"]').forEach(hookFileInput);
  }

  function boot(){
    wrapUpload();
    hookAllInputs();
  }
  boot();
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
  setTimeout(boot, 3000);
  try {
    var obs = new MutationObserver(function(){ hookAllInputs(); wrapUpload(); });
    obs.observe(document.documentElement, { childList:true, subtree:true });
  } catch(e){}
})();
