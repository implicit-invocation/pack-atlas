import fs from "fs";
import PngQuant from "pngquant";

export const writeImage = (
  file: string,
  buffer: Buffer,
  quant = false
): Promise<void> =>
  new Promise((resolve) => {
    if (!quant) {
      fs.writeFileSync(file, buffer);
      return resolve();
    }
    const pngquant = new PngQuant();
    const stream = fs.createWriteStream(file);
    pngquant.pipe(stream);
    pngquant.write(buffer);
    pngquant.end();

    stream.on("finish", () => {
      stream.destroy();
      pngquant.destroy();
      resolve();
    });
  });
