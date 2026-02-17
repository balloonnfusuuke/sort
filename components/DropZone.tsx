import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Loader2, PlayCircle, Sparkles, Zap } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import { AppState } from '../types';

interface DropZoneProps {
  onDataLoaded: (data: any[], useAi: boolean) => void;
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
  const [useAi, setUseAi] = useState(true);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = async (file: File) => {
    setAppState(AppState.PROCESSING);
    try {
      const rawData = await parseFile(file);
      onDataLoaded(rawData, useAi);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
      alert("ファイルの読み込みに失敗しました。");
    }
  };

  const handleSampleClick = () => {
    onDataLoaded(SAMPLE_DATA, useAi);
  };

  const isProcessing = appState === AppState.PROCESSING;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
          <button
            onClick={() => setUseAi(true)}
            className={`
              flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${useAi 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AIモード (推奨)
          </button>
          <button
            onClick={() => setUseAi(false)}
            className={`
              flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${!useAi 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'}
            `}
          >
            <Zap className="w-4 h-4 mr-2" />
            シンプルモード
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="text-center mb-6 text-sm text-slate-500">
        {useAi ? (
          <span>
            AIが「漢字の読み仮名」を推測し、<br className="sm:hidden"/>正確な50音順並べ替えと表記統一を行います。
          </span>
        ) : (
          <span>
            ファイルをそのまま読み込みます。<br className="sm:hidden"/>読み仮名生成を行わないため、漢字の並び順は正確ではありません。
          </span>
        )}
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
                {useAi ? "AIが解析中..." : "読み込み中..."}
              </p>
              <p className="text-sm text-indigo-500">
                {useAi ? "読み仮名と人数を抽出しています" : "データを変換しています"}
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
                {useAi ? "AI自動整列対応" : "高速読み込みモード"}
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
