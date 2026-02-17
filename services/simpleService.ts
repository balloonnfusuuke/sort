import { Participant } from "../types";

export const processSimpleRoster = (rawData: any[]): Participant[] => {
  // headers are typically the first row in rawData from xlsx sheet_to_json with header:1
  // We skip the first row if it looks like a header (optional, but good practice if user includes headers)
  let startIndex = 0;
  if (rawData.length > 0) {
    const firstRow = rawData[0];
    if (firstRow[0] === "名前" || firstRow[0] === "Name" || firstRow[0] === "参加者名") {
      startIndex = 1;
    }
  }

  const processedData = rawData.slice(startIndex).map((row, index) => {
    // 1. Name is usually the first column
    let name = row[0] ? String(row[0]).trim() : "不明";

    // Basic cleaning: remove "様", "殿", "先生" if they are at the end, and trim spaces
    name = name.replace(/[ 　]+(様|殿|先生|さん)$/, '').trim();

    let count = 1;
    let reading = "";

    // 2. Scan columns 1 to 4 to find "Reading" (Kana) and "Count" (Number)
    // This allows formats like [Name, Count], [Name, Reading, Count], or [Name, Count, Reading]
    for (let i = 1; i < Math.min(row.length, 5); i++) {
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

    // Fallback: if no reading found, use name (sorting will be by code)
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