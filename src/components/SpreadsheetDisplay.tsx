"use client";

import { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckSquare, Grid, Rows } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RawSpreadsheetData, ParsedSpreadsheetData, SpreadsheetRowObject, SpreadsheetCell } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SpreadsheetDisplayProps {
  rawData: RawSpreadsheetData;
  parsedData: ParsedSpreadsheetData;
  headers: string[];
  onRowSelectForForm: (rowData: SpreadsheetRowObject) => void;
  onCellsSelectForKeyboard: (cells: string[]) => void;
}

const MAX_DISPLAY_ROWS = 100; // Performance optimization for large sheets

type CellSelectionMethod = 'single' | 'block';

export function SpreadsheetDisplay({ rawData, parsedData, headers, onRowSelectForForm, onCellsSelectForKeyboard }: SpreadsheetDisplayProps) {
  const [isKeyboardSelectionMode, setIsKeyboardSelectionMode] = useState(false);
  const [keyboardCellSelectionMethod, setKeyboardCellSelectionMethod] = useState<CellSelectionMethod>('block');
  
  const [blockSelectionStartCell, setBlockSelectionStartCell] = useState<{rowIndex: number, colIndex: number} | null>(null);
  const [blockSelectionHoverCell, setBlockSelectionHoverCell] = useState<{rowIndex: number, colIndex: number} | null>(null);
  const [currentSelectedBlockCoords, setCurrentSelectedBlockCoords] = useState<{minRow: number, maxRow: number, minCol: number, maxCol: number} | null>(null);
  
  const [selectedCellValuesForKeyboard, setSelectedCellValuesForKeyboard] = useState<string[]>([]);
  const { toast } = useToast();

  const displayData = useMemo(() => rawData.slice(1, MAX_DISPLAY_ROWS + 1), [rawData]); // Skip header row, limit rows

  // Reset selection states when selection method changes
  useEffect(() => {
    setSelectedCellValuesForKeyboard([]);
    setBlockSelectionStartCell(null);
    setBlockSelectionHoverCell(null);
    setCurrentSelectedBlockCoords(null);
  }, [keyboardCellSelectionMethod]);

  const toggleKeyboardSelectionMode = () => {
    const newModeActive = !isKeyboardSelectionMode;
    setIsKeyboardSelectionMode(newModeActive);
    
    // Reset all selection-related state
    setSelectedCellValuesForKeyboard([]);
    setBlockSelectionStartCell(null);
    setBlockSelectionHoverCell(null);
    setCurrentSelectedBlockCoords(null);

    if (newModeActive) {
      setKeyboardCellSelectionMethod('block'); // Default to block select when entering mode
    }
  };

  const updateSelectedValuesFromCoords = (coords: {minRow: number, maxRow: number, minCol: number, maxCol: number} | null) => {
    if (!coords) {
      setSelectedCellValuesForKeyboard([]);
      return;
    }
    const newValues: string[] = [];
    for (let r = coords.minRow; r <= coords.maxRow; r++) {
      for (let c = coords.minCol; c <= coords.maxCol; c++) {
        if (displayData[r] && displayData[r][c] !== undefined) {
          newValues.push(String(displayData[r][c]));
        }
      }
    }
    setSelectedCellValuesForKeyboard(newValues);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!isKeyboardSelectionMode) return;

    const cellValue = String(displayData[rowIndex][colIndex]);

    if (keyboardCellSelectionMethod === 'single') {
      setSelectedCellValuesForKeyboard(prev =>
        prev.includes(cellValue) ? prev.filter(c => c !== cellValue) : [...prev, cellValue]
      );
    } else { // Block selection mode
      if (!blockSelectionStartCell) {
        // First click: set start cell
        setBlockSelectionStartCell({ rowIndex, colIndex });
        const newCoords = { minRow: rowIndex, maxRow: rowIndex, minCol: colIndex, maxCol: colIndex };
        setCurrentSelectedBlockCoords(newCoords);
        updateSelectedValuesFromCoords(newCoords);
        setBlockSelectionHoverCell(null);
      } else {
        // Second click: finalize block
        const start = blockSelectionStartCell;
        const end = { rowIndex, colIndex };
        
        const minRow = Math.min(start.rowIndex, end.rowIndex);
        const maxRow = Math.max(start.rowIndex, end.rowIndex);
        const minCol = Math.min(start.colIndex, end.colIndex);
        const maxCol = Math.max(start.colIndex, end.colIndex);
        
        const finalCoords = { minRow, maxRow, minCol, maxCol };
        setCurrentSelectedBlockCoords(finalCoords);
        updateSelectedValuesFromCoords(finalCoords);
        
        setBlockSelectionStartCell(null); // Reset for next selection or confirm
        setBlockSelectionHoverCell(null);
      }
    }
  };

  const handleCellMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isKeyboardSelectionMode && keyboardCellSelectionMethod === 'block' && blockSelectionStartCell) {
      setBlockSelectionHoverCell({ rowIndex, colIndex });
      const start = blockSelectionStartCell;
      const hover = { rowIndex, colIndex };
      
      const minRow = Math.min(start.rowIndex, hover.rowIndex);
      const maxRow = Math.max(start.rowIndex, hover.rowIndex);
      const minCol = Math.min(start.colIndex, hover.colIndex);
      const maxCol = Math.max(start.colIndex, hover.colIndex);
      
      const hoverCoords = { minRow, maxRow, minCol, maxCol };
      setCurrentSelectedBlockCoords(hoverCoords);
      updateSelectedValuesFromCoords(hoverCoords);
    }
  };

  const handleCellMouseLeave = () => {
    if (isKeyboardSelectionMode && keyboardCellSelectionMethod === 'block' && blockSelectionStartCell && blockSelectionHoverCell) {
       // When mouse leaves, revert selection to just the start cell if no second click yet
      const startCoords = { 
        minRow: blockSelectionStartCell.rowIndex, maxRow: blockSelectionStartCell.rowIndex, 
        minCol: blockSelectionStartCell.colIndex, maxCol: blockSelectionStartCell.colIndex 
      };
      setCurrentSelectedBlockCoords(startCoords);
      updateSelectedValuesFromCoords(startCoords);
      setBlockSelectionHoverCell(null);
    }
  };
  
  const isCellActive = (rowIndex: number, colIndex: number): boolean => {
    if (!isKeyboardSelectionMode) return false;

    if (keyboardCellSelectionMethod === 'single') {
      return selectedCellValuesForKeyboard.includes(String(displayData[rowIndex][colIndex]));
    } else { // Block mode
      if (!currentSelectedBlockCoords) return false;
      return rowIndex >= currentSelectedBlockCoords.minRow && rowIndex <= currentSelectedBlockCoords.maxRow &&
             colIndex >= currentSelectedBlockCoords.minCol && colIndex <= currentSelectedBlockCoords.maxCol;
    }
  };

  const confirmKeyboardCells = () => {
    if (selectedCellValuesForKeyboard.length === 0) {
      toast({ title: "No cells selected", description: "Please select at least one cell for the keyboard.", variant: "destructive" });
      return;
    }
    onCellsSelectForKeyboard(selectedCellValuesForKeyboard);
    setIsKeyboardSelectionMode(false); // This will also trigger resets due to toggleKeyboardSelectionMode logic
    toast({ title: "Keyboard Generated", description: `${selectedCellValuesForKeyboard.length} cells set for keyboard.` });
  };

  if (rawData.length === 0) {
    return <p className="text-muted-foreground">No data to display. Upload a spreadsheet.</p>;
  }
  
  let instructionText = "";
  if (isKeyboardSelectionMode) {
    if (keyboardCellSelectionMethod === 'single') {
      instructionText = `Single Cell Mode: Click on cells to add/remove them for the keyboard. Selected: ${selectedCellValuesForKeyboard.length}`;
    } else { // block mode
      if (!blockSelectionStartCell) {
        instructionText = `Block Mode: Click a cell to mark the start of your block selection. Selected: ${selectedCellValuesForKeyboard.length}`;
      } else {
        instructionText = `Block Mode: Hover over cells and click another cell to mark the end of your block. Selected: ${selectedCellValuesForKeyboard.length}`;
      }
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border rounded-lg shadow">
        <h2 className="text-xl font-semibold text-foreground">Spreadsheet Data</h2>
        <div className="flex gap-2 flex-wrap">
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
        <div className="space-y-3 p-3 bg-primary/5 rounded-md">
          <RadioGroup
            value={keyboardCellSelectionMethod}
            onValueChange={(value: string) => setKeyboardCellSelectionMethod(value as CellSelectionMethod)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="block" id="block-select" />
              <Label htmlFor="block-select">Block Select</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single-select" />
              <Label htmlFor="single-select">Single Cell Select</Label>
            </div>
          </RadioGroup>
          <p className="text-sm text-primary">{instructionText}</p>
        </div>
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
          <TableBody onMouseLeave={keyboardCellSelectionMethod === 'block' ? handleCellMouseLeave : undefined}>
            {displayData.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                className={isKeyboardSelectionMode ? "cursor-pointer" : ""}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell 
                    key={cellIndex} 
                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, cellIndex)}
                    className={`
                      whitespace-nowrap
                      ${isCellActive(rowIndex, cellIndex) ? 'bg-primary/20 ring-2 ring-primary' : ''}
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