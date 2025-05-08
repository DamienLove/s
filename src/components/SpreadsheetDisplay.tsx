"use client";

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckSquare, ChevronsUpDown, Rows, Grid } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RawSpreadsheetData, ParsedSpreadsheetData, SpreadsheetRowObject, SpreadsheetCell } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetDisplayProps {
  rawData: RawSpreadsheetData;
  parsedData: ParsedSpreadsheetData;
  headers: string[];
  onRowSelectForForm: (rowData: SpreadsheetRowObject) => void;
  onCellsSelectForKeyboard: (cells: string[]) => void;
}

const MAX_DISPLAY_ROWS = 100; // Performance optimization for large sheets

export function SpreadsheetDisplay({ rawData, parsedData, headers, onRowSelectForForm, onCellsSelectForKeyboard }: SpreadsheetDisplayProps) {
  const [selectedCellsForKeyboard, setSelectedCellsForKeyboard] = useState<string[]>([]);
  const [isKeyboardSelectionMode, setIsKeyboardSelectionMode] = useState(false);
  const { toast } = useToast();

  const displayData = useMemo(() => rawData.slice(1, MAX_DISPLAY_ROWS + 1), [rawData]); // Skip header row, limit rows

  const toggleKeyboardSelectionMode = () => {
    setIsKeyboardSelectionMode(!isKeyboardSelectionMode);
    setSelectedCellsForKeyboard([]); // Reset selection when toggling mode
  };

  const handleCellClickForKeyboard = (cellValue: SpreadsheetCell) => {
    if (!isKeyboardSelectionMode) return;
    const cellString = String(cellValue);
    setSelectedCellsForKeyboard(prev =>
      prev.includes(cellString) ? prev.filter(c => c !== cellString) : [...prev, cellString]
    );
  };

  const confirmKeyboardCells = () => {
    if (selectedCellsForKeyboard.length === 0) {
      toast({ title: "No cells selected", description: "Please select at least one cell for the keyboard.", variant: "destructive" });
      return;
    }
    onCellsSelectForKeyboard(selectedCellsForKeyboard);
    setIsKeyboardSelectionMode(false);
    toast({ title: "Keyboard Generated", description: `${selectedCellsForKeyboard.length} cells set for keyboard.` });
  };

  if (rawData.length === 0) {
    return <p className="text-muted-foreground">No data to display. Upload a spreadsheet.</p>;
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold text-foreground">Spreadsheet Data</h2>
        <div className="flex gap-2">
          <Button onClick={toggleKeyboardSelectionMode} variant={isKeyboardSelectionMode ? "default" : "outline"} size="sm">
            <Grid className="mr-2 h-4 w-4" />
            {isKeyboardSelectionMode ? "Cancel Cell Selection" : "Select Cells for Keyboard"}
          </Button>
          {isKeyboardSelectionMode && (
            <Button onClick={confirmKeyboardCells} size="sm">
              <CheckSquare className="mr-2 h-4 w-4" />
              Use Selected Cells
            </Button>
          )}
        </div>
      </div>
      
      {isKeyboardSelectionMode && (
        <p className="text-sm text-primary p-2 bg-primary/10 rounded-md">
          Click on cells in the table below to add them to the keyboard. Click again to remove.
          Selected cells: {selectedCellsForKeyboard.length}
        </p>
      )}

      <ScrollArea className="h-[400px] w-full border rounded-md shadow-inner">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              {headers.map((header, index) => (
                <TableHead key={index} className="font-semibold whitespace-nowrap">{header}</TableHead>
              ))}
              {!isKeyboardSelectionMode && <TableHead className="w-40 text-right whitespace-nowrap">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={isKeyboardSelectionMode ? "cursor-pointer" : ""}>
                {row.map((cell, cellIndex) => (
                  <TableCell 
                    key={cellIndex} 
                    onClick={() => handleCellClickForKeyboard(cell)}
                    className={`
                      whitespace-nowrap
                      ${isKeyboardSelectionMode && selectedCellsForKeyboard.includes(String(cell)) ? 'bg-primary/20 ring-2 ring-primary' : ''}
                      ${isKeyboardSelectionMode ? 'hover:bg-accent/10' : ''}
                    `}
                  >
                    {String(cell)}
                  </TableCell>
                ))}
                {!isKeyboardSelectionMode && (
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRowSelectForForm(parsedData[rowIndex])} // parsedData is 0-indexed for data rows
                      aria-label={`Use row ${rowIndex + 1} to fill form`}
                      className="text-xs"
                    >
                      <Rows className="mr-1 h-3 w-3" /> Fill Form
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rawData.length > MAX_DISPLAY_ROWS + 1 && (
          <p className="p-4 text-sm text-muted-foreground">Displaying first {MAX_DISPLAY_ROWS} data rows. Full sheet processed.</p>
        )}
      </ScrollArea>
    </div>
  );
}
