import { useState, useMemo } from 'react';
import { Message } from '../types/chat';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/core/fonts/inter.css';

interface ChatMessageProps {
  message: Message;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export function ChatMessage({ message, onCopy, onRegenerate, onEdit }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);

  // Create BlockNote editor for all messages (read-only)
  // Memoize the blocks to avoid recreating on every render
  const blocks = useMemo(() => {
    return parseMarkdownToBlocks(message.content);
  }, [message.content]);

  const editor = useCreateBlockNote({
    initialContent: blocks,
  });

  // Parse inline markdown styles (bold, italic, code, etc.)
  function parseInlineStyles(text: string): any[] {
    const content: any[] = [];
    let i = 0;

    while (i < text.length) {
      // Bold: **text** or __text__
      if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
        const marker = text.slice(i, i + 2);
        const endIndex = text.indexOf(marker, i + 2);
        if (endIndex !== -1) {
          const innerText = text.slice(i + 2, endIndex);
          content.push({ type: 'text', text: innerText, styles: { bold: true } });
          i = endIndex + 2;
          continue;
        }
      }
      // Italic: *text* or _text_
      else if (text[i] === '*' || text[i] === '_') {
        const marker = text[i];
        const endIndex = text.indexOf(marker, i + 1);
        if (endIndex !== -1 && text[endIndex - 1] !== '\\') {
          const innerText = text.slice(i + 1, endIndex);
          content.push({ type: 'text', text: innerText, styles: { italic: true } });
          i = endIndex + 1;
          continue;
        }
      }
      // Inline code: `text`
      else if (text[i] === '`') {
        const endIndex = text.indexOf('`', i + 1);
        if (endIndex !== -1) {
          const innerText = text.slice(i + 1, endIndex);
          content.push({ type: 'text', text: innerText, styles: { code: true } });
          i = endIndex + 1;
          continue;
        }
      }
      // Strikethrough: ~~text~~
      else if (text[i] === '~' && text[i + 1] === '~') {
        const endIndex = text.indexOf('~~', i + 2);
        if (endIndex !== -1) {
          const innerText = text.slice(i + 2, endIndex);
          content.push({ type: 'text', text: innerText, styles: { strike: true } });
          i = endIndex + 2;
          continue;
        }
      }

      // Regular text - find next special character
      let nextSpecial = text.length;
      for (let j = i + 1; j < text.length; j++) {
        if (text[j] === '*' || text[j] === '_' || text[j] === '`' || text[j] === '~') {
          nextSpecial = j;
          break;
        }
      }

      const plainText = text.slice(i, nextSpecial);
      if (plainText) {
        content.push({ type: 'text', text: plainText, styles: {} });
      }
      i = nextSpecial;
    }

    return content.length > 0 ? content : [{ type: 'text', text: '', styles: {} }];
  }

  // Convert markdown text to BlockNote blocks
  function parseMarkdownToBlocks(markdown: string): any[] {
    // Simple parser - split by paragraphs and code blocks
    const blocks: any[] = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code block
      if (line.startsWith('```')) {
        const language = line.slice(3).trim() || 'plaintext';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({
          type: 'codeBlock',
          props: { language },
          content: [{ type: 'text', text: codeLines.join('\n'), styles: {} }],
        });
        i++;
      }
      // Heading
      else if (line.startsWith('# ')) {
        blocks.push({
          type: 'heading',
          props: { level: 1 },
          content: parseInlineStyles(line.slice(2)),
        });
        i++;
      }
      else if (line.startsWith('## ')) {
        blocks.push({
          type: 'heading',
          props: { level: 2 },
          content: parseInlineStyles(line.slice(3)),
        });
        i++;
      }
      else if (line.startsWith('### ')) {
        blocks.push({
          type: 'heading',
          props: { level: 3 },
          content: parseInlineStyles(line.slice(4)),
        });
        i++;
      }
      // Bullet list
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        blocks.push({
          type: 'bulletListItem',
          content: parseInlineStyles(line.slice(2)),
        });
        i++;
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        const text = line.replace(/^\d+\.\s/, '');
        blocks.push({
          type: 'numberedListItem',
          content: parseInlineStyles(text),
        });
        i++;
      }
      // Empty line
      else if (line.trim() === '') {
        i++;
      }
      // Paragraph
      else {
        blocks.push({
          type: 'paragraph',
          content: parseInlineStyles(line),
        });
        i++;
      }
    }

    return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: [] }];
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-4 duration-500`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative max-w-[80%]">
        <div
          className={`rounded-2xl px-5 py-4 backdrop-blur-xl transition-all duration-300 ${
            isUser
              ? 'glass bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
              : 'glass bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save & Resend
                </button>
              </div>
            </div>
          ) : (
            <>
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Uploaded ${idx + 1}`} 
                      className="max-w-full h-auto max-h-64 rounded-lg border border-white/10 shadow-sm" 
                    />
                  ))}
                </div>
              )}
              <div className={`block-editor-wrapper border-0 rounded-lg overflow-hidden ${isUser ? 'user-message-editor' : 'ai-message-editor'}`}>
                <BlockNoteView
                  editor={editor}
                  editable={false}
                  theme="light"
                  className="bg-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && isHovered && (
          <div className={`absolute ${isUser ? 'right-0' : 'left-0'} -bottom-10 flex gap-1 glass rounded-xl shadow-lg p-1.5 border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200`}>
            <button
              onClick={handleCopy}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:scale-110"
              title="Copy"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            {isUser && onEdit && (
              <button
                onClick={handleEdit}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {!isUser && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all hover:scale-110"
                title="Regenerate"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
