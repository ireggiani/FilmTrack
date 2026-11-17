// @ts-check
// Cleans a note's HTML before it's shown and before it's saved, so nothing a
// formatted paste or a restored backup brings in (scripts, on* handlers,
// images, iframes) can run or load. It's deliberately generous with plain
// formatting: a note made in the editor comes out exactly as it went in.
// Parsing happens in an inert document, where scripts don't run and images
// don't load.

const KEEP = new Set([
  'p', 'div', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre',
  'ul', 'ol', 'li', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'ins',
  'sub', 'sup', 'small', 'mark', 'code', 'span', 'a',
  'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
]);

// Removed with everything inside them; any other unknown tag is unwrapped
// (its text is kept)
const DROP = new Set([
  'script', 'style', 'template', 'iframe', 'object', 'embed', 'frame', 'frameset',
  'noscript', 'head', 'title', 'meta', 'link', 'base', 'svg', 'math', 'img',
  'picture', 'video', 'audio', 'canvas', 'form', 'input', 'button', 'select',
  'textarea',
]);

// Text looks only: colours, emphasis, alignment, and the spacing and borders
// the browser's own indent and quote commands write
// (browsers list a shorthand such as `border` as its parts, or not, so both)
const STYLE = /^(color|background-color|text-align|font-weight|font-style|text-decoration(-line|-color|-style|-thickness)?|(margin|padding)(-(top|right|bottom|left))?|border(-(top|right|bottom|left))?(-(width|style|color))?|border-image-(source|slice|width|outset|repeat))$/;
// Nothing that fetches or runs: url(...), expression(...), escapes
const UNSAFE_VALUE = /url\s*\(|expression\s*\(|\\|@import|javascript:/i;

const SAFE_LINK = /^(https?:|mailto:)/i;
const SPAN_ATTRIBUTES = ['colspan', 'rowspan'];

/**
 * @param {CSSStyleDeclaration} style
 * @param {string} name
 */
const safeStyle = (style, name) => {
  const value = style.getPropertyValue(name);
  return STYLE.test(name) && Boolean(value) && !UNSAFE_VALUE.test(value);
};

// The style attribute as written when all of it is allowed (so a clean note is
// unchanged to the letter), otherwise rebuilt from the allowed properties
/**
 * @param {HTMLElement} node
 * @param {Document} doc
 */
const cleanStyle = (node, doc) => {
  const text = node.getAttribute('style');
  const { style } = node;
  if (!text || !style?.length) return '';
  const names = Array.from(style);
  if (!UNSAFE_VALUE.test(text) && names.every((name) => safeStyle(style, name))) return text;

  const rebuilt = doc.createElement('span').style;
  for (const name of names) {
    if (safeStyle(style, name)) rebuilt.setProperty(name, style.getPropertyValue(name));
  }
  return rebuilt.cssText;
};

/**
 * @param {Node} from
 * @param {ParentNode} to
 * @param {Document} doc
 */
const copyChildren = (from, to, doc) => {
  for (const child of Array.from(from.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      to.append(doc.createTextNode(child.textContent ?? ''));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue; // comments and the like
    const node = /** @type {HTMLElement} */ (child);
    const tag = node.tagName.toLowerCase();
    if (DROP.has(tag)) continue;
    if (!KEEP.has(tag) && tag !== 'font') {
      copyChildren(node, to, doc);
      continue;
    }

    // <font color> (an old way to colour text) becomes a coloured span
    const el = doc.createElement(tag === 'font' ? 'span' : tag);
    const style = cleanStyle(node, doc);
    if (style) el.setAttribute('style', style);
    const fontColor = tag === 'font' && node.getAttribute('color');
    if (fontColor && !el.style.color) el.style.setProperty('color', fontColor);
    if (tag === 'a') {
      const href = (node.getAttribute('href') ?? '').trim();
      if (SAFE_LINK.test(href)) el.setAttribute('href', href);
    }
    if (tag === 'td' || tag === 'th') {
      for (const name of SPAN_ATTRIBUTES) {
        const value = node.getAttribute(name);
        if (value && /^\d{1,3}$/.test(value)) el.setAttribute(name, value);
      }
    }

    copyChildren(node, el, doc);
    to.append(el);
  }
};

/** @param {string | null | undefined} html */
export function sanitizeNote(html) {
  if (!html) return '';
  const source = new DOMParser().parseFromString(html, 'text/html');
  const out = document.implementation.createHTMLDocument('');
  const root = out.createElement('div');
  copyChildren(source.body, root, out);
  return root.innerHTML;
}
