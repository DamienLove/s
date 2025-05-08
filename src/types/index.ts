export type SpreadsheetCell = string | number | boolean | null;
export type SpreadsheetRowArray = SpreadsheetCell[];
export type RawSpreadsheetData = SpreadsheetRowArray[];

export interface SpreadsheetRowObject {
  [header: string]: SpreadsheetCell;
}
export type ParsedSpreadsheetData = SpreadsheetRowObject[];
