import * as XLSX from 'xlsx';

export const parseFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        if (!data) {
          reject("File is empty");
          return;
        }

        let workbook;
        const isCsv = file.name.toLowerCase().endsWith('.csv');

        if (isCsv) {
          // Manual decoding to handle Shift_JIS (common in Japan) vs UTF-8
          const uint8Array = new Uint8Array(data);
          let text = '';

          // 1. Try decoding as UTF-8 with fatal=true to detect invalid sequences
          try {
            const decoder = new TextDecoder('utf-8', { fatal: true });
            text = decoder.decode(uint8Array);
          } catch (e) {
            // 2. If UTF-8 fails, assume Shift_JIS (common fallback for JP CSVs)
            try {
              const decoder = new TextDecoder('shift-jis');
              text = decoder.decode(uint8Array);
            } catch (e2) {
              // 3. Last resort: decode as UTF-8 ignoring errors
              const decoder = new TextDecoder('utf-8');
              text = decoder.decode(uint8Array);
            }
          }
          // Parse string data as CSV
          workbook = XLSX.read(text, { type: 'string' });
        } else {
          // For Excel files (.xlsx, .xls), reading as array buffer is robust and handles binary formats
          workbook = XLSX.read(data, { type: 'array' });
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Filter out empty rows
        const cleanedData = jsonData.filter((row: any) => 
          row && row.length > 0 && row.some((cell: any) => !!cell)
        );

        resolve(cleanedData);
      } catch (err) {
        console.error("Parse error:", err);
        reject("Failed to parse file format.");
      }
    };

    reader.onerror = () => reject("Error reading file.");
    
    // Read as ArrayBuffer allows us to handle both Binary Excel and Text CSV with custom decoding
    reader.readAsArrayBuffer(file);
  });
};