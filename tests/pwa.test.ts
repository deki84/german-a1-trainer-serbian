import { describe, expect, it } from "vitest";
import { isIosDevice } from "@/lib/pwa";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";

describe("isIosDevice", () => {
  it("erkennt das iPhone", () => {
    expect(isIosDevice(IPHONE, 5)).toBe(true);
  });

  it("erkennt das iPad, das sich als Mac meldet", () => {
    expect(isIosDevice(MAC, 5)).toBe(true);
  });

  it("ein echter Mac ohne Touch ist kein iOS-Gerät", () => {
    expect(isIosDevice(MAC, 0)).toBe(false);
  });

  it("Android ist kein iOS-Gerät", () => {
    expect(isIosDevice(ANDROID, 5)).toBe(false);
  });
});
