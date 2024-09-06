'use client';

import React from 'react';
import { Textarea } from './ui/textarea';

type Highlight = 
  | string
  | RegExp
  | (string | RegExp)[]
  | ((value: string) => string | RegExp | (string | RegExp)[]);

interface HighlightedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  highlightedContent: Highlight;

}

const HighlightedTextarea: React.FC<HighlightedTextareaProps> = ({ 
  value, 
  onChange, 
  highlightedContent, // The string that we want to highlight
  className,
  ...restProps 
}) => {

  return (
    <Textarea value={value} onChange={onChange} className={className}/>
  );
};

export default HighlightedTextarea