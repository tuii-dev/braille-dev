import { get } from "http";

export function getHexLuminance(hexColor: string) {
  // Convert hex to RGB
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function rgbToHex(r: number, g: number, b: number): string {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    throw new Error("RGB values must be between 0 and 255");
  }

  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

export function getLuminance(color: string) {
  if (color.startsWith("#")) {
    return getHexLuminance(color);
  }

  const rgbRegex = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/;
  const [, r, g, b] = color.match(rgbRegex) || [];

  return getHexLuminance(rgbToHex(parseInt(r), parseInt(g), parseInt(b)));
}

export const workspaceThemeTextColor = (color: string) => {
  return getLuminance(color) < 0.5
   ? "white"
   : "black"
 }