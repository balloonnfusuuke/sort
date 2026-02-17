import React from 'react';
import { Participant } from '../types';
import { Download, Printer, RotateCcw, CopyCheck } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StatsBarProps {
  participants: Participant[];
  onReset: () => void;
  onCheckDuplicates: () => void;
}

const StatsBar: React.FC<StatsBarProps> = ({ participants, onReset, onCheckDuplicates }) => {
  // Filter out reference-only entries for stats
  const activeParticipants = participants.filter(p => !p.isRef);
  
  const totalPeople = activeParticipants.reduce((acc, p) => acc + p.count, 0);
  const totalGroups = activeParticipants.length;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // For export, we might want to include everything, or maybe just the active ones?
    // Let's include everything but mark references
    const ws = XLSX.utils.json_to_sheet(participants.map((p, i) => ({
      No: i + 1,
      名前: p.normalizedName,
      読み: p.reading,
      人数: p.count,
      備考: p.isRef ? '※元データ' : '',
      チェック: ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "名簿");
    XLSX.writeFile(wb, "整理済み名簿.xlsx");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl z-50 no-print">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Stats */}
        <div className="flex space-x-6 text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">登録グループ数</span>
            <span className="font-bold text-xl text-slate-800">{totalGroups}<span className="text-sm font-normal ml-1">組</span></span>
          </div>
          <div className="w-px bg-slate-200 h-8 self-center"></div>
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs">参加者合計</span>
            <span className="font-bold text-xl text-indigo-600">{totalPeople}<span className="text-sm font-normal ml-1">人</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium text-xs sm:text-sm"
            title="最初からやり直す"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">リセット</span>
          </button>

          <button 
            onClick={onCheckDuplicates}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors font-medium text-xs sm:text-sm shadow-sm"
            title="重複をチェック"
          >
            <CopyCheck className="w-4 h-4 sm:mr-2" />
            <span className="inline">重複検査</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none flex items-center justify-center px-3 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-xs sm:text-sm shadow-sm"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Excel保存</span>
            <span className="inline sm:hidden">保存</span>
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-bold text-xs sm:text-sm shadow-md"
          >
            <Printer className="w-4 h-4 sm:mr-2" />
            <span className="inline">印刷</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;