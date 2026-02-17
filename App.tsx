import React, { useState, useCallback } from 'react';
import { AppState, Participant, PrintSettings as PrintSettingsType } from './types';
import DropZone from './components/DropZone';
import RosterTable from './components/RosterTable';
import StatsBar from './components/StatsBar';
import PrintSettings from './components/PrintSettings';
import DuplicateModal from './components/DuplicateModal';
import HelpModal from './components/HelpModal';
import { processSimpleRoster } from './services/simpleService';
// getIndexHeader removed as it is no longer used
import { AlertTriangle, Printer, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Default Print Settings with numeric values
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>({
    orientation: 'landscape',
    columns: 3,
    fontSize: 12,       // 12px
    rowPadding: 2,      // 2px
    checkboxSize: 40,   // 40px for memo
    headerFontSize: 16,  // 16px for headers
    titleFontSize: 24,   // 24px for title
    
    // Header Defaults
    title: '参加者名簿',
    date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
    subtitle: '受付用リスト (50音順)',
    
    // Walk-in Slots Default
    walkInSlots: 10
  });

  const handleDataLoaded = useCallback(async (rawData: any[]) => {
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);

    try {
      // Always use Simple Processing
      await new Promise(resolve => setTimeout(resolve, 300));
      const resultData = processSimpleRoster(rawData);
      
      const sorted = resultData.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
      
      setParticipants(sorted);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg("読み込みに失敗しました。ファイル形式を確認してください。");
    }
  }, []);

  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => {
        const target = prev.find(p => p.id === id);
        if (!target) return prev;

        // Check if anything actually changed
        const hasChanges = (Object.keys(updates) as Array<keyof Participant>).some(
            key => updates[key] !== undefined && updates[key] !== target[key]
        );
        if (!hasChanges) return prev;

        // "Ghost Reference" Logic:
        // If the user changes the reading (moving it to a 50-on column) AND the item was likely in "Others" (reading == name),
        // We want to KEEP the original in "Others" as a reference (so reception can find "Tanaka" in Kanji),
        // but ADD a new entry in "Ta" for the sorted list.
        const newReading = updates.reading !== undefined ? updates.reading : target.reading;
        const isReadingChanged = newReading !== target.reading;
        
        // Check if currently "Others" (heuristic: reading is same as name, or explicitly 'その他')
        // We also check !target.isRef so we don't duplicate a clone.
        const isOriginallyUnsorted = (target.reading === target.normalizedName) && !target.isRef;

        if (isReadingChanged && isOriginallyUnsorted) {
             // 1. New Sorted Entry (Active, counts towards stats)
             const newEntry: Participant = {
                 ...target,
                 ...updates,
                 id: `sorted-${target.id}-${Date.now()}`,
                 isRef: false
             };

             // 2. Original Entry (Becomes Reference, stays in Others, removed from stats)
             // We revert the reading change for this one so it stays in place.
             const refEntry: Participant = {
                 ...target,
                 isRef: true
                 // We do NOT apply the 'reading' update here.
             };

             // If the user also changed the NAME, apply that to both? 
             // Usually they only change reading. If name changed, apply to ref too for clarity.
             if (updates.normalizedName) {
                 refEntry.normalizedName = updates.normalizedName;
             }

             const newList = prev.filter(p => p.id !== id); // Remove old instance
             newList.push(refEntry);
             newList.push(newEntry);
             
             return newList.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
        }

        // Smart Split Logic (unchanged):
        // If simply splitting count (10 -> 8), handle normally.
        const newCount = updates.count !== undefined ? updates.count : target.count;
        const isCountReduced = newCount < target.count;

        if (isReadingChanged && isCountReduced) {
            const remainderCount = target.count - newCount;
            if (remainderCount > 0) {
                const updatedP = { ...target, ...updates, count: newCount };
                const remainderP = {
                    ...target, 
                    id: `split-${target.id}-${Date.now()}`,
                    count: remainderCount
                };
                const newList = prev.map(p => p.id === id ? updatedP : p);
                newList.push(remainderP);
                return newList.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
            }
        }

        // Normal update logic: Update in place
        const updatedList = prev.map(p => 
            p.id === id ? { ...p, ...updates } : p
        );
        return updatedList.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
    });
  };

  const handleDeleteDuplicate = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const resetApp = () => {
    if (window.confirm("データをリセットして最初の画面に戻りますか？")) {
      setParticipants([]);
      setAppState(AppState.IDLE);
      setErrorMsg(null);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Dynamic Style Injection for Print Orientation */}
      <style>{`
        @media print {
          @page {
            size: ${printSettings.orientation};
            margin: 5mm; /* Reduced margins to minimize wasted space */
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 no-print relative">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <Printer className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
            名簿自動整理くん
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            バラバラな予約リストをアップロードして、印刷用のきれいな名簿を作成します。
            <br/>読み仮名がない漢字の名前は「その他」に入りますので、必要に応じて編集してください。
          </p>

          {/* Help Button positioned absolutely to the right of header content or just inline if preferred. 
              Let's put it top-right of the header area.
          */}
          <button 
            onClick={() => setShowHelpModal(true)}
            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
            title="使い方ガイド"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Print Only Header (Dynamic) */}
      <div className="hidden print:flex items-end justify-between pt-4 pb-2 mb-2 border-b-2 border-black">
        <h1 className="font-black tracking-tight" style={{ fontSize: `${printSettings.titleFontSize}px`, lineHeight: 1.1 }}>{printSettings.title}</h1>
        <div className="text-right">
             <p className="font-bold" style={{ fontSize: '12px' }}>{printSettings.date}</p>
             <p className="text-slate-600 mt-0" style={{ fontSize: '10px' }}>{printSettings.subtitle}</p>
        </div>
      </div>

      <main className="px-4 py-8 print:py-0 print:px-0">
        {errorMsg && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
                <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
            </div>
        )}

        {appState === AppState.IDLE || appState === AppState.PROCESSING || appState === AppState.ERROR ? (
          <DropZone 
            onDataLoaded={handleDataLoaded} 
            appState={appState}
            setAppState={setAppState}
          />
        ) : (
          <div className="max-w-4xl mx-auto print:w-full print:max-w-none">
             
             <PrintSettings settings={printSettings} onChange={setPrintSettings} />

             {/* Preview Note */}
             <div className="text-center mb-4 text-slate-400 text-xs print:hidden">
                ▼ 以下は印刷イメージのプレビューです。指定した列数 ({printSettings.columns}列) と文字サイズ ({printSettings.fontSize}px) で表示されます。
             </div>

            <RosterTable 
              participants={participants} 
              onUpdate={handleUpdateParticipant}
              printSettings={printSettings}
            />
          </div>
        )}
      </main>

      {appState === AppState.COMPLETE && (
        <StatsBar 
          participants={participants} 
          onReset={resetApp} 
          onCheckDuplicates={() => setShowDuplicateModal(true)}
        />
      )}

      {showDuplicateModal && (
        <DuplicateModal 
          participants={participants}
          onClose={() => setShowDuplicateModal(false)}
          onDelete={handleDeleteDuplicate}
        />
      )}

      {showHelpModal && (
        <HelpModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
};

export default App;