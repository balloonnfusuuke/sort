import React, { useState, useMemo } from 'react';
import { Participant, PrintSettings } from '../types';
import { User, Users, Pencil, Save, X, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { getIndexHeader } from '../utils/stringUtils';

interface RosterTableProps {
  participants: Participant[];
  onUpdate: (id: string, updates: Partial<Participant>) => void;
  printSettings: PrintSettings;
}

const RosterTable: React.FC<RosterTableProps> = ({ participants, onUpdate, printSettings }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Participant>>({});

  // Identify duplicates (excluding refs if needed, but for "Duplicate Warning" we usually want to see true collisions. 
  // However, isRef entries create intentional duplicates. Let's filter out refs for the duplicate warning logic.)
  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    participants.forEach(p => {
      // Don't count refs as duplicates of real entries for warning purposes
      if (p.isRef) return; 
      counts.set(p.normalizedName, (counts.get(p.normalizedName) || 0) + 1);
    });
    const duplicates = new Set<string>();
    counts.forEach((count, name) => {
      if (count > 1) duplicates.add(name);
    });
    return duplicates;
  }, [participants]);

  // if (participants.length === 0) return null; // allow rendering for walk-in slots only if needed? likely not.

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    }
  };

  let lastHeader = '';

  // Calculate dynamic styles
  const baseSize = printSettings.fontSize;
  const headerSize = printSettings.headerFontSize || 16;
  
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

  // Generate Walk-in Rows
  const walkInRows = useMemo(() => {
      if (!printSettings.walkInSlots || printSettings.walkInSlots <= 0) return [];
      return Array.from({ length: printSettings.walkInSlots }).map((_, i) => i);
  }, [printSettings.walkInSlots]);

  // Total items = participants + 1 header per group (roughly) + walk-ins
  // We handle headers inline.

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl overflow-hidden print:max-w-none print:bg-transparent print:overflow-visible shadow-sm border border-slate-200 print:border-none print:shadow-none">
      
      {/* Inject Print-Only Styles for Multi-Column Layout */}
      <style>{`
        @media print {
          .roster-list-container {
            column-count: ${printSettings.columns};
            column-gap: 3mm; /* Tightened gap */
            column-rule: 1px solid #000;
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          .roster-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Custom tight classes for print */
          .print-tight-mt-header {
             margin-top: 2px !important;
          }
        }
      `}</style>

      {/* Table Header (Screen Only) */}
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-30">
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
      {/* Screen: Fixed height, scrollable, single column. Print: Auto height, multi-column (via style tag) */}
      <div className="roster-list-container h-[60vh] overflow-y-auto bg-white print:bg-transparent scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        
        {/* Render Participants */}
        {participants.map((p, index) => {
          const isEditing = editingId === p.id;
          const currentHeader = getIndexHeader(p.reading);
          const showHeader = currentHeader !== lastHeader;
          if (showHeader) {
            lastHeader = currentHeader;
          }
          
          const isDuplicate = !p.isRef && duplicateNames.has(p.normalizedName);

          // Determine stripe color (skip for editing)
          const isStripe = index % 2 === 1;
          const stripeColor = p.isRef ? '#fafafa' : '#f3f4f6'; // lighter for refs

          // Calculate margin top class logic
          // Default screen: mt-3 (12px) if header, -mt-[1px] if not
          // Print: want tighter spacing. We use 'print-tight-mt-header' class defined in style tag to override.
          const marginTopClass = index === 0 ? 'mt-0' : (showHeader ? 'mt-3 print-tight-mt-header' : '-mt-[1px]');

          return (
            <div 
              key={p.id} 
              className={`roster-break-avoid mb-0 print:mb-0 ${marginTopClass} ${isEditing ? 'z-20 relative shadow-lg ring-2 ring-indigo-500 rounded-lg my-2 mx-2 print:mx-0' : ''}`}
              style={{ 
                  marginBottom: isEditing ? '8px' : '0',
                  columnSpan: isEditing ? 'all' : 'none',
                  WebkitColumnSpan: isEditing ? 'all' : 'none' 
              } as React.CSSProperties} 
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
                  ${isEditing ? 'bg-white' : 'hover:bg-slate-50 print:hover:bg-transparent'}
                  border-b border-slate-200 last:border-0 print:border-none
                  ${p.isRef ? 'text-slate-500' : ''} 
                `}
                style={{
                    ...rowStyle,
                    // In print, we force a full border box on every item
                    border: isEditing ? 'none' : '1px solid black',
                    // Zebra striping
                    backgroundColor: (!isEditing && isStripe) ? stripeColor : (isEditing ? '#fff' : 'transparent'),
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact'
                }}
              >
                {/* No Column (Screen only) */}
                <div className="w-12 flex-shrink-0 flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-mono border-r border-slate-200 print:hidden">
                  {p.isRef ? <RefreshCw className="w-3 h-3 text-slate-300" /> : index + 1}
                </div>

                {/* Name Column */}
                <div 
                    className="flex-1 px-2 print:pl-0.5 print:pr-0.5 flex flex-col justify-center border-r border-slate-200 print:border-r print:border-black min-w-0"
                    style={{ borderRight: isEditing ? 'none' : '1px solid black' }} // Force internal vertical line
                >
                  {isEditing ? (
                    <div className="flex flex-col space-y-2 py-2 w-full">
                      <div className="flex flex-col w-full">
                          <label className="text-xs text-slate-500 font-bold">表示名</label>
                          <input 
                              type="text" 
                              className="w-full border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              value={editForm.normalizedName || ''}
                              onChange={e => setEditForm({...editForm, normalizedName: e.target.value})}
                              onKeyDown={handleKeyDown}
                          />
                      </div>
                      <div className="flex flex-col w-full">
                          <label className="text-xs text-slate-500 font-bold">並び替え用ヨミガナ (Enterで保存)</label>
                          <input 
                              type="text" 
                              className="w-full border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-yellow-50"
                              value={editForm.reading || ''}
                              onChange={e => setEditForm({...editForm, reading: e.target.value})}
                              onKeyDown={handleKeyDown}
                              placeholder="カナを入力"
                              autoFocus
                          />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative flex items-center w-full">
                        <div className={`flex-1 truncate leading-tight print:font-extrabold ${p.isRef ? 'font-medium' : 'font-bold text-slate-900'}`} style={nameStyle}>
                            {p.normalizedName}
                            {p.isRef && <span className="text-[10px] ml-1 text-slate-400 font-normal">(元)</span>}
                        </div>
                        {isDuplicate && (
                            <div className="flex-shrink-0 ml-1 text-amber-500 print:hidden" title="名前が重複しています">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        )}
                      </div>
                      {(p.reading && p.reading !== p.normalizedName) ? (
                          <div className="text-slate-500 font-mono mt-0.5 print:text-slate-600 truncate w-full" style={readingStyle}>
                          {p.reading}
                          </div>
                      ) : null}
                    </>
                  )}
                </div>

                {/* Count Column */}
                <div 
                    className="w-16 print:w-9 flex-shrink-0 flex items-center justify-center border-r border-slate-200 print:border-r print:border-black print:px-0.5"
                    style={{ borderRight: isEditing ? 'none' : '1px solid black' }} // Force internal vertical line
                >
                  {isEditing ? (
                      <div className="flex flex-col items-center">
                          <label className="text-[10px] text-slate-500 mb-1">人数</label>
                          <input 
                              type="number" 
                              min="1"
                              className="w-12 border border-indigo-300 rounded px-1 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={editForm.count || 1}
                              onChange={e => setEditForm({...editForm, count: parseInt(e.target.value) || 1})}
                              onKeyDown={handleKeyDown}
                          />
                      </div>
                  ) : (
                      <span className={`font-bold print:font-black ${p.isRef ? 'text-slate-500' : 'text-slate-800'}`} style={countStyle}>
                          {p.count}<span className="text-sm ml-0.5 font-normal" style={{ fontSize: `${baseSize * 0.6}px`}}>名</span>
                      </span>
                  )}
                </div>

                {/* Memo Column (Screen) */}
                {!isEditing && (
                    <div className="w-20 flex-shrink-0 flex items-center justify-center border-r border-slate-200 print:hidden text-xs text-slate-300">
                        {p.isRef ? '元データ' : '(記入欄)'}
                    </div>
                )}

                {/* Memo Column (Print) */}
                <div 
                   className="hidden print:flex items-center justify-center p-0 print:block" 
                   style={memoColumnStyle}
                >
                    {/* Empty cell for writing. */}
                </div>

                {/* Edit Actions (Screen Only) */}
                <div className="w-20 flex-shrink-0 flex items-center justify-center p-2 print:hidden">
                  {isEditing ? (
                      <div className="flex flex-col space-y-1">
                          <button onClick={saveEditing} className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm" title="保存">
                              <Save className="w-5 h-5" />
                          </button>
                          <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-colors" title="キャンセル">
                              <X className="w-5 h-5" />
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

        {/* Render Walk-in Slots */}
        {walkInRows.length > 0 && (
            <div className="roster-break-avoid mt-3 print-tight-mt-header">
                 <div 
                  className="bg-slate-700 text-white font-extrabold px-2 border border-black print:bg-slate-200 print:text-black mb-[1px]" // slightly different style or same? Let's use standard header style but dark for screen distinction
                  style={{
                      ...headerStyle,
                      border: '1px solid black',
                      // marginTop: '12px' // Handled by container class for consistency
                  }}
                >
                  メモ
                </div>
                {walkInRows.map((_, i) => (
                    <div 
                        key={`walkin-${i}`}
                        className="flex items-stretch border-b border-slate-200 last:border-0 print:border-none"
                        style={{
                            ...rowStyle,
                            border: '1px solid black',
                            backgroundColor: 'transparent',
                            marginBottom: '-1px' // collapse borders
                        }}
                    >
                         {/* No Column (Screen) */}
                        <div className="w-12 flex-shrink-0 flex items-center justify-center bg-slate-50 text-slate-400 text-sm font-mono border-r border-slate-200 print:hidden">
                           +
                        </div>
                        
                         {/* Name Column (Empty) */}
                        <div 
                            className="flex-1 px-2 print:pl-0.5 print:pr-0.5 flex items-center justify-end border-r border-slate-200 print:border-r print:border-black min-w-0 relative"
                            style={{ borderRight: '1px solid black' }}
                        >
                            {/* Insert invisible text with nameStyle to force height */}
                            <div style={nameStyle} className="invisible pointer-events-none">A</div>
                            
                            <span className="text-slate-300 text-xs print:hidden absolute right-2 top-1/2 -translate-y-1/2">(手書き用)</span>
                        </div>

                         {/* Count Column (Empty) */}
                        <div 
                            className="w-16 print:w-9 flex-shrink-0 flex items-center justify-center border-r border-slate-200 print:border-r print:border-black print:px-0.5"
                            style={{ borderRight: '1px solid black' }} 
                        >
                             <span className="text-slate-300 text-xs print:hidden">名</span>
                        </div>

                         {/* Memo Column (Screen) */}
                        <div className="w-20 flex-shrink-0 flex items-center justify-center border-r border-slate-200 print:hidden text-xs text-slate-300">
                           
                        </div>

                        {/* Memo Column (Print) */}
                        <div 
                        className="hidden print:flex items-center justify-center p-0 print:block" 
                        style={memoColumnStyle}
                        >
                        </div>
                         
                         {/* Edit (Screen) */}
                        <div className="w-20 flex-shrink-0 flex items-center justify-center p-2 print:hidden">
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default RosterTable;