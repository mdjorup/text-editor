'use client';

import { DocumentEditorProps } from "@/lib/types";
import { Textarea } from "./ui/textarea";


const DocumentEditor: React.FC<DocumentEditorProps> = ({ content, onContentChange }) => {



  return (
    <div className="">

      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        rows={20}
        cols={80}
      />
    </div>
  );
};

export default DocumentEditor;