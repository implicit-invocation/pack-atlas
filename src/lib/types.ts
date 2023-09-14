import { ImageFileData } from "./image";

export interface PackingOptions {
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  allowRotation?: boolean;
  square?: boolean;
  smart?: boolean;
  filter?: "linear" | "nearest";
  trim?: boolean;
  pngquant?: boolean;
}

export interface Bound {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectData {
  image: ImageFileData;
  name: string;
  bound: Bound;
}
