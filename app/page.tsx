'use client'

import DocumentEditor from "@/components/DocumentEditor";
import UploadDocument from "@/components/UploadDocument";
import { Button } from "@/components/ui/button";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Version } from "@/lib/types";
import { format } from "date-fns";
import { Clock, RotateCcwIcon } from "lucide-react";
import * as pdfjsLib from 'pdfjs-dist';
import { useCallback, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.mjs';


export default function Home() {

  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);

  const [showingVersionHistory, setShowingVersionHistory] = useState(false); 




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
  }, [activeDocument, versions]);

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

  
  return (
    <main>

      <div className="h-screen w-screen border">
        {activeDocument === null  && <div className="flex items-center justify-center h-full w-full">
          <UploadDocument onUpload={onUpload}/>
        </div>}
        {activeDocument !== null && <div className="px-52 mt-52 "> 
          <Menubar className="mb-1 w-fit">
            <MenubarMenu>
              <MenubarTrigger>
                File
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={saveVersion}>
                  Save Version <MenubarShortcut>⌘S</MenubarShortcut>
                </MenubarItem>
                <MenubarItem disabled>
                   New Document <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Download</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>PDF</MenubarItem>
                    <MenubarItem>TXT</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  Undo <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarSub>
                  <MenubarSubTrigger>Find</MenubarSubTrigger>
                  <MenubarSubContent>
                    <MenubarItem>Find...</MenubarItem>
                    <MenubarItem>Find Next</MenubarItem>
                    <MenubarItem>Find Previous</MenubarItem>
                  </MenubarSubContent>
                </MenubarSub>
                <MenubarSeparator />
                <MenubarItem disabled>Cut</MenubarItem>
                <MenubarItem disabled>Copy</MenubarItem>
                <MenubarItem disabled>Paste</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onClick={toggleVersionHistory}>
                  Version History <MenubarShortcut>⌘H</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <DocumentEditor content={activeDocument} onContentChange={handleContentChange} />
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
