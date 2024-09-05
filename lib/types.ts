export interface Version {
  id: number;
  content: string;
  timestamp: Date;
}




export interface DocumentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
}


