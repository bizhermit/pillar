export const getOperationSystemName = (userAgent?: string) => {
  if (userAgent == null || userAgent === "") return undefined;
  if (userAgent.match(/Android/)) return "Android";
  if (userAgent.match(/Linux/)) return "Linux";
  if (userAgent.match(/Mac OS X/) && !userAgent.match(/iPhone OS/) && !userAgent.match(/CPU OS/)) {
    return "Mac OS";
  }
  if (userAgent.match(/Windows/)) return "Windows";
  if (userAgent.match(/iPhone/)) return "iOS";
  if (userAgent.match(/iPad/)) return "iPad";
  if (userAgent.match(/CrOS/)) return "ChromeOS";
  return undefined;
};

export const getBrowserName = (userAgent?: string) => {
  if (userAgent == null || userAgent === "") return undefined;
  if (userAgent.match(/Edge|Edg/)) return "Edge";
  if (userAgent.match(/Firefox|FxiOS/)) return "Firefox";
  if (userAgent.match(/Chrome|CriOS/)) return "Chrome";
  if (userAgent.match(/Trident/)) return "IE";
  if (userAgent.match(/iPad|iPhone|Mac/) && userAgent.match(/Safari/) && userAgent.match(/Version/)) {
    return "Safari";
  }
  return undefined;
};
