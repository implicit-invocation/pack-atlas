import fs from "fs";
import ndarray from "ndarray";
import savePixels from "save-pixels";

export const writeImage = (
  file: string,
  buffer: Uint8Array,
  width: number,
  height: number,
  quant = false
): Promise<void> =>
  new Promise((resolve) => {
    const stream = fs.createWriteStream(file);
    stream.on("finish", () => {
      stream.destroy();
      resolve();
    });

    savePixels(ndarray(buffer, [width, height, 4]), "png").pipe(stream);
    return;

    // const pngquant = new PngQuant();
    // savePixels(ndarray(new Uint8ClampedArray(buffer)), "png").pipe(
    //   pngquant as any
    // );
    // pngquant.pipe(stream);
    // pngquant.write(buffer);
    // pngquant.end();
  });
