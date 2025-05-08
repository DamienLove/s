import * as XLSX from 'xlsx';
import type { RawSpreadsheetData, ParsedSpreadsheetData, SpreadsheetRowObject } from '@/types';

export const parseSpreadsheetFile = (file: File): Promise<{ rawData: RawSpreadsheetData, parsedData: ParsedSpreadsheetData, headers: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file."));
          return;
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // For rawData (array of arrays)
        const rawData: RawSpreadsheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as RawSpreadsheetData;
        
        // For parsedData (array of objects) and headers
        const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        
        let headers: string[] = [];
        if (rawData.length > 0) {
          headers = rawData[0].map(String); // First row as headers
        } else if (jsonData.length > 0) {
          headers = Object.keys(jsonData[0]);
        }

        const parsedData: ParsedSpreadsheetData = jsonData.map(row => {
          const newRow: SpreadsheetRowObject = {};
          for (const header of headers) {
            newRow[header] = row[header] !== undefined ? row[header] : "";
          }
          return newRow;
        });

        resolve({ rawData, parsedData, headers });
      } catch (error) {
        console.error("Error parsing spreadsheet:", error);
        reject(new Error("Error parsing spreadsheet file. Please ensure it's a valid CSV or XLSX file."));
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("Error reading file."));
    };

    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type. Please upload a CSV or XLSX file."));
    }
  });
};
