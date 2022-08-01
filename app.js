const canvas = document.getElementById('img-canvas');
const ctx = canvas.getContext('2d');

const sort_canvas = document.getElementById("sort-canvas");
const sort_ctx = sort_canvas.getContext('2d');

let wasm_module;
( async () => {
  wasm_module = await loadWASM('./build/release.wasm');
})()

async function mainWASM(width, height) {
  const { memory, memory_ptr, sortNew, generateRandom } = wasm_module.instance.exports;

    const wasmByteMemory = new Uint8Array(memory.buffer);

  let w = width, h = height;
  generateRandom(w, h); // written to wasm memory

  canvas.width = w;
  canvas.height = h;
  // canvas.style.transform = 'scale(5)'
  ctx.fillRect(0, 0, w, h);

  sort_canvas.width = w;
  sort_canvas.height = h;
  // sort_canvas.style.transform = 'scale(5)'
  sort_ctx.fillRect(0, 0, w, h);  

  let rnd_img = new ImageData(w, h);
  rnd_img.data.set(wasmByteMemory.slice(memory_ptr.valueOf(), (memory_ptr+(w*h)*4).valueOf()))
  console.log(rnd_img.data);

  ctx.putImageData(rnd_img, 0, 0);

  // wasmByteMemory.set(image_data.data, memory_ptr.valueOf());

  sortNew(width, height);

  const sort_img_data = sort_ctx.createImageData(width, height);

  const image_data_arr = wasmByteMemory.slice(memory_ptr.valueOf(), (memory_ptr+(w*h)*4).valueOf());
  console.log(image_data_arr)

  sort_img_data.data.set(image_data_arr);
  sort_ctx.putImageData(sort_img_data, 0, 0);
}

async function loadWASM(wasmModuleUrl, importObject) {
  if (!importObject) {
    importObject = {
      env: {
        abort(_msg, _file, line, column) {
          console.error("abort called at main.ts:" + line + ":" + column);
        },
        seed() {
          return (() => {
            return Date.now() * Math.random();
          })();
        }
      },
      index: {
        log: (d) => console.log(d)
      }
    };
  }

  const wasmModule = await WebAssembly.instantiateStreaming(fetch(wasmModuleUrl), importObject);
  return wasmModule;
}

document.getElementById('sort').addEventListener('click', async e => {
  let run = document.getElementById('wasm-js').value;

  let x1 = performance.now();

  let w = 500, h = 500;

  if(run == 'wasm') {
    await mainWASM(w, h);
  } else {
    let rnd_img = generateRandom(w, h);

    canvas.width = w;
    canvas.height = h;
    // canvas.style.transform = 'scale(5)'
    // ctx.fillRect(0, 0, w, h);
  
    sort_canvas.width = w;
    sort_canvas.height = h;
    // sort_canvas.style.transform = 'scale(5)'
    // sort_ctx.fillRect(0, 0, w, h);
  
   
    ctx.putImageData(rnd_img, 0, 0);    
    sorting(rnd_img.data,w,h);
    sort_ctx.putImageData(rnd_img, 0, 0);
  }
  let x2 = performance.now();
  document.getElementById('time_taken').innerHTML = `Time taken: ${(x2-x1).toFixed(2)}`;
});

function generateRandom(w, h) {
  let rnd_img = new ImageData(w, h);
  let rnd_img_data = rnd_img.data;

  for(let y=0;y<h;y++) {
    for(let x=0;x<w;x++) {
      let pixel_ind = (y*w + x) * 4;
      rnd_img_data[pixel_ind] = Math.floor(Math.random() * 256); //red
      rnd_img_data[pixel_ind+1] = Math.floor(Math.random() * 256); // green
      rnd_img_data[pixel_ind+2] = Math.floor(Math.random() * 256); // blue
      rnd_img_data[pixel_ind+3] = 255; // alpha
    }
  }
  return rnd_img;
}

function sorting(array, width, height) {
  let didchanges = false;

  do {
    didchanges = false
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < (width); x++) {
        let pixel_a = brightness(array, x, y, width);
        let pixel_b = x+1 < width ? brightness(array, x + 1, y, width) : 0;

        if(pixel_a && pixel_b && pixel_a < pixel_b) {
          swapPixels(array, x, y, width);
          didchanges = true;
        }
      }
    }

    // return array;
  } while (didchanges)
}

function brightness(array, x, y, width) {
  let PIXEL_INDEX = y*width*4 + x*4;
  if (PIXEL_INDEX >= array.length) return 0;
  return 0.2126*array[PIXEL_INDEX] + 0.7152*array[PIXEL_INDEX + 1] + 0.0722*array[PIXEL_INDEX + 2];
}

function swapPixels(array, x, y, width) {
  const i1 = (y * width + x) * 4;
  const i2 = (y * width + (x + 1)) * 4;
  for (let i = 0; i < 3; i++) {
    let temp = array[i1 + i];
    array[i1 + i] = array[i2 + i];
    array[i2 + i] = temp;
  }
  array[i1 + 3] = 255;
  array[i2 + 3] = 255;
}

// start
// main();