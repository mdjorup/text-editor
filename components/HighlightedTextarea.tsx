'use client'

import React, { useEffect, useRef, useState } from 'react';

interface HighlightedTextareaProps {
  content: string;
  matches: number[];
  currentMatchIndex: number;
  findText: string;
  onChange: (newContent: string) => void;
}

const HighlightedTextarea: React.FC<HighlightedTextareaProps> = ({
  content,
  matches,
  currentMatchIndex,
  findText,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16); // Start with a default font size

  useEffect(() => {
    const adjustFontSize = () => {
      if (containerRef.current && textareaRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const scrollHeight = textareaRef.current.scrollHeight;
        
        if (scrollHeight > containerHeight) {
          setFontSize(prevSize => Math.max(prevSize - 0.5, 8)); // Decrease font size, but not below 8px
        } else if (fontSize < 16 && scrollHeight < containerHeight * 0.9) {
          setFontSize(prevSize => Math.min(prevSize + 0.5, 16)); // Increase font size, but not above 16px
        }
      }
    };

    adjustFontSize();
  }, [content, fontSize]);

  const getHighlightedContent = () => {
    if (!findText) return content;

    const parts = content.split(new RegExp(`(${findText})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === findText.toLowerCase()) {
        const matchIndex = Math.floor(index / 2);
        const isCurrentMatch = matchIndex === currentMatchIndex;
        return `<span class="${isCurrentMatch ? 'bg-yellow-300' : 'bg-yellow-100'}">${part}</span>`;
      }
      return part;
    }).join('');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        ref={highlightRef}
        className="absolute top-0 left-0 w-full h-full px-4 pointer-events-none whitespace-pre-wrap overflow-hidden"
        dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
      />
      <textarea
        ref={textareaRef}
        className="absolute top-0 left-0 w-full h-full resize-none px-4 border-none focus:ring-0 focus:outline-none bg-transparent"
        value={content}
        onChange={handleTextareaChange}
        onScroll={handleScroll}
      />
    </div>
  );
};

export default HighlightedTextarea;