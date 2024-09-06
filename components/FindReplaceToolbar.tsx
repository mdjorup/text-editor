'use client'

import { ArrowDown, ArrowUp, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';

interface FindReplaceToolbarProps {
  content: string;
  onReplace: (newContent: string) => void;
  onClose: () => void;
  onHighlight: (highlightedContent: string) => void;
}

const FindReplaceToolbar: React.FC<FindReplaceToolbarProps> = ({content, onReplace, onClose, onHighlight}) => {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matches, setMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);


  const findMatches = useCallback(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      onHighlight(content);
      return;
    }

    const flags = isCaseSensitive ? 'g' : 'gi';
    const regex = new RegExp(findText, flags);
    const newMatches: number[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      newMatches.push(match.index);
    }
    setMatches(newMatches);
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);

  }, [findText, content, onHighlight, isCaseSensitive]);

  useEffect(() => {
    findMatches();
  }, [findText, content, isCaseSensitive, findMatches]);

  const handleFindNext = () => {
    if (matches.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % matches.length;
      setCurrentMatchIndex(nextIndex);
    }
  };
  
  const handleFindPrevious = () => {
    if (matches.length > 0) {
      const prevIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
      setCurrentMatchIndex(prevIndex);
    }
  };

  const handleReplace = () => {
    if (currentMatchIndex >= 0) {
      const before = content.slice(0, matches[currentMatchIndex]);
      const after = content.slice(matches[currentMatchIndex] + findText.length);
      const newContent = before + replaceText + after;
      onReplace(newContent);
    }
  };

  const handleReplaceAll = () => {
    if (findText) {
      const flags = isCaseSensitive ? 'g' : 'gi';
      const regex = new RegExp(findText, flags);
      const newContent = content.replace(regex, replaceText);
      onReplace(newContent);
    }
  };


  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg p-2 flex items-center space-x-2 z-50">
      <Input
        placeholder="Find"
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        className="w-40"
      />
      <span className="text-sm text-gray-500">
        {currentMatchIndex + 1} of {matches.length}
      </span>
      <Button size="icon" variant="ghost" onClick={handleFindPrevious} disabled={matches.length === 0}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" onClick={handleFindNext} disabled={matches.length === 0}>
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Input
        placeholder="Replace"
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
        className="w-40"
      />
      <Button size="sm" onClick={handleReplace} disabled={replaceText === "" || matches.length === 0 }>Replace</Button>
      <Button size="sm" onClick={handleReplaceAll} disabled={replaceText === "" || matches.length === 0 }>Replace All</Button>
      <div className='flex items-center space-x-2'>
        <Checkbox id="caseSensitive" checked={isCaseSensitive} onCheckedChange={() => setIsCaseSensitive(!isCaseSensitive)} />
        <label htmlFor="caseSensitive" className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Case sensitive</label>

      </div>
      <Button size="icon" variant="ghost" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}



export default FindReplaceToolbar