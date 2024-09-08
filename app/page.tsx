'use client'

import FindReplaceToolbar from "@/components/FindReplaceToolbar";
import HighlightedTextarea from "@/components/HighlightedTextarea";
import UploadDocument from "@/components/UploadDocument";
import { Button } from "@/components/ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Version } from "@/lib/types";
import { format } from "date-fns";
import { Clock, Edit2Icon, EyeIcon, FileIcon, HistoryIcon, RotateCcwIcon, SaveIcon } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useCallback, useEffect, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.mjs';

export default function Home() {
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [showingVersionHistory, setShowingVersionHistory] = useState(false);
  const [showingFindReplace, setShowingFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [matches, setMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const { toast } = useToast();

  const handleContentChange = useCallback((newContent: string) => {
    setActiveDocument(newContent);
  }, []);

  const saveVersion = useCallback(() => {
    if (activeDocument === null) {
      return;
    }
    const newVersion: Version = {
      id: versions.length + 1,
      content: activeDocument,
      timestamp: new Date(),
    };

    setVersions([...versions, newVersion]);
    toast({
      title: 'Version Saved',
      description: 'Your document has been saved as a new version.',
      variant: "default",
      action: <ToastAction altText="Version History" onClick={() => setShowingVersionHistory(true)}><HistoryIcon className="w-4 h-4"/><span>Version History</span></ToastAction>
    })
  }, [activeDocument, versions, toast]);

  const loadVersion = useCallback((versionId: number) => {
    const versionToLoad = versions.find(v => v.id === versionId);
    if (versionToLoad) {
      setActiveDocument(versionToLoad.content);
      setShowingVersionHistory(false);
    }
  }, [versions]);

  const onUpload = (text: string) => {
    setActiveDocument(text);
  };

  const toggleVersionHistory = () => {
    setShowingVersionHistory(prev => !prev);
  }

  const handleFindReplace = (newContent: string) => {
    setActiveDocument(newContent);
  };

  const toggleFindReplace = () => {
    setShowingFindReplace(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        toggleVersionHistory();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        toggleFindReplace();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveVersion();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveVersion]);

  

  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      <div className="h-screen w-screen flex flex-col overflow-hidden">
        {activeDocument === null  && <div className="flex items-center justify-center h-full w-full">
          <UploadDocument onUpload={onUpload}/>
        </div>}
        {activeDocument !== null && <div className="flex flex-col h-full overflow-hidden px-4 sm:px-6 lg:px-8 py-6"> 
          <Toaster />
          <Menubar className="flex-shrink-0 mb-4">
            <MenubarMenu>
              <MenubarTrigger >
                  <FileIcon className="w-4 h-4 mr-2" />
                  File
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={saveVersion} className="flex items-center">
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Version <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
                <MenubarItem disabled className="flex items-center">
                    <FileIcon className="w-4 h-4 mr-2" />
                    New Document <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarSub>
                    <MenubarSubTrigger disabled className="flex items-center">
                      <FileIcon className="w-4 h-4 mr-2" />
                      Download
                    </MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem>PDF</MenubarItem>
                      <MenubarItem>TXT</MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger >
                  <Edit2Icon className="w-4 h-4 mr-2" />
                  Edit
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem disabled className="flex items-center">
                    <RotateCcwIcon className="w-4 h-4 mr-2" />
                    Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled className="flex items-center">
                    <RotateCcwIcon className="w-4 h-4 mr-2 transform scale-x-[-1]" />
                    Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={() => setShowingFindReplace(true)} className="flex items-center">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Find and Replace <MenubarShortcut>⌘F</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={toggleVersionHistory} className="flex items-center">
                    <HistoryIcon className="w-4 h-4 mr-2" />
                    Version History <MenubarShortcut>⌘H</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
          </Menubar>

          <div className="flex-grow relative overflow-hidden bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              {showingFindReplace && (
                <FindReplaceToolbar
                  content={activeDocument}
                  onReplace={handleFindReplace}
                  onClose={toggleFindReplace}
                  onFindTextChange={setFindText}
                  onMatchesChange={setMatches}
                  onCurrentMatchIndexChange={setCurrentMatchIndex}
                  onCaseSensitiveChange={setIsCaseSensitive}
                />
              )}
              <HighlightedTextarea
                content={activeDocument}
                matches={matches}
                currentMatchIndex={currentMatchIndex}
                findText={findText}
                isCaseSensitive={isCaseSensitive}
                onChange={handleContentChange}
              />
            </div>
          <Sheet open={showingVersionHistory} onOpenChange={setShowingVersionHistory}>
            <SheetContent side={'right'}>
              <SheetHeader>
                <SheetTitle>Version History</SheetTitle>
                <SheetDescription>
                  Browse and restore previous versions of your document.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="mt-4">
                <div className="space-y-4">
                  {versions.at(0)?.content !== activeDocument && <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">
                        Current Version
                      </p>
                      <p className="text-xs text-gray-500">
                        Unsaved
                      </p>
                    </div>
                    <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => {
                            saveVersion()
                            setShowingVersionHistory(false)
                          }}
                        >
                          <SaveIcon className="w-4 h-4" />
                          <span>Save</span>
                        </Button>
                  </div>}
                  {versions
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((version, index) => (
                      <div
                        key={version.id}
                        className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-foreground rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-900">
                            {index === 0 ? 'Latest Version' : `Version ${versions.length - index}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(version.timestamp, "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1"
                          onClick={() => loadVersion(version.id)}
                        >
                          <RotateCcwIcon className="w-4 h-4" />
                          <span>Load</span>
                        </Button>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>}

      </div>
    </main>
  );
}
