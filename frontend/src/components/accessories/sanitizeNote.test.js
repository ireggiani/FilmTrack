import { sanitizeNote } from './sanitizeNote';

const unchanged = (html) => expect(sanitizeNote(html)).toBe(html);

describe('sanitizeNote', () => {
  it('leaves what the editor makes exactly as it is', () => {
    unchanged(
      '<h1>Title</h1><div><b>bold</b> <i>it</i> <u>u</u> <strike>s</strike> x<sup>2</sup> y<sub>1</sub></div>' +
        '<ul><li>one</li></ul><ol><li>two</li></ol><blockquote>q</blockquote><hr><div><br></div>' +
        '<div>a &amp; b &gt; c&nbsp;d</div>',
    );
  });

  it('keeps colours, emphasis and indents written as styles', () => {
    unchanged('<span style="color: rgb(192, 57, 43);">red</span>');
    unchanged('<span style="background-color: rgb(255, 245, 157);">marked</span>');
    unchanged('<span style="font-weight: 700;">bold</span>');
    unchanged('<div style="text-align: center;">middle</div>');
    unchanged('<blockquote style="margin: 0 0 0 40px; border: none; padding: 0px;">in</blockquote>');
  });

  it('keeps links to the web, pasted tables and code', () => {
    unchanged('<a href="https://en.wikipedia.org/wiki/Wolf_Children">Wolf Children</a>');
    unchanged('<table><tbody><tr><td colspan="2">a</td></tr></tbody></table><pre><code>x</code></pre>');
  });

  it('removes scripts, handlers, images, frames and unknown attributes', () => {
    expect(
      sanitizeNote(
        '<div onclick="x()" class="a" id="b">hi<script>alert(1)</script><img src="x" onerror="y()"></div>' +
          '<iframe src="e"></iframe><style>div{color:red}</style><svg onload="z()"></svg>',
      ),
    ).toBe('<div>hi</div>');
  });

  it('keeps the text of tags it does not know', () => {
    expect(sanitizeNote('<article><custom-thing>some</custom-thing> <kbd>text</kbd></article>')).toBe('some text');
  });

  it('drops links that would run something, keeping their text', () => {
    expect(sanitizeNote('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeNote('<a href=" JaVaScRiPt:alert(1)">x</a>')).toBe('<a>x</a>');
    expect(sanitizeNote('<a href="data:text/html,<script>1</script>">x</a>')).toBe('<a>x</a>');
  });

  it('drops styles that fetch something or change the layout, keeping the rest', () => {
    const cleaned = sanitizeNote(
      '<span style="color: red; position: fixed; font-size: 90px; background-image: url(http://x/y.png)">t</span>',
    );
    expect(cleaned).toBe('<span style="color: red;">t</span>');
  });

  it('turns <font color> into a coloured span', () => {
    expect(sanitizeNote('<font color="#ff0000" face="Arial" size="7">r</font>')).toMatch(
      /^<span style="color: (rgb\(255, 0, 0\)|#ff0000);">r<\/span>$/,
    );
  });

  it('gives the same result when run again', () => {
    const messy =
      '<div class="x"><font color="red">a</font><span style="color: blue; float: left">b</span><img src="i"></div>';
    const once = sanitizeNote(messy);
    expect(sanitizeNote(once)).toBe(once);
  });

  it('accepts an empty note', () => {
    expect(sanitizeNote('')).toBe('');
    expect(sanitizeNote(null)).toBe('');
  });
});
