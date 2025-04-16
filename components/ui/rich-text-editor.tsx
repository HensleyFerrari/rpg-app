"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
// import { Button } from "./button";
// import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none",
          className
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md">
      {/* <div className="border-b border-input bg-transparent p-1">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            data-active={editor.isActive("bold")}
            className="data-[active=true]:bg-muted"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            data-active={editor.isActive("italic")}
            className="data-[active=true]:bg-muted"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBulletList().run();
            }}
            data-active={editor.isActive("bulletList")}
            className="data-[active=true]:bg-muted"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleOrderedList().run();
            }}
            data-active={editor.isActive("orderedList")}
            className="data-[active=true]:bg-muted"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div> */}
      <div className="p-2">
        <EditorContent
          editor={editor}
          placeholder={placeholder}
          className="outline-none"
        />
      </div>
    </div>
  );
}
