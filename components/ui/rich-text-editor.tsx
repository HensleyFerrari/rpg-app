"use client";

import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-separator";

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
  return (
    <MDXEditor
      className={cn(`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input  rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        ${className}`)}
      markdown={value}
      onChange={onChange}
      placeholder={placeholder}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarClassName: "flex gap-2",
          toolbarContents: () => {
            return (
              <>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <Separator />
                <ListsToggle />
              </>
            );
          },
        }),
      ]}
    />
  );
}
