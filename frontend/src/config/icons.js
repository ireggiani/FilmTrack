// Icons are imported with `?icon` (see vite.config.js), which gives a picture
// object: a fallback URL plus a srcset of resized copies. `iconSrc` keeps the
// app passing icons around as plain URLs and remembers each URL's srcset, which
// `iconSrcSet` hands back to whatever renders the <img>.
const srcSets = new Map();

export const iconSrc = (picture) => {
  if (typeof picture === 'string') return picture; // plain import / Jest file stub
  srcSets.set(picture.img.src, Object.values(picture.sources)[0]);
  return picture.img.src;
};

export const iconSrcSet = (src) => srcSets.get(src);
