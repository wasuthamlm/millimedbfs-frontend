import sanitizeHtmlLib, { type IOptions } from "sanitize-html";

// Allowlist matches the TipTap extensions enabled in
// components/admin/RichTextEditor.tsx (StarterKit, TextStyle, Color,
// FontFamily, Highlight, TextAlign, Subscript, Superscript, Image). Anything
// those extensions can produce must be allowed here, or saved content silently
// loses formatting on render even though the page no longer errors.
const options: IOptions = {
  allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(["img", "span", "mark", "u", "s", "sub", "sup"]),
  allowedAttributes: {
    ...sanitizeHtmlLib.defaults.allowedAttributes,
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    span: ["style"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    mark: ["style", "data-color"],
  },
  allowedStyles: {
    "*": {
      color: [/^.*$/],
      "background-color": [/^.*$/],
      "font-family": [/^.*$/],
      "text-align": [/^left$|^right$|^center$|^justify$/],
    },
  },
  allowedSchemes: ["https", "data"],
};

export function sanitizeHtml(html: string) {
  return sanitizeHtmlLib(html, options);
}
