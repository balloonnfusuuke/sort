import React, { useState } from 'react';
import { Participant, PrintSettings } from '../types';
import { User, Users, CheckSquare, Pencil, Save, X } from 'lucide-react';
import { getIndexHeader } from '../utils/stringUtils';

interface RosterTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  printSettings: PrintSettings;
}

const RosterTable: React.FC<RosterTableProps> = ({ participants, onUpdate, printSettings }) => {
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

  // Calculate dynamic classes based on print settings
  const getPrintStyles = () => {
    switch (printSettings.fontSize) {
      case 'small':
        return {
          container: 'print:columns-4 print:gap-4',
          headerText: 'print:text-lg print:py-1 print:border-b-2 print:mt-2',
          rowPadding: 'print:py-0.5',
          nameText: 'print:text-sm print:font-bold',
          readingText: 'print:text-[10px]',
          countText: 'print:text-sm print:font-bold',
          checkboxSize: 'print:w-6 print:h-6 print:border-2'
        };
      case 'large':
        return {
          container: 'print:columns-2 print:gap-8',
          headerText: 'print:text-2xl print:py-2 print:border-b-4 print:mt-6',
          rowPadding: 'print:py-3',
          nameText: 'print:text-2xl print:font-extrabold',
          readingText: 'print:text-sm',
          countText: 'print:text-2xl print:font-black',
          checkboxSize: 'print:w-12 print:h-12 print:border-4'
        };
      case 'medium':
      default:
        // Adjust columns based on setting, even for medium font
        const cols = printSettings.columns === 4 ? 'print:columns-4 print:gap-4' : 
                     printSettings.columns === 3 ? 'print:columns-3 print:gap-6' : 
                     'print:columns-2 print:gap-8';
        return {
          container: cols,
          headerText: 'print:text-xl print:py-1.5 print:border-b-2 print:mt-4',
          rowPadding: 'print:py-1.5',
          nameText: 'print:text-base print:font-bold',
          readingText: 'print:text-xs',
          countText: 'print:text-lg print:font-bold',
          checkboxSize: 'print:w-8 print:h-8 print:border-2'
        };
    }
  };

  // Override container column class if user explicitly set columns differently than default for size
  const styles = getPrintStyles();
  if (printSettings.columns === 2) styles.container = 'print:columns-2 print:gap-8';
  if (printSettings.columns === 3) styles.container = 'print:columns-3 print:gap-6';
  if (printSettings.columns === 4) styles.container = 'print:columns-4 print:gap-4';

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

      {/* List Container - Uses CSS Columns for Print */}
      <div className={`border-x border-b border-slate-200 print:border-none print:block ${styles.container}`}>
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
                <div className={`bg-slate-200 text-slate-800 font-extrabold text-xl px-4 py-1.5 border-b-2 border-slate-300 mt-0 print:bg-slate-200 print:text-black print:border-black print:first:mt-0 ${styles.headerText}`}>
                  {currentHeader}
                </div>
              )}
              
              <div 
                className={`
                  flex items-stretch border-b border-slate-200 last:border-0 
                  print:border-black print:border-b
                  ${isEditing ? 'bg-indigo-50' : 'hover:bg-slate-50 print:hover:bg-transparent'}
                  ${styles.rowPadding}
                `}
              >
                {/* No Column (Hidden in print to save space) */}
                <div className="w-12 flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-mono border-r border-slate-200 print:hidden">
                  {index + 1}
                </div>

                {/* Name Column */}
                <div className="flex-1 px-4 py-3 flex flex-col justify-center border-r border-slate-200 print:border-none print:px-2 print:py-0">
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
                      <div className={`text-lg font-bold text-slate-900 leading-tight ${styles.nameText}`}>
                        {p.normalizedName}
                      </div>
                      {(p.reading && p.reading !== p.normalizedName) ? (
                          <div className={`text-xs text-slate-500 font-mono mt-0.5 print:text-slate-600 ${styles.readingText}`}>
                          {p.reading}
                          </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Count Column */}
                <div className="w-24 flex items-center justify-center border-r border-slate-200 print:border-none print:w-auto print:justify-end print:pr-2">
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
                      <span className={`text-lg font-bold text-slate-800 ${styles.countText}`}>
                          {p.count}<span className="text-sm ml-1 font-normal print:text-[0.6em]">名</span>
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

                {/* Checkbox Column (Print Only - Optimized) */}
                <div className="w-20 hidden print:flex items-center justify-center p-2 print:w-auto border-l-2 border-slate-300 print:border-black">
                  <div className={`border-2 border-black rounded-sm bg-white ${styles.checkboxSize}`}>
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
