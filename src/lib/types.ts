import { Image } from "canvas";

export interface PackingOptions {
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  allowRotation?: boolean;
  square?: boolean;
  smart?: boolean;
  filter?: "linear" | "nearest";
  trim?: boolean;
}

export interface Bound {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectData {
  image: Image;
  name: string;
  bound: Bound;
}
