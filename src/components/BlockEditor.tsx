import { useEffect } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';

interface BlockEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function BlockEditor({ content, onChange, onSubmit, disabled = false }: BlockEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
  });

  // Update content when editor changes
  useEffect(() => {
    if (editor) {
      const unsubscribe = editor.onChange(() => {
        const blocks = editor.document;
        onChange(JSON.stringify(blocks));
      });
      return () => unsubscribe?.();
    }
  }, [editor, onChange]);

  // Handle Ctrl+Enter to submit
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: Event) => {
      const keyEvent = event as unknown as KeyboardEvent;
      if ((keyEvent.ctrlKey || keyEvent.metaKey) && keyEvent.key === 'Enter') {
        keyEvent.preventDefault();
        onSubmit();
      }
    };

    const editorElement = document.querySelector('.bn-editor');
    editorElement?.addEventListener('keydown', handleKeyDown as EventListener);

    return () => {
      editorElement?.removeEventListener('keydown', handleKeyDown as EventListener);
    };
  }, [editor, onSubmit]);

  if (disabled) {
    return (
      <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-500">
        Editor disabled while sending...
      </div>
    );
  }

  return (
    <div className="block-editor-wrapper">
      <BlockNoteView
        editor={editor}
        theme="light"
        className="min-h-[120px] max-h-[300px] overflow-y-auto bg-transparent"
      />
      <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-t border-gray-200/30 text-xs text-gray-600">
        💡 Tip: Use <kbd className="px-1.5 py-0.5 bg-gray-200/50 rounded text-gray-700">/ </kbd> for commands,
        <kbd className="px-1.5 py-0.5 bg-gray-200/50 rounded mx-1 text-gray-700">Ctrl+Enter</kbd> to send
      </div>
    </div>
  );
}
