"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Undo,
  Redo,
  Heading1,
} from "lucide-react";
import { Button } from "./button";

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
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          1: { class: "text-2xl font-bold mt-4 mb-2" },
          2: { class: "text-xl font-bold mt-3 mb-2" },
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[150px] max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-2",
          className
        ),
      },
      handleDOMEvents: {
        keydown: (_, event) => {
          // Prevent form submission on Enter key
          if (event.key === "Enter" && event.ctrlKey) {
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    enableCaret: true,
    enableInput: true,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      icon: Bold,
      title: "Negrito",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Itálico",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: Heading1,
      title: "Título 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      title: "Título 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: List,
      title: "Lista com marcadores",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Lista numerada",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      title: "Citação",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
  ];

  return (
    <div className="border border-input rounded-md">
      <div className="border-b border-input p-2 flex gap-2 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              button.action();
            }}
            className={cn(
              "h-8 w-8 p-0",
              button.isActive() && "bg-muted text-muted-foreground"
            )}
            title={button.title}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="flex gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().undo().run();
            }}
            className="h-8 w-8 p-0"
            title="Desfazer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().redo().run();
            }}
            className="h-8 w-8 p-0"
            title="Refazer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
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

interface ReadOnlyRichTextViewerProps {
  content: string;
  className?: string;
}

export function ReadOnlyRichTextViewer({
  content,
  className,
}: ReadOnlyRichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          1: { class: "text-2xl font-bold mt-4 mb-2" },
          2: { class: "text-xl font-bold mt-3 mb-2" },
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "my-1",
        },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-2 [&>ul]:list-disc [&>ol]:list-decimal [&>ul]:ml-4 [&>ol]:ml-4 [&_li]:my-1",
          className
        ),
      },
    },
    enableCaret: false,
    enableInput: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-md">
      <div className="p-2">
        <EditorContent editor={editor} className="outline-none" />
      </div>
    </div>
  );
}
