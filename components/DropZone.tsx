import React from 'react';
import { FileSpreadsheet, FileText, Loader2, PlayCircle } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import { AppState } from '../types';

interface DropZoneProps {
  onDataLoaded: (data: any[]) => void;
  setAppState: (state: AppState) => void;
  appState: AppState;
}

// Sample data
const SAMPLE_DATA = [
  ["参加者名", "人数・備考"],
  ["佐藤 健一郎 様", "2名"],
  ["鈴木 (3名)", ""],
  ["田中 花子", "1"],
  ["高橋", "４"],
  ["Watanabe Ken", "1"],
  ["伊藤", ""],
  ["山本", "2"],
  ["中村", "1"],
  ["小林", "3"],
  ["加藤", "1"]
];

const DropZone: React.FC<DropZoneProps> = ({ onDataLoaded, setAppState, appState }) => {

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setAppState(AppState.PROCESSING);
    try {
      const rawData = await parseFile(file);
      onDataLoaded(rawData);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("ファイルの読み込みに失敗しました。");
    }
  };

  const handleSampleClick = () => {
    onDataLoaded(SAMPLE_DATA);
  };

  const isProcessing = appState === AppState.PROCESSING;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      
      {/* Info Message */}
      <div className="text-center mb-6 text-sm text-slate-500">
        CSVまたはExcelファイルを読み込みます。<br/>
        漢字が含まれる名前は最初「その他」に分類されますが、<br/>
        後からAIを使って五十音順に振り分けることができます。
      </div>

      <label 
        className={`
          flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-3xl cursor-pointer 
          transition-all duration-300 group relative overflow-hidden
          ${isProcessing 
            ? 'border-indigo-300 bg-indigo-50 cursor-wait' 
            : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50 bg-white'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 z-10">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 mb-4 text-indigo-600 animate-spin" />
              <p className="mb-2 text-lg font-semibold text-indigo-700">
                読み込み中...
              </p>
              <p className="text-sm text-indigo-500">
                データを解析しています
              </p>
            </>
          ) : (
            <>
              <div className="flex space-x-4 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                <FileSpreadsheet className="w-10 h-10" />
                <FileText className="w-10 h-10" />
              </div>
              <p className="mb-2 text-xl font-bold text-slate-700">
                CSV または Excel をドロップ
              </p>
              <p className="text-sm text-slate-500">
                ファイルを読み込んで名簿を作成
              </p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileChange}
          disabled={isProcessing}
        />
      </label>

      {!isProcessing && (
        <div className="mt-8 flex justify-center">
            <button
                onClick={handleSampleClick}
                className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 group"
            >
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium underline underline-offset-4 decoration-slate-300 group-hover:decoration-indigo-600">
                    サンプルデータで試す
                </span>
            </button>
        </div>
      )}
    </div>
  );
};

export default DropZone;