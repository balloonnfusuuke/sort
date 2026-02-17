import React, { useState } from 'react';
import { Participant, PrintSettings } from '../types';
import { User, Users, Pencil, Save, X, MessageSquare } from 'lucide-react';
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

  // Calculate dynamic styles
  const baseSize = printSettings.fontSize;
  const headerSize = printSettings.headerFontSize || 16;
  
  // Inline styles for print layout
  const containerStyle = {
    columnCount: printSettings.columns,
    columnGap: '6mm', // Gap for the rule
    columnRule: '1px solid #000', // Solid line between columns
    paddingTop: '1px', 
    paddingLeft: '1px', 
  };

  const headerStyle = {
    fontSize: `${headerSize}px`,
    paddingTop: '2px',
    paddingBottom: '2px',
    marginTop: '0px',
    marginBottom: '-1px', // Collapse with the row below
    position: 'relative' as const,
    zIndex: 10,
    lineHeight: '1.2'
  };

  const rowStyle = {
    paddingTop: `${printSettings.rowPadding}px`,
    paddingBottom: `${printSettings.rowPadding}px`,
  };

  const nameStyle = {
    fontSize: `${baseSize}px`,
  };

  const readingStyle = {
    fontSize: `${Math.max(8, baseSize * 0.6)}px`, // Minimum 8px
  };

  const countStyle = {
    fontSize: `${baseSize * 1.1}px`,
  };
  
  const memoColumnStyle = {
    width: `${printSettings.checkboxSize}px`,
    minWidth: `${printSettings.checkboxSize}px`,
  };

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
            <MessageSquare className="w-4 h-4 mr-2" />
            記入欄
        </div>
        <div className="w-20 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center">
            編集
        </div>
      </div>

      {/* List Container */}
      <div className="border-x border-b border-slate-200 print:border-none print:block" style={containerStyle}>
        {participants.map((p, index) => {
          const isEditing = editingId === p.id;
          const currentHeader = getIndexHeader(p.reading);
          const showHeader = currentHeader !== lastHeader;
          if (showHeader) {
            lastHeader = currentHeader;
          }
          
          // Determine stripe color (skip for editing)
          const isStripe = index % 2 === 1;
          const stripeColor = '#f3f4f6'; // slate-100

          // Calculate margin top:
          // 1. First item: 0
          // 2. New Group (Header shown): Add spacing (12px) to separate from previous group
          // 3. Same Group: Collapse border (-1px)
          const marginTop = index === 0 ? '0' : (showHeader ? '12px' : '-1px');

          return (
            <div 
              key={p.id} 
              className="print:break-inside-avoid mb-0 print:mb-0"
              style={{ marginTop: marginTop }} 
            >
              {showHeader && (
                <div 
                  className="bg-slate-200 text-slate-800 font-extrabold px-2 border border-slate-400 print:bg-slate-200 print:text-black"
                  style={{
                      ...headerStyle,
                      border: '1px solid black', // Force border in print
                  }}
                >
                  {currentHeader}
                </div>
              )}
              
              <div 
                className={`
                  flex items-stretch 
                  ${isEditing ? 'bg-indigo-50' : 'hover:bg-slate-50 print:hover:bg-transparent'}
                  border-b border-slate-200 last:border-0 print:border-none
                `}
                style={{
                    ...rowStyle,
                    // In print, we force a full border box on every item
                    border: '1px solid black',
                    // Zebra striping
                    backgroundColor: (!isEditing && isStripe) ? stripeColor : 'transparent',
                    // Ensure background prints
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                }}
              >
                {/* No Column (Screen only) */}
                <div className="w-12 flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-mono border-r border-slate-200 print:hidden">
                  {index + 1}
                </div>

                {/* Name Column */}
                <div 
                    className="flex-1 px-2 flex flex-col justify-center border-r border-slate-200 print:border-r print:border-black"
                    style={{ borderRight: '1px solid black' }} // Force internal vertical line
                >
                  {isEditing ? (
                    <div className="flex flex-col space-y-2 py-2">
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
                      <div className="font-bold text-slate-900 leading-tight print:font-extrabold" style={nameStyle}>
                        {p.normalizedName}
                      </div>
                      {(p.reading && p.reading !== p.normalizedName) ? (
                          <div className="text-slate-500 font-mono mt-0.5 print:text-slate-600" style={readingStyle}>
                          {p.reading}
                          </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Count Column */}
                <div 
                    className="w-16 flex items-center justify-center border-r border-slate-200 print:border-r print:border-black print:px-1"
                    style={{ borderRight: '1px solid black' }} // Force internal vertical line
                >
                  {isEditing ? (
                      <div className="flex items-center">
                          <input 
                              type="number" 
                              min="1"
                              className="w-10 border border-indigo-300 rounded px-1 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={editForm.count || 1}
                              onChange={e => setEditForm({...editForm, count: parseInt(e.target.value) || 1})}
                          />
                      </div>
                  ) : (
                      <span className="font-bold text-slate-800 print:font-black" style={countStyle}>
                          {p.count}<span className="text-sm ml-0.5 font-normal" style={{ fontSize: `${baseSize * 0.6}px`}}>名</span>
                      </span>
                  )}
                </div>

                {/* Memo Column */}
                <div 
                   className="hidden print:flex items-center justify-center p-0 print:block" 
                   style={memoColumnStyle}
                >
                    {/* Empty cell for writing. */}
                </div>
                 
                 {/* On Screen Placeholder for Memo */}
                 <div className="w-20 flex items-center justify-center border-r border-slate-200 print:hidden text-xs text-slate-300">
                    (記入欄)
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

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RosterTable;