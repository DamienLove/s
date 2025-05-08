"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { RawSpreadsheetData, ParsedSpreadsheetData } from '@/types';

interface FileUploadProps {
  onFileProcessed: (data: { rawData: RawSpreadsheetData, parsedData: ParsedSpreadsheetData, headers: string[] }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function FileUpload({ onFileProcessed, isLoading, setIsLoading }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a CSV, XLSX, or XLS file.",
          variant: "destructive",
        });
        setSelectedFile(null);
        event.target.value = ""; // Reset file input
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a spreadsheet file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Dynamically import parser to keep initial bundle small
      const { parseSpreadsheetFile } = await import('@/lib/spreadsheet-parser');
      const processedData = await parseSpreadsheetFile(selectedFile);
      onFileProcessed(processedData);
      toast({
        title: "File Processed",
        description: `${selectedFile.name} has been successfully processed.`,
      });
    } catch (error: any) {
      toast({
        title: "Processing Error",
        description: error.message || "An unknown error occurred during file processing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-6 w-6 text-primary" />
          Upload Spreadsheet
        </CardTitle>
        <CardDescription>Select a CSV or XLSX file to import.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
          className="file:text-primary file:font-semibold"
        />
        <Button onClick={handleUpload} disabled={isLoading || !selectedFile} className="w-full">
          {isLoading ? 'Processing...' : 'Upload and Process File'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Need to import Card components from shadcn
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
