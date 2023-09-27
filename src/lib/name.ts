import { Bin, Rectangle } from "maxrects-packer";
import { PackingOptions, RectData } from "./types";

export interface RegionId {
  name: string;
  index: number;
}

export const extractName = (name: string): RegionId => {
  const parts = name.split("_");
  const index = parseInt(parts[parts.length - 1]);
  if (isNaN(index)) {
    return {
      name,
      index: -1,
    };
  }
  return {
    name: parts.slice(0, parts.length - 1).join("_"),
    index,
  };
};

export const generateAtlasInfo = (
  imageFileName: string,
  bin: Bin<Rectangle>,
  options: PackingOptions
): string => {
  let atlasInfo = "";
  atlasInfo += "\n" + imageFileName + "\n";
  atlasInfo += `size: ${bin.width}, ${bin.height}\n`;
  // TODO: let the user choose the format
  atlasInfo += `format: RGBA8888\n`;
  atlasInfo +=
    `filter: ` +
    (options.filter === "linear" ? "Linear, Linear" : "Nearest, Nearest") +
    "\n";
  atlasInfo += `repeat: none\n`;
  for (let rect of bin.rects) {
    const data: RectData = rect.data;
    const id = extractName(data.name);
    atlasInfo += `${id.name}\n`;
    atlasInfo += `  rotate: ${rect.rot ? "true" : "false"}\n`;
    atlasInfo += `  xy: ${rect.x}, ${rect.y}\n`;
    atlasInfo += `  size: ${data.bound.width}, ${data.bound.height}\n`;
    atlasInfo += `  orig: ${data.image.getWidth()}, ${data.image.getHeight()}\n`;
    atlasInfo += `  offset: ${data.bound.x}, ${data.bound.y}\n`;
    atlasInfo += `  index: ${id.index}\n`;
  }
  return atlasInfo;
};
