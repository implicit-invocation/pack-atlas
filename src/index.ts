#!/usr/bin/env node
import fs from "fs";
import { glob } from "glob";
import { MaxRectsPacker } from "maxrects-packer";
import Path from "path";
import yaml from "yaml";
import { writeImage } from "./lib/file";
import { drawBin, loadImageFile, trimTransparentPixels } from "./lib/image";
import { PackingOptions } from "./lib/types";

const defaultPackingOptions: PackingOptions = {
  maxWidth: 2048,
  maxHeight: 2048,
  padding: 2,
  allowRotation: true,
  square: false,
  smart: true,
  filter: "linear",
  trim: true,
  pngquant: false,
};

const pack = async (
  name: string,
  outDir: string,
  imagePath: string,
  options: PackingOptions
) => {
  options = {
    ...defaultPackingOptions,
    ...options,
  };
  const packer = new MaxRectsPacker(
    options.maxWidth,
    options.maxHeight,
    options.padding,
    {
      smart: options.smart,
      pot: true,
      square: options.square,
      allowRotation: options.allowRotation,
    }
  );

  const dir = await glob(imagePath);
  for (let file of dir) {
    const image = await loadImageFile(file);
    const bound = options.trim
      ? trimTransparentPixels(image)
      : {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        };
    packer.add(bound.width, bound.height, {
      image,
      name: Path.parse(file).name,
      bound,
    });
  }

  packer.save();

  for (let i = 0; i < packer.bins.length; i++) {
    const bin = packer.bins[i];
    const buffer = drawBin(bin, options);

    const imageFileName = i === 0 ? `${name}.png` : `${name}_${i}.png`;
    const imageFilePath = Path.join(outDir, imageFileName);
    await writeImage(
      imageFilePath,
      buffer,
      bin.width,
      bin.height,
      options.pngquant
    );

    // const atlasInfo = generateAtlasInfo(imageFileName, bin, options);
    // fs.appendFileSync(Path.join(outDir, `${name}.atlas`), atlasInfo);
  }
};
const run = async () => {
  const packerFile = process.argv[2] || "packer.yaml";
  const packerFileContent = fs.readFileSync(packerFile, "utf8");
  const packerConfigs = yaml.parse(packerFileContent);
  for (let atlasName in packerConfigs) {
    process.stdout.write("Packing atlas: " + atlasName);
    const config = packerConfigs[atlasName];
    const imagePath = config.images;
    if (!imagePath) {
      throw new Error("imagePath is required");
    }
    const outDir = config.outDir || ".";
    await pack(atlasName, outDir, imagePath, config);
    process.stdout.write(" ✅\n");
  }
};

run();
