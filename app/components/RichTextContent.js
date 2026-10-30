
import sanitizeHtml from "sanitize-html";

export default function RichTextContent({
  content = "",
  className = "",
}) {
  const safeHtml = sanitizeHtml(
    typeof content === "string" ? content : "",
    {
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,

        "*": [
          ...(sanitizeHtml.defaults.allowedAttributes["*"] || []),
          "style",
        ],

        a: [
          ...(sanitizeHtml.defaults.allowedAttributes.a || []),
          "target",
          "rel",
        ],
      },

      allowedStyles: {
        "*": {
          color: [
            /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)$/i,
          ],

          "background-color": [
            /^(#[0-9a-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)$/i,
          ],

          "text-align": [
            /^(left|right|center|justify)$/,
          ],

          "font-weight": [
            /^(normal|bold|[1-9]00)$/,
          ],

          "font-style": [
            /^(normal|italic|oblique)$/,
          ],

          "text-decoration": [
            /^(none|underline|line-through)$/,
          ],
        },
      },

      transformTags: {
        a: sanitizeHtml.simpleTransform(
          "a",
          {
            target: "_blank",
            rel: "noopener noreferrer",
          },
          true
        ),
      },
    }
  );

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{
        __html: safeHtml,
      }}
    />
  );
}
