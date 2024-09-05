import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from 'react';

export default function TextEditor({ document }: {document: File}) {
  const [content, setContent] = useState('');

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSave = () => {
    // Implement save functionality here
    console.log('Saving content:', content);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Editing: {document.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Enter your text here..."
          className="min-h-[300px] mb-4"
        />
        <Button onClick={handleSave}>Save Changes</Button>
      </CardContent>
    </Card>
  );
}