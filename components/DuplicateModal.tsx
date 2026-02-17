import React from 'react';
import { Participant } from '../types';
import { Trash2, X, AlertCircle } from 'lucide-react';

interface DuplicateGroup {
  name: string;
  ids: string[];
  totalCount: number;
  participants: Participant[];
}

interface DuplicateModalProps {
  participants: Participant[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({ participants, onClose, onDelete }) => {
  // Group logic
  const groups: DuplicateGroup[] = [];
  const map = new Map<string, Participant[]>();

  participants.forEach(p => {
    const key = p.normalizedName;
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(p);
  });

  map.forEach((list, name) => {
    if (list.length > 1) {
      groups.push({
        name,
        ids: list.map(p => p.id),
        totalCount: list.reduce((sum, p) => sum + p.count, 0),
        participants: list
      });
    }
  });

  if (groups.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">重複はありません</h3>
            <p className="text-slate-500 mb-6">同じ名前の登録は見つかりませんでした。</p>
            <button onClick={onClose} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg">
                閉じる
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2 text-amber-600">
             <AlertCircle className="w-5 h-5" />
             <h2 className="font-bold text-lg">重複している名前 ({groups.length}件)</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
            <p className="text-sm text-slate-500 mb-2">
                同じ名前が複数登録されています。不要なデータがあれば削除してください。
            </p>
            {groups.map((group) => (
                <div key={group.name} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                            <div className="text-xs text-amber-700 mt-1">
                                合計: <span className="font-bold text-base">{group.totalCount}</span> 名 / {group.participants.length}件のデータ
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {group.participants.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white p-2 rounded border border-amber-100">
                                <div className="flex items-center text-sm text-slate-600">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs font-mono mr-2 text-slate-400">?</span>
                                    <span>{p.normalizedName}</span>
                                    {p.reading !== p.normalizedName && <span className="text-xs text-slate-400 ml-2">({p.reading})</span>}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="font-bold text-slate-800 text-sm">{p.count}名</span>
                                    <button 
                                        onClick={() => onDelete(p.id)}
                                        className="text-slate-400 hover:text-red-500 p-1 flex items-center space-x-1 border border-slate-200 rounded hover:bg-red-50"
                                        title="削除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-xs">削除</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors">
                閉じる
            </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;