"use client";

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SpreadsheetDisplay } from '@/components/SpreadsheetDisplay';
import { DemoForm } from '@/components/DemoForm';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { Separator } from '@/components/ui/separator';
import type { RawSpreadsheetData, ParsedSpreadsheetData, SpreadsheetRowObject } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileSpreadsheet, Edit3, Type } from 'lucide-react';

interface SpreadsheetFileData {
  rawData: RawSpreadsheetData;
  parsedData: ParsedSpreadsheetData;
  headers: string[];
}

export default function Home() {
  const [spreadsheetFile, setSpreadsheetFile] = useState<SpreadsheetFileData | null>(null);
  const [formData, setFormData] = useState<SpreadsheetRowObject | null>(null);
  const [keyboardKeys, setKeyboardKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileProcessed = (data: SpreadsheetFileData) => {
    setSpreadsheetFile(data);
    setFormData(null); // Clear form when new file is processed
    setKeyboardKeys([]); // Clear keyboard when new file is processed
  };

  const handleRowSelectForForm = (rowData: SpreadsheetRowObject) => {
    setFormData(rowData);
  };

  const handleCellsSelectForKeyboard = (cells: string[]) => {
    setKeyboardKeys(cells);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      <section id="upload-section" className="flex flex-col items-center space-y-6">
        <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Link Your Sheets, Simplify Your Input</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Upload your CSV or Excel files to instantly populate forms or create a custom on-screen keyboard from your data.
            </p>
        </div>
        <FileUpload onFileProcessed={handleFileProcessed} isLoading={isLoading} setIsLoading={setIsLoading} />
      </section>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-lg text-muted-foreground">Processing your spreadsheet...</p>
        </div>
      )}

      {!isLoading && spreadsheetFile && (
        <>
          <Separator />
          <section id="data-display-section" className="space-y-6">
             <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="text-2xl font-semibold">Your Spreadsheet Data</CardTitle>
                <CardDescription>
                  View your data below. Select a row to fill the demo form, or select cells to generate a custom keyboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpreadsheetDisplay
                  rawData={spreadsheetFile.rawData}
                  parsedData={spreadsheetFile.parsedData}
                  headers={spreadsheetFile.headers}
                  onRowSelectForForm={handleRowSelectForForm}
                  onCellsSelectForKeyboard={handleCellsSelectForKeyboard}
                />
              </CardContent>
            </Card>
          </section>

          <Separator />

          <section id="features-section" className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="text-center">
                  <Edit3 className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle className="text-2xl font-semibold">Auto-Fill Demo Form</CardTitle>
                  <CardDescription>
                    Select a row in the table above to see its data populate this form.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <DemoForm formData={formData} setFormData={setFormData} />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-transparent border-none shadow-none">
                <CardHeader className="text-center">
                  <Type className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle className="text-2xl font-semibold">Custom On-Screen Keyboard</CardTitle>
                  <CardDescription>
                    Use the "Select Cells for Keyboard" option above. Selected cell values will appear here as clickable keys.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <VirtualKeyboard keys={keyboardKeys} />
                </CardContent>
              </Card>
            </div>
          </section>
        </>
      )}

      {!isLoading && !spreadsheetFile && (
         <Card className="mt-8 border-dashed border-2">
            <CardContent className="p-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Spreadsheet Loaded</h3>
              <p className="text-muted-foreground mt-2">
                Upload a CSV or Excel file to get started. Once loaded, your data will appear here,
                allowing you to interact with the form-filling and custom keyboard features.
              </p>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
