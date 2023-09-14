import { ImageSource, OrthoCamera, PolygonBatch, Texture } from "gdxts";
import getPixels from "get-pixels";
import createGl from "gl";
import { Bin, Rectangle } from "maxrects-packer";
import { Bound, PackingOptions, RectData } from "./types";

export const trimTransparentPixels = (image: ImageFileData): Bound => {
  const bound = {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  };
  const data = new Uint8ClampedArray(image.buffer);
  let top = 0;
  let bottom = image.height;
  let left = 0;
  let right = image.width;
  for (let y = 0; y < image.height; y++) {
    let empty = true;
    for (let x = 0; x < image.width; x++) {
      const alpha = data[y * image.width * 4 + x * 4 + 3];
      if (alpha > 0) {
        empty = false;
        break;
      }
    }
    if (!empty) {
      top = y;
      break;
    }
  }
  for (let y = image.height - 1; y >= 0; y--) {
    let empty = true;
    for (let x = 0; x < image.width; x++) {
      const alpha = data[y * image.width * 4 + x * 4 + 3];
      if (alpha > 0) {
        empty = false;
        break;
      }
    }
    if (!empty) {
      bottom = y + 1;
      break;
    }
  }
  for (let x = 0; x < image.width; x++) {
    let empty = true;
    for (let y = 0; y < image.height; y++) {
      const alpha = data[y * image.width * 4 + x * 4 + 3];
      if (alpha > 0) {
        empty = false;
        break;
      }
    }
    if (!empty) {
      left = x;
      break;
    }
  }
  for (let x = image.width - 1; x >= 0; x--) {
    let empty = true;
    for (let y = 0; y < image.height; y++) {
      const alpha = data[y * image.width * 4 + x * 4 + 3];
      if (alpha > 0) {
        empty = false;
        break;
      }
    }
    if (!empty) {
      right = x + 1;
      break;
    }
  }
  bound.x = left;
  bound.y = top;
  bound.width = right - left;
  bound.height = bottom - top;
  return bound;
};

export const drawBin = (
  bin: Bin<Rectangle>,
  options: PackingOptions
): Uint8Array => {
  const gl = createGl(bin.width, bin.height, { preserveDrawingBuffer: true });
  const batch = new PolygonBatch(gl);
  batch.setYDown(true);
  const camera = new OrthoCamera(bin.width, bin.height, bin.width, bin.height);
  camera.setYDown(true);
  camera.update();

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, bin.width, bin.height);

  const white = new Texture(
    gl,
    new ImageSource(1, 1, new Uint8Array([255, 255, 255, 255]).buffer)
  );
  batch.setProjection(camera.combined);
  batch.begin();
  for (let rect of bin.rects) {
    const { image, bound }: RectData = rect.data;
    // const texture = new Texture(
    //   gl,
    //   new ImageSource(image.width, image.height, image.buffer)
    // );

    batch.draw(white, rect.x, rect.y, bound.width, bound.height);
  }
  batch.end();

  var pixels = new Uint8Array(bin.width * bin.height * 4);
  gl.readPixels(0, 0, bin.width, bin.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return pixels;
};

export interface ImageFileData {
  width: number;
  height: number;
  buffer: ArrayBufferLike;
}

export const loadImageFile = async (file: string): Promise<ImageFileData> =>
  new Promise((resolve, reject) => {
    getPixels(file, (err, pixels) => {
      if (err) {
        reject(err);
        return;
      }
      const { shape, data } = pixels;
      resolve({
        width: shape[0],
        height: shape[1],
        buffer: data.buffer,
      });
    });
  });
