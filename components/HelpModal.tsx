import React from 'react';
import { X, FileSpreadsheet, UserCheck, ArrowRight, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2 text-indigo-700">
             <HelpCircle className="w-6 h-6" />
             <h2 className="font-bold text-xl">使い方ガイド</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 text-slate-700 leading-relaxed">
            
            {/* Section 1: Basic Flow */}
            <section>
                <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                    ファイルをアップロード
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                    <p className="mb-2">
                        <span className="font-bold">Excel (.xlsx)</span> または <span className="font-bold">CSV</span> 形式の予約リストをドラッグ＆ドロップしてください。
                    </p>
                    <div className="flex items-center space-x-2 text-slate-500 mt-2 text-xs bg-white p-2 rounded border border-slate-200">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>推奨フォーマット: 「名前」列と「人数」列が含まれるシンプルな表</span>
                    </div>
                </div>
            </section>

            {/* Section 2: Sorting Logic */}
            <section>
                <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                    自動整理と「その他」
                </h3>
                <p className="text-sm mb-3">
                    読み仮名（カタカナ・ひらがな）が含まれていれば自動で50音順に並びます。<br/>
                    <strong className="text-red-500">読み仮名がない漢字の名前は「その他」に入りますので、必要に応じて編集してください。</strong>
                </p>
            </section>

            {/* Section 3: Editing */}
            <section>
                <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center">
                    <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                    編集と参照データ (元)
                </h3>
                <div className="space-y-3 text-sm">
                    <p>
                        「その他」に入った名前は、編集ボタン（ペンアイコン）から読み仮名を入力して移動させてください。
                    </p>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg">
                        <h4 className="font-bold text-amber-800 mb-1 flex items-center">
                            <UserCheck className="w-4 h-4 mr-1" />
                            便利な機能：元データを残す
                        </h4>
                        <p className="text-amber-900 text-xs leading-relaxed">
                            「その他」から50音順の列へ移動させた際、元の「その他」の場所にも名前が <strong className="bg-white px-1 rounded border border-amber-200">(元)</strong> というマーク付きで残ります。<br/>
                            <br/>
                            これは受付で<strong>「漢字で探している場合」</strong>に見つけやすくするためです。<br/>
                            ※ (元) のデータは<strong>人数の集計には含まれません</strong>のでご安心ください。
                        </p>
                    </div>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                理解しました
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;