// grow memory of wasm by 1 page, which is 64 kb
memory.grow(16);

declare function log(d: u8): void;

/** Randomizes the specified array's values. */
export function randomizeArray(arr: Int32Array, rand: i32): Int32Array {
  for (let i = 0; i < arr.length; ++i) {
    let value = i32(Math.random() * rand);
    unchecked(arr[i] = value);
  }

	return arr;
}

export function sum(arr: Int32Array): u64 {
	let total = 0;
	for(let i=0;i<arr.length;i++) {
		total += unchecked(arr[i]);
	}

	return total;
}

// =============================

export const memory_ptr: i32 = 0; // memory start pointer

export function sortNew(w: i32, h: i32): void {
	// bubble sorting
	let changes = false;
	do {	
		changes = false;
		for(let y=0;y<h;y++) {
			for(let x=0;x<w;x++) {
				let pixel_a = (getTotalBright(x, y, w));
				let pixel_b = x+1 < w ? (getTotalBright(x+1, y, w)) : 0;
	 
				if(pixel_a && pixel_b && (pixel_a < pixel_b)) {
					swapPixel(x, y, w);
					changes = true;
				}
			}
		}
	} while(changes)
}

export function generateRandom(w: i32, h: i32): void {
	for(let y=0;y<h;y++) {
		for(let x=0;x<w;x++) {
			let pixel_ind = memory_ptr + (y*w + x) * 4;
			store<u8>(pixel_ind, u8(Math.random() * 256));
			store<u8>(pixel_ind+1, u8(Math.random() * 256));
			store<u8>(pixel_ind+2, u8(Math.random() * 256));
			store<u8>(pixel_ind+3, 255);
		}
	}
}

function getTotalBright(x: i32, y: i32, w: i32): f32 {
	let pixel_index = memory_ptr + (y*w + x) * 4;
	return (0.2126*load<u8>(pixel_index) + 0.7152*load<u8>(pixel_index+1) + 0.0722*load<u8>(pixel_index+2));
}

function swapPixel(x: i32, y: i32, w: i32): void {
	let i1 =  memory_ptr + (y*w + x) * 4;
	let i2 =  memory_ptr + ((y)*w + (x+1)) * 4;

	for(let i=0;i<3;i++) {
		let t = load<u8>(i1 + i);
		store<u8>(i1 + i, load<u8>(i2 + i));
		store<u8>(i2 + i, t);
	}
	store<u8>(i1 + 3, 255); // alpha always opaque
	store<u8>(i2 + 3, 255); // alpha always opaque
}