
export const processInlineCode = (text: string) => {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const codeContent = part.slice(1, -1);
      return {
        type: 'code',
        content: codeContent,
        key: i
      };
    }
    // Handle bold text with * text * (but not in code)
    return {
      type: 'text',
      content: part.replace(/\*\s*([^*]+)\s*\*/g, '<strong>$1</strong>'),
      key: i
    };
  });
};

export const isCodeBlockDelimiter = (line: string): boolean => {
  return line.trim().startsWith('```');
};

export const isBulletPoint = (line: string): boolean => {
  return line.trim().startsWith('*') && !line.includes('*', 1);
};

export const isNumberedListItem = (line: string): boolean => {
  return /^\d+\.\s/.test(line.trim());
};

export const extractCodeBlockLanguage = (line: string): string => {
  return line.trim().substring(3);
};

export const extractBulletContent = (line: string): string => {
  return line.trim().substring(1).trim();
};

export const extractNumberedListContent = (line: string): string => {
  return line.trim().replace(/^\d+\.\s/, '');
};
