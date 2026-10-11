
import { 
  isCodeBlockDelimiter, 
  isBulletPoint, 
  isNumberedListItem,
  extractCodeBlockLanguage,
  extractBulletContent,
  extractNumberedListContent
} from '../utils/textProcessing';

export const useMessageFormatter = () => {
  const formatMessage = (text: string) => {
    // Split by double line breaks to handle paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n');
      const elements: Array<{
        type: 'code' | 'list' | 'orderedList' | 'text';
        content: any;
        key: string;
      }> = [];
      
      let currentList: string[] = [];
      let currentOrderedList: string[] = [];
      let inCodeBlock = false;
      let codeBlockContent: string[] = [];
      let codeBlockLanguage = '';
      
      const flushLists = (index: number) => {
        if (currentList.length > 0) {
          elements.push({
            type: 'list',
            content: [...currentList],
            key: `ul-${pIndex}-${index}`
          });
          currentList = [];
        }
        
        if (currentOrderedList.length > 0) {
          elements.push({
            type: 'orderedList',
            content: [...currentOrderedList],
            key: `ol-${pIndex}-${index}`
          });
          currentOrderedList = [];
        }
      };
      
      lines.forEach((line, index) => {
        // Check for code block start/end
        if (isCodeBlockDelimiter(line)) {
          if (!inCodeBlock) {
            // Starting a code block
            inCodeBlock = true;
            codeBlockLanguage = extractCodeBlockLanguage(line);
            codeBlockContent = [];
          } else {
            // Ending a code block
            inCodeBlock = false;
            elements.push({
              type: 'code',
              content: {
                lines: [...codeBlockContent],
                language: codeBlockLanguage
              },
              key: `code-block-${pIndex}-${index}`
            });
            codeBlockContent = [];
            codeBlockLanguage = '';
          }
          return;
        }
        
        // If we're inside a code block, just collect the content
        if (inCodeBlock) {
          codeBlockContent.push(line);
          return;
        }
        
        // Check for bullet points
        if (isBulletPoint(line)) {
          currentList.push(extractBulletContent(line));
        }
        // Check for numbered lists
        else if (isNumberedListItem(line)) {
          currentOrderedList.push(extractNumberedListContent(line));
        }
        // Regular text line
        else {
          // Flush any pending lists
          flushLists(index);
          
          if (line.trim()) {
            elements.push({
              type: 'text',
              content: line,
              key: `p-${pIndex}-${index}`
            });
          }
        }
      });
      
      // Flush any remaining lists
      flushLists(lines.length);
      
      // Handle any unclosed code block at the end
      if (inCodeBlock && codeBlockContent.length > 0) {
        elements.push({
          type: 'code',
          content: {
            lines: codeBlockContent,
            language: codeBlockLanguage
          },
          key: `code-block-final-${pIndex}`
        });
      }
      
      return {
        paragraphIndex: pIndex,
        elements
      };
    });
  };

  return { formatMessage };
};
