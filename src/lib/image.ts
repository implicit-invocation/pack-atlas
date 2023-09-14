import { Canvas, Image } from "canvas";
import { Bin, Rectangle } from "maxrects-packer";
import { Bound, PackingOptions, RectData } from "./types";

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

    // TODO: fix this
    if (rect.rot) {
      ctx.translate(rect.x, rect.y);
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-rect.x, -rect.y);

      ctx.drawImage(
        image,
        bound.x,
        bound.y,
        bound.width,
        bound.height,
        rect.x - bound.width,
        rect.y,
        bound.width,
        bound.height
      );

      ctx.setTransform();
    } else {
      ctx.drawImage(
        image,
        bound.x,
        bound.y,
        bound.width,
        bound.height,
        rect.x,
        rect.y,
        bound.width,
        bound.height
      );
    }
  }
  const buffer = canvas.toBuffer("image/png");
  return buffer;
};
