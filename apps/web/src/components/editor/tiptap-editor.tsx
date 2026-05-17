'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  Bold, Italic, List, ListOrdered, 
  Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, Quote, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  dir?: 'ltr' | 'rtl';
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-lg transition-all",
      isActive 
        ? "bg-[var(--primary)] text-white shadow-md" 
        : "text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[var(--foreground)]",
      "disabled:opacity-30 disabled:pointer-events-none"
    )}
  >
    {children}
  </button>
);

export function TiptapEditor({ content, onChange, placeholder, className, dir = 'ltr' }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-gray-200 shadow-lg my-8 max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--primary)] underline font-medium cursor-pointer',
        },
      }),
    ],
    immediatelyRender: false,
    content: content,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6',
          className
        ),
        dir: dir,
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL للجملة/الصورة:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL رابط:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/50 dark:bg-white/5 border-b border-[var(--border)]">
        <MenuButton 
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton 
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <MenuButton 
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton 
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 size={18} />
        </MenuButton>
        <MenuButton 
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
        >
          <Heading3 size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <MenuButton 
          title="Bullet List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          <List size={18} />
        </MenuButton>
        <MenuButton 
          title="Ordered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton 
          title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
        >
          <Quote size={18} />
        </MenuButton>
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        <MenuButton 
          title="Link"
          onClick={setLink}
          isActive={editor.isActive('link')}
        >
          <LinkIcon size={18} />
        </MenuButton>
        <MenuButton 
          title="Image"
          onClick={addImage}
        >
          <ImageIcon size={18} />
        </MenuButton>
        <div className="flex-1" />
        <MenuButton 
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton 
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
