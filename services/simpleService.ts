import { Participant } from "../types";

export const processSimpleRoster = (rawData: any[]): Participant[] => {
  // headers are typically the first row in rawData from xlsx sheet_to_json with header:1
  // We skip the first row if it looks like a header (optional, but good practice if user includes headers)
  let startIndex = 0;
  if (rawData.length > 0) {
    const firstRow = rawData[0];
    const firstCell = firstRow[0] ? String(firstRow[0]).trim() : "";
    
    // Expanded header check to include "No" or "ID"
    const isHeader = ["名前", "Name", "参加者名", "氏名", "No", "No.", "ID"].includes(firstCell) || 
                     (firstRow[1] && ["名前", "Name", "氏名", "氏名(漢字)"].includes(String(firstRow[1]).trim()));

    if (isHeader) {
      startIndex = 1;
    }
  }

  // Column Detection Heuristic:
  // Check if Column 0 is likely an ID column (numeric) and Column 1 is the actual name (string).
  // We sample up to 10 rows.
  let col0IsNumericCount = 0;
  let sampleCount = 0;
  const sampleLimit = 10;
  
  for (let i = startIndex; i < Math.min(rawData.length, startIndex + sampleLimit); i++) {
     const row = rawData[i];
     if (!row || row.length < 2) continue; // Need at least 2 cols to justify skipping col 0
     
     const cell0 = row[0];
     // Check if cell0 is a number or a numeric string (e.g. "1", "001")
     const isNum = (typeof cell0 === 'number') || 
                   (typeof cell0 === 'string' && /^[0-9]+$/.test(cell0.trim()));
     
     // Check if cell1 is NOT a pure number (likely a name)
     const cell1 = row[1];
     const cell1IsString = typeof cell1 === 'string' && !/^[0-9]+$/.test(cell1.trim());

     if (isNum && cell1IsString) {
         col0IsNumericCount++;
     }
     sampleCount++;
  }

  // If >50% of sampled rows look like [Number, String...], assume Col 1 is Name
  let nameColIdx = 0;
  if (sampleCount > 0 && (col0IsNumericCount / sampleCount) > 0.5) {
      nameColIdx = 1;
  }

  const processedData = rawData.slice(startIndex).map((row, index) => {
    // 1. Extract Name based on determined column
    let name = row[nameColIdx] ? String(row[nameColIdx]).trim() : "不明";

    // Basic cleaning: remove "様", "殿", "先生" if they are at the end, and trim spaces
    name = name.replace(/[ 　]+(様|殿|先生|さん|君)$/, '').trim();

    let count = 1;
    let reading = "";

    // 2. Scan columns AFTER the name column to find "Reading" (Kana) and "Count" (Number)
    // We scan up to 4 columns after the name
    const scanStart = nameColIdx + 1;
    const scanEnd = Math.min(row.length, scanStart + 4);

    for (let i = scanStart; i < scanEnd; i++) {
      const cellVal = row[i] ? String(row[i]).trim() : "";
      if (!cellVal) continue;

      // Check for Count (contains numbers)
      // e.g. "2名", "3", "１名"
      // We check if it looks like a number, or ends with '名'/'人'
      const numMatch = cellVal.match(/[0-9０-９]+/);
      const isCountFormat = /[0-9０-９]+(名|人)?$/.test(cellVal) || (numMatch && cellVal.length < 5 && !isNaN(Number(cellVal)));

      if (isCountFormat) {
        // Likely a count column
        const numStr = numMatch ? numMatch[0].replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) : "1";
        count = parseInt(numStr, 10) || 1;
        continue; // Found count, move to next column
      }

      // Check for Reading (Katakana or Hiragana)
      // Regex detects strings that are purely Kana (ignoring spaces)
      // \u3040-\u309F: Hiragana, \u30A0-\u30FF: Katakana
      const isKana = /^[\u3040-\u309F\u30A0-\u30FF\s　]+$/.test(cellVal);
      if (isKana && !reading) {
         reading = cellVal;
         continue; // Found reading
      }
    }

    // Fallback: if no reading found, use name (sorting will be by code/Others)
    if (!reading) {
      reading = name;
    }

    return {
      id: `simple-${index}-${Date.now()}`,
      originalName: name,
      normalizedName: name, // In simple mode, normalized is same as cleaned original
      reading: reading,
      count: count,
    };
  });

  return processedData;
};