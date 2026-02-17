import React, { useState } from 'react';
import { Participant } from '../types';
import { User, Users, CheckSquare, Pencil, Save, X } from 'lucide-react';
import { getIndexHeader } from '../utils/stringUtils';

interface RosterTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
}

const RosterTable: React.FC<RosterTableProps> = ({ participants, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Participant>>({});

  if (participants.length === 0) return null;

  const startEditing = (p: Participant) => {
    setEditingId(p.id);
    setEditForm({
      normalizedName: p.normalizedName,
      reading: p.reading,
      count: p.count
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  let lastHeader = '';

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl overflow-hidden print:max-w-none print:bg-transparent print:overflow-visible">
      
      {/* Table Header (Hidden in Print for multi-column flow) */}
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between print:hidden">
        <div className="w-12 text-center font-bold text-sm uppercase tracking-wider">
          No.
        </div>
        <div className="flex-1 font-bold text-sm uppercase tracking-wider flex items-center pl-4">
            <User className="w-4 h-4 mr-2" />
            名前
        </div>
        <div className="w-24 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            人数
        </div>
        <div className="w-20 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center">
            編集
        </div>
      </div>

      {/* List Container - Uses CSS Columns for A3 Print */}
      <div className="border-x border-b border-slate-200 print:border-none print:columns-2 print:gap-8 print:block">
        {participants.map((p, index) => {
          const isEditing = editingId === p.id;
          const currentHeader = getIndexHeader(p.reading);
          const showHeader = currentHeader !== lastHeader;
          if (showHeader) {
            lastHeader = currentHeader;
          }

          return (
            <div key={p.id} className="print:break-inside-avoid mb-0">
              {showHeader && (
                <div className="bg-slate-200 text-slate-800 font-extrabold text-xl px-4 py-1.5 border-b-2 border-slate-300 mt-0 print:bg-slate-200 print:text-black print:text-2xl print:py-2 print:border-black print:border-b-4 print:mt-4 print:first:mt-0">
                  {currentHeader}
                </div>
              )}
              
              <div 
                className={`
                  flex items-stretch border-b border-slate-200 last:border-0 
                  print:border-black print:border-b-2 print:py-1
                  ${isEditing ? 'bg-indigo-50' : 'hover:bg-slate-50 print:hover:bg-transparent'}
                `}
              >
                {/* No Column (Hidden in print to save space) */}
                <div className="w-12 flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-mono border-r border-slate-200 print:hidden">
                  {index + 1}
                </div>

                {/* Name Column */}
                <div className="flex-1 px-4 py-3 flex flex-col justify-center border-r border-slate-200 print:border-none print:py-4 print:px-2">
                  {isEditing ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex flex-col">
                          <label className="text-xs text-slate-500">表示名</label>
                          <input 
                              type="text" 
                              className="border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editForm.normalizedName || ''}
                              onChange={e => setEditForm({...editForm, normalizedName: e.target.value})}
                          />
                      </div>
                      <div className="flex flex-col">
                          <label className="text-xs text-slate-500">並び替え用ヨミガナ</label>
                          <input 
                              type="text" 
                              className="border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-yellow-50"
                              value={editForm.reading || ''}
                              onChange={e => setEditForm({...editForm, reading: e.target.value})}
                          />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-slate-900 leading-tight print:text-2xl print:font-extrabold">
                        {p.normalizedName}
                      </div>
                      {(p.reading && p.reading !== p.normalizedName) ? (
                          <div className="text-xs text-slate-500 font-mono mt-0.5 print:text-sm print:text-slate-600">
                          {p.reading}
                          </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Count Column */}
                <div className="w-24 flex items-center justify-center border-r border-slate-200 print:border-none print:w-32 print:justify-end print:pr-4">
                  {isEditing ? (
                      <div className="flex items-center">
                          <input 
                              type="number" 
                              min="1"
                              className="w-16 border border-indigo-300 rounded px-2 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editForm.count || 1}
                              onChange={e => setEditForm({...editForm, count: parseInt(e.target.value) || 1})}
                          />
                          <span className="ml-1 text-sm">名</span>
                      </div>
                  ) : (
                      <span className="text-lg font-bold text-slate-800 print:text-3xl print:font-black">
                          {p.count}<span className="text-sm ml-1 print:text-xl font-normal">名</span>
                      </span>
                  )}
                </div>

                {/* Edit Actions (Screen Only) */}
                <div className="w-20 flex items-center justify-center p-2 print:hidden">
                  {isEditing ? (
                      <div className="flex flex-col space-y-1">
                          <button onClick={saveEditing} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors" title="保存">
                              <Save className="w-4 h-4" />
                          </button>
                          <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors" title="キャンセル">
                              <X className="w-4 h-4" />
                          </button>
                      </div>
                  ) : (
                      <button 
                          onClick={() => startEditing(p)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                          title="編集"
                      >
                          <Pencil className="w-5 h-5" />
                      </button>
                  )}
                </div>

                {/* Checkbox Column (Print Only - A3 Optimized) */}
                <div className="w-20 hidden print:flex items-center justify-center p-2 print:w-24 border-l-2 border-slate-300 print:border-black">
                  <div className="w-6 h-6 border-2 border-black rounded-sm bg-white print:w-10 print:h-10 print:border-4 print:rounded-md">
                    {/* Empty box for writing a check mark */}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RosterTable;