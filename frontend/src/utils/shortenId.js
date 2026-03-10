export function shortenId(id, length = 8) {
  if (!id) return "";
  return `${id.substring(0, length)}..`;
}