export const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const externalUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `https://${url}`;
};

