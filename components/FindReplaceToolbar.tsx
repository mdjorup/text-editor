'use client'

import { wordEmbeddings } from '@/lib/embeddings';
import { ArrowDown, ArrowUp, Lightbulb, Replace, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface FindReplaceToolbarProps {
  content: string;
  onReplace: (newContent: string) => void;
  onClose: () => void;
  onFindTextChange: (findText: string) => void;
  onMatchesChange: (matches: number[]) => void;
  onCaseSensitiveChange: (isCaseSensitive: boolean) => void;
  onCurrentMatchIndexChange: (index: number) => void;
}

const FindReplaceToolbar: React.FC<FindReplaceToolbarProps> = ({content, onReplace, onClose, onFindTextChange, onMatchesChange, onCurrentMatchIndexChange, onCaseSensitiveChange}) => {
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matches, setMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<string[]>([]);



  const findMatches = useCallback(() => {
    if (!findText) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    
    const flags = isCaseSensitive ? 'g' : 'gi';
    const regex = new RegExp(findText, flags);
    const newMatches: number[] = [];
    let match;
    console.time("findMatches");
    while ((match = regex.exec(content)) !== null) {
      newMatches.push(match.index);
    }
    console.timeEnd("findMatches");
    const newCurrentMatchIndex = newMatches.length > 0 ? 0 : -1;

    setMatches(newMatches);
    setCurrentMatchIndex(newCurrentMatchIndex);
  }, [isCaseSensitive, findText, content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleFindNext();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  })

  useEffect(() => {
    findMatches();
  }, [findText, content, isCaseSensitive, findMatches]);
  
  useEffect(() => {
    onFindTextChange(findText);
    onMatchesChange(matches);
    onCurrentMatchIndexChange(currentMatchIndex);
    onCaseSensitiveChange(isCaseSensitive);
  }, [findText, matches, currentMatchIndex, isCaseSensitive, onFindTextChange, onMatchesChange, onCurrentMatchIndexChange, onCaseSensitiveChange]);

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
      findMatches(); // Refresh matches after replace
    }
  };

  const handleReplaceAll = () => {
    if (findText) {
      const flags = isCaseSensitive ? 'g' : 'gi';
      const regex = new RegExp(findText, flags);
      const newContent = content.replace(regex, replaceText);
      onReplace(newContent);
      findMatches(); // Refresh matches after replace all
    }
  };

  const getIntelligentSuggestions = (word: string) => {
    const lowercaseWord = word.toLowerCase();
    return wordEmbeddings[lowercaseWord] || [];
  };

  const handleIntelligentReplace = () => {
    if (currentMatchIndex >= 0) {
      const matchStart = matches[currentMatchIndex];
      const matchEnd = matchStart + findText.length;
      const contextBefore = content.slice(Math.max(0, matchStart - 50), matchStart);
      const contextAfter = content.slice(matchEnd, Math.min(content.length, matchEnd + 50));
      
      const suggestions = getIntelligentSuggestions(findText);
      setIntelligentSuggestions(suggestions);
    }
  };

  const applyIntelligentReplace = (suggestion: string) => {
    if (currentMatchIndex >= 0) {
      const before = content.slice(0, matches[currentMatchIndex]);
      const after = content.slice(matches[currentMatchIndex] + findText.length);
      const newContent = before + suggestion + after;
      onReplace(newContent);
      findMatches(); // Refresh matches after replace
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 flex items-center space-x-2 z-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 flex-grow">
          <Search className="text-gray-400  h-4 w-4" />
          <Input
            placeholder="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="w-48"
          />
          <span className="text-sm text-gray-500  min-w-[60px]">
            {matches.length > 0 ? `${currentMatchIndex + 1} of ${matches.length}` : 'No matches'}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleFindPrevious} disabled={matches.length === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous match</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleFindNext} disabled={matches.length === 0}>
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next match</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2">
          <Replace className="text-gray-400 dark:text-gray-500 h-4 w-4" />
          <Input
            placeholder="Replace"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-48"
          />
          <Button size="sm" onClick={handleReplace} disabled={replaceText === "" || matches.length === 0}>
            Replace
          </Button>
          <Button size="sm" onClick={handleReplaceAll} disabled={replaceText === "" || matches.length === 0}>
            Replace All
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" onClick={handleIntelligentReplace} disabled={matches.length === 0}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Intelligent Replace
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium">Suggested Replacements:</h4>
                {intelligentSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => applyIntelligentReplace(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
                {intelligentSuggestions.length === 0 && (
                  <p className="text-sm text-gray-500">No suggestions available.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className='flex items-center space-x-2'>
          <Checkbox
            id="caseSensitive"
            checked={isCaseSensitive}
            onCheckedChange={() => setIsCaseSensitive(!isCaseSensitive)}
          />
          <label
            htmlFor="caseSensitive"
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            Case sensitive
          </label>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={onClose} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Close find and replace</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default FindReplaceToolbar