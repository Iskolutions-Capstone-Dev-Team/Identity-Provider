export function shortenId(id, length = 3) {
  if (!id) return "";
  return `${id.substring(0, length)}..`;
}