"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useCallback, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImageAsWebP } from "@/lib/utils/imageUpload";
import toast from "react-hot-toast";

function ToolbarBtn({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`toolbar-btn${active ? " active" : ""}`}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function RichEditor({
  value = "",
  onChange,
  placeholder = "Bắt đầu nhập nội dung...",
  minHeight = 300,
  bucket = "blog-images",
  uploadFolder = "",
}) {
  const imgInputRef = useRef(null);
  const [imgUploading, setImgUploading] = useState(false);
  const supabase = createClient();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit v3 đã bao gồm Link + Underline — disable để tránh duplicate
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "editor-content tiptap-editor", style: `min-height:${minHeight}px` },
    },
  });

  // Sync external value khi edit bài cũ
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = prompt("Nhập URL:");
    if (!url) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  async function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";

    setImgUploading(true);
    try {
      const publicUrl = await uploadImageAsWebP(file, supabase, bucket, uploadFolder, 1600, 0.85);
      editor.chain().focus().setImage({ src: publicUrl }).run();
      toast.success("Đã chèn ảnh!");
    } catch (err) {
      toast.error("Lỗi upload ảnh: " + err.message);
    }
    setImgUploading(false);
  }

  if (!editor) return null;

  const e = editor;

  return (
    <div className="rich-editor-wrap">
      <div className="editor-toolbar">
        {/* Text format */}
        <ToolbarBtn onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")} title="Bold (Ctrl+B)"><b>B</b></ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")} title="Italic (Ctrl+I)"><i>I</i></ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")} title="Underline (Ctrl+U)"><u>U</u></ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive("strike")} title="Strikethrough"><s>S</s></ToolbarBtn>

        <div className="toolbar-sep" />

        {/* Headings */}
        <ToolbarBtn onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive("heading", { level: 2 })} title="Heading 2">H2</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive("heading", { level: 3 })} title="Heading 3">H3</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleHeading({ level: 4 }).run()} active={e.isActive("heading", { level: 4 })} title="Heading 4">H4</ToolbarBtn>

        <div className="toolbar-sep" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => e.chain().focus().setTextAlign("left").run()} active={e.isActive({ textAlign: "left" })} title="Căn trái">⇤</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().setTextAlign("center").run()} active={e.isActive({ textAlign: "center" })} title="Căn giữa">≡</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().setTextAlign("right").run()} active={e.isActive({ textAlign: "right" })} title="Căn phải">⇥</ToolbarBtn>

        <div className="toolbar-sep" />

        {/* Lists */}
        <ToolbarBtn onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")} title="Danh sách">• List</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")} title="Danh sách số">1. List</ToolbarBtn>

        <div className="toolbar-sep" />

        {/* Quote / Code */}
        <ToolbarBtn onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive("blockquote")} title="Trích dẫn">❝</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().toggleCodeBlock().run()} active={e.isActive("codeBlock")} title="Code block">{"</>"}</ToolbarBtn>

        <div className="toolbar-sep" />

        {/* Link */}
        <ToolbarBtn onClick={addLink} active={e.isActive("link")} title="Chèn liên kết">Link</ToolbarBtn>
        {e.isActive("link") && (
          <ToolbarBtn onClick={() => e.chain().focus().unsetLink().run()} title="Xóa link">✕ Link</ToolbarBtn>
        )}

        {/* Image upload */}
        <ToolbarBtn
          onClick={() => imgInputRef.current?.click()}
          title="Chèn ảnh (tự động WebP)"
          disabled={imgUploading}
        >
          {imgUploading ? "⏳" : "📷 Ảnh"}
        </ToolbarBtn>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageFile}
        />

        <div className="toolbar-sep" />

        {/* Undo/Redo */}
        <ToolbarBtn onClick={() => e.chain().focus().undo().run()} disabled={!e.can().undo()} title="Hoàn tác (Ctrl+Z)">↩</ToolbarBtn>
        <ToolbarBtn onClick={() => e.chain().focus().redo().run()} disabled={!e.can().redo()} title="Làm lại (Ctrl+Y)">↪</ToolbarBtn>

        <ToolbarBtn onClick={() => e.chain().focus().unsetAllMarks().clearNodes().run()} title="Xóa định dạng">✕ Format</ToolbarBtn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
