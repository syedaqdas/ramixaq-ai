const PROFILE_HOSTS = {
  github: ["github.com"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  leetcode: ["leetcode.com", "www.leetcode.com"]
};

const cleanText = (value, maxLength = 500) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

export const sanitizeText = cleanText;

export const normalizeProfileUrl = (value, field = "portfolio") => {
  const raw = cleanText(value, 500);
  if (!raw) return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url;

  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error(`${field} must be a valid URL`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${field} must use http or https`);
  }

  const allowedHosts = PROFILE_HOSTS[field];
  const hostname = url.hostname.toLowerCase();
  if (allowedHosts && !allowedHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    throw new Error(`${field} must use ${allowedHosts[0]}`);
  }

  url.hash = "";
  return url.toString().replace(/\/$/, "");
};

export const integrationStatuses = (user) => ({
  linkedin: Boolean(user.linkedin),
  github: Boolean(user.github),
  leetcode: Boolean(user.leetcode),
  portfolio: Boolean(user.portfolio || user.website)
});
