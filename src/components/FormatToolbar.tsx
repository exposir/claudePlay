interface FormatToolbarProps {
  onFormat: (format: string, selection?: { start: number; end: number }) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function FormatToolbar({ onFormat, textareaRef }: FormatToolbarProps) {
  const applyFormat = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    onFormat(`${prefix}${textToInsert}${suffix}`, { start, end });

    // Set cursor position after formatting
    setTimeout(() => {
      const newStart = start + prefix.length;
      const newEnd = newStart + textToInsert.length;
      textarea.setSelectionRange(newStart, newEnd);
      textarea.focus();
    }, 0);
  };

  const buttons = [
    {
      icon: 'B',
      title: 'Bold (Ctrl+B)',
      className: 'font-bold',
      onClick: () => applyFormat('**', '**', 'bold text'),
    },
    {
      icon: 'I',
      title: 'Italic (Ctrl+I)',
      className: 'italic',
      onClick: () => applyFormat('*', '*', 'italic text'),
    },
    {
      icon: '`',
      title: 'Inline Code',
      className: 'font-mono',
      onClick: () => applyFormat('`', '`', 'code'),
    },
    {
      icon: '</>',
      title: 'Code Block',
      onClick: () => applyFormat('```\n', '\n```', 'code here'),
    },
    {
      icon: '•',
      title: 'Bullet List',
      onClick: () => applyFormat('- ', '', 'list item'),
    },
    {
      icon: '1.',
      title: 'Numbered List',
      onClick: () => applyFormat('1. ', '', 'list item'),
    },
    {
      icon: '""',
      title: 'Quote',
      onClick: () => applyFormat('> ', '', 'quote text'),
    },
    {
      icon: '🔗',
      title: 'Link',
      onClick: () => applyFormat('[', '](url)', 'link text'),
    },
    {
      icon: 'H',
      title: 'Heading',
      className: 'font-bold text-lg',
      onClick: () => applyFormat('## ', '', 'heading'),
    },
    {
      icon: '─',
      title: 'Horizontal Rule',
      onClick: () => applyFormat('\n---\n', '', ''),
    },
    {
      icon: '📊',
      title: 'Table',
      onClick: () => applyFormat(
        '\n| Column 1 | Column 2 |\n|----------|----------|\n| ',
        ' |\n',
        'Cell'
      ),
    },
    {
      icon: 'ƒ',
      title: 'Math Formula',
      onClick: () => applyFormat('$', '$', 'x^2'),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          title={button.title}
          className={`px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors ${button.className || ''}`}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
}
