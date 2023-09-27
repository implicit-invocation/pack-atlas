import Jimp from "jimp";
import { Bin, Rectangle } from "maxrects-packer";
import { Bound, RectData } from "./types";

export const trimTransparentPixels = (image: Jimp): Bound => {
  const width = image.getWidth();
  const height = image.getHeight();

  const bound = {
    x: 0,
    y: 0,
    width,
    height,
  };

  let top = 0;
  let bottom = height;
  let left = 0;
  let right = width;
  for (let y = 0; y < height; y++) {
    let empty = true;
    for (let x = 0; x < width; x++) {
      const alpha = image.bitmap.data[y * width * 4 + x * 4 + 3];
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
  for (let y = height - 1; y >= 0; y--) {
    let empty = true;
    for (let x = 0; x < width; x++) {
      const alpha = image.bitmap.data[y * width * 4 + x * 4 + 3];
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
  for (let x = 0; x < width; x++) {
    let empty = true;
    for (let y = 0; y < height; y++) {
      const alpha = image.bitmap.data[y * width * 4 + x * 4 + 3];
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
  for (let x = width - 1; x >= 0; x--) {
    let empty = true;
    for (let y = 0; y < height; y++) {
      const alpha = image.bitmap.data[y * width * 4 + x * 4 + 3];
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

export const drawBin = (bin: Bin<Rectangle>): Jimp => {
  const data = new Jimp(bin.width, bin.height);

  for (let rect of bin.rects) {
    const { image, bound }: RectData = rect.data;
    const width = bound.width;
    const height = bound.height;
    const startX = bound.x;
    const startY = bound.y;
    if (rect.rot) {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          data.setPixelColor(
            image.getPixelColor(x + startX, y + startY),
            // 0x00ff00ff,
            rect.x + y,
            rect.y + width - x - 1
          );
        }
      }
    } else {
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          data.setPixelColor(
            image.getPixelColor(x + startX, y + startY),
            // 0xff0000ff,
            rect.x + x,
            rect.y + y
          );
        }
      }
    }
  }
  return data;
};
