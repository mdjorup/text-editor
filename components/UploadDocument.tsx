'use client'

import * as pdfjsLib from 'pdfjs-dist';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.6.82/build/pdf.worker.mjs';



interface UploadDocumentProps {
  onUpload: (text: string) => void;
}

const UploadDocument = ({onUpload}: UploadDocumentProps) => {
  const [progress, setProgress] = useState<number>(0);


  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;

      try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullTextContent = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = extractStructuredText(textContent);
          fullTextContent += pageText + '\n\n';

          setProgress((i / pdf.numPages) * 100);
        }

        onUpload(fullTextContent);
      } catch (error) {
        console.error('Error parsing PDF:', error);
      } finally {
        setProgress(0);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const extractStructuredText = (textContent: any): string => {
    const textItems = textContent.items;
    let structuredText = '';
    let lastY;
    let lastX;

    for (const item of textItems) {
      if (lastY && lastY !== item.transform[5]) {
        structuredText += '\n';
      } else if (lastX && item.transform[4] - lastX > 10) {
        structuredText += ' ';
      }

      structuredText += item.str;
      lastY = item.transform[5];
      lastX = item.transform[4] + item.width;
    }

    return structuredText;
  };

  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <Input type="file" accept="application/pdf" placeholder='Upload your PDF' onChange={handleUpload}/>
      <Button type="submit">Subscribe</Button>
    </div>
  )
}

export default UploadDocument