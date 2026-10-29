"use client";

import { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import { TextStyle } from "@tiptap/extension-text-style";



const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      fontFamily: {
        default: null,
        parseHTML: (element) =>
          element.style.fontFamily || null,
        renderHTML: (attributes) => {
          if (!attributes.fontFamily) return {};

          return {
            style: `font-family: ${attributes.fontFamily}`,
          };
        },
      },

      fontSize: {
        default: null,
        parseHTML: (element) =>
          element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};

          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your content here...",
}) {
  const [activeBlock, setActiveBlock] = useState("paragraph");
  const editor = useEditor({

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Underline,

      CustomTextStyle,
      Color,


      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer nofollow",
          class: "rich-text-link",
        },
      }),
    ],

    content: value || "",

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        "aria-label": placeholder,
      },
    },

    onSelectionUpdate({ editor }) {
      if (editor.isActive("heading", { level: 1 })) {
        setActiveBlock("1");
      } else if (editor.isActive("heading", { level: 2 })) {
        setActiveBlock("2");
      } else if (editor.isActive("heading", { level: 3 })) {
        setActiveBlock("3");
      } else {
        setActiveBlock("paragraph");
      }
    },

  });

  // Update the editor when existing content is loaded or changed.
  useEffect(() => {
    if (!editor) return;

    const nextContent = value || "";
    const currentContent = editor.getHTML();

    if (currentContent !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-lg border p-4 text-sm text-gray-500">
        Loading editor...
      </div>
    );
  }

  const buttonClass = (active = false) =>
    [
      "rounded border px-3 py-2 text-sm transition",
      active
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100",
    ].join(" ");

  function addOrEditLink() {
    if (!editor) return;

    const existingLink = editor.getAttributes("link").href || "";
    const input = window.prompt(
      "Enter a link URL (https://, http://, mailto:, or tel:):",
      existingLink
    );

    // Cancel means leave the current link unchanged.
    if (input === null) return;

    const href = input.trim();

    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Only allow safe, explicitly supported URL schemes.
    const isSafeUrl =
      /^(https?:\/\/|mailto:|tel:)/i.test(href);

    if (!isSafeUrl) {
      window.alert(
        "Please enter a URL beginning with https://, http://, mailto:, or tel:."
      );
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-gray-50 p-3">
        <button
          type="button"
          className={buttonClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
          title="Bold"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
          title="Italic"
        >
          <em>I</em>
        </button>

        <select
          title="Text style"
          value={activeBlock}
          onChange={(event) => {
            const value = event.target.value;
            const chain = editor.chain().focus();

            if (value === "paragraph") {
              chain.setParagraph().run();
            } else {
              chain
                .toggleHeading({
                  level: Number(value),
                })
                .run();
            }
          }}
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <button
          type="button"
          className={buttonClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          • List
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          1. List
        </button>

        <button
          type="button"
          className={buttonClass(editor.isActive("link"))}
          onClick={addOrEditLink}
          title="Add or edit hyperlink"
        >
          Link
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            className={buttonClass(false)}
            onClick={() =>
              editor.chain().focus().extendMarkRange("link").unsetLink().run()
            }
            title="Remove hyperlink"
          >
            Remove link
          </button>
        )}

        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          Undo
        </button>

        <button
          type="button"
          className={buttonClass(false)}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          Redo
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "is-active" : ""}
          title="Underline"
        >
          U̲
        </button>

        {/* Align Left */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
          title="Align left"
        >
          ⇤
        </button>

        {/* Align Center */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
          title="Align center"
        >
          ≡
        </button>

        {/* Align Right */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
          title="Align right"
        >
          ⇥
        </button>

        {/* Justify */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}
          title="Justify"
        >
          ☰
        </button>
        <select
          title="Font size"
          defaultValue=""
          onChange={(event) => {
            const fontSize = event.target.value;

            if (!fontSize) return;

            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontSize })
              .run();

            event.target.value = "";
          }}
        >
          <option value="" disabled>Font size</option>
          <option value="12px">12 px</option>
          <option value="14px">14 px</option>
          <option value="16px">16 px</option>
          <option value="18px">18 px</option>
          <option value="20px">20 px</option>
          <option value="24px">24 px</option>
          <option value="28px">28 px</option>
          <option value="32px">32 px</option>
        </select>
        <input
          type="color"
          title="Text background color"
          aria-label="Text background color"
          onInput={(event) =>
            editor
              .chain()
              .focus()
              .toggleHighlight({ color: event.currentTarget.value })
              .run()
          }
          defaultValue="#ffff00"
        />
        <input
          type="color"
          title="Text color"
          aria-label="Text color"
          onInput={(event) =>
            editor.chain().focus().setColor(event.currentTarget.value).run()
          }
          value={editor.getAttributes("textStyle").color || "#000000"}
        />

        <select
          title="Font family"
          defaultValue=""
          onChange={(event) => {
            const fontFamily = event.target.value;

            if (!fontFamily) return;

            editor
              .chain()
              .focus()
              .setMark("textStyle", { fontFamily })
              .run();

            event.target.value = "";
          }}
        >
          <option value="" disabled>Font family</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="'Times New Roman'">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>

      {/* Editable content */}
      <EditorContent editor={editor} />

      {/* Editor styling */}
      <style jsx global>{`
        .rich-text-editor-content {
          min-height: 200px;
          padding: 16px;
          outline: none;
        }

        .rich-text-editor-content p {
          margin: 0.75rem 0;
        }

        .rich-text-editor-content h2 {
          margin: 1rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .rich-text-editor-content ul {
          list-style: disc;
          padding-left: 1.5rem;
        }

        .rich-text-editor-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
        }

        .rich-text-editor-content a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }

        .rich-text-editor-content a:hover {
          color: #1d4ed8;
        }

        .rich-text-editor-content:focus {
          outline: none;
        }

        .rich-text-editor-content p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}