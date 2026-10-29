import DOMPurify from "isomorphic-dompurify";

export default function RichTextContent({
  content = "",
  className = "",
}) {
  const safeHtml = DOMPurify.sanitize(
    typeof content === "string" ? content : "",
    {
      USE_PROFILES: {
        html: true,
      },
      ADD_ATTR: ["target", "rel"],
    }
  );
  
  const htmlWithSafeLinks = safeHtml.replace(
    /<a\b(?![^>]*\btarget=)/gi,
    '<a target="_blank" rel="noopener noreferrer"'
  );

  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{
        __html: htmlWithSafeLinks,
      }}
    />
  );
}