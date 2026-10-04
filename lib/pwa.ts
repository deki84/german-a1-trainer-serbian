// iPhone und iPad haben keinen Installieren-Knopf, man muss es über "Teilen" machen.
// iPadOS meldet sich als Mac, erkennbar an der Touch-Bedienung.
export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  if (/iphone|ipad|ipod/i.test(userAgent)) return true;
  return userAgent.includes("Macintosh") && maxTouchPoints > 1;
}
