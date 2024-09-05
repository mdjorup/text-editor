'use client';

import { DocumentEditorProps } from "@/lib/types";


const DocumentEditor: React.FC<DocumentEditorProps> = ({ content, onContentChange }) => {



  return (
    <div className="h-full w-full">

      <textarea
        className="h-full w-full resize-none border-none focus:outline-none focus:ring-0"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
      />
    </div>
  );
};

export default DocumentEditor;