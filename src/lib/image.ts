import { Canvas, Image, ImageData, createImageData } from "canvas";
import { Bin, Rectangle } from "maxrects-packer";
import { Bound, PackingOptions, RectData } from "./types";

export const imageToImageData = (image: Image, bound: Bound): ImageData => {
  const canvas = new Canvas(bound.width, bound.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(
    image,
    bound.x,
    bound.y,
    bound.width,
    bound.height,
    0,
    0,
    bound.width,
    bound.height
  );
  return ctx.getImageData(0, 0, bound.width, bound.height);
};

export const trimTransparentPixels = (image: Image): Bound => {
  const bound = {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  };
  const canvas = new Canvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const { data } = imageData;
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
): Buffer => {
  const canvas = new Canvas(bin.width, bin.height);
  const ctx = canvas.getContext("2d");
  ctx.patternQuality = options.filter === "linear" ? "bilinear" : "nearest";
  ctx.quality = options.filter === "linear" ? "bilinear" : "nearest";

  for (let rect of bin.rects) {
    const { image, bound }: RectData = rect.data;
    const data = imageToImageData(image, bound);
    if (rect.rot) {
      const width = data.width;
      const height = data.height;

      const rotatedImageData = createImageData(
        new Uint8ClampedArray(width * height * 4),
        height,
        width
      );
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const newX = y;
          const newY = width - x - 1;

          const pos = y * width + x;
          const newPos = newY * height + newX;

          rotatedImageData.data[newPos * 4 + 0] = data.data[pos * 4 + 0];
          rotatedImageData.data[newPos * 4 + 1] = data.data[pos * 4 + 1];
          rotatedImageData.data[newPos * 4 + 2] = data.data[pos * 4 + 2];
          rotatedImageData.data[newPos * 4 + 3] = data.data[pos * 4 + 3];
        }
      }
      ctx.putImageData(rotatedImageData, rect.x, rect.y);
    } else {
      ctx.putImageData(data, rect.x, rect.y);
    }
  }
  const buffer = canvas.toBuffer("image/png");
  return buffer;
};
