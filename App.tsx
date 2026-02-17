import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Participant, PrintSettings as PrintSettingsType, PrintPreset } from './types';
import DropZone from './components/DropZone';
import RosterTable from './components/RosterTable';
import StatsBar from './components/StatsBar';
import PrintSettings from './components/PrintSettings';
import DuplicateModal from './components/DuplicateModal';
import HelpModal from './components/HelpModal';
import AppSettingsModal from './components/AppSettingsModal';
import { processSimpleRoster } from './services/simpleService';
// getIndexHeader removed as it is no longer used
import { AlertTriangle, Bot, HelpCircle, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Custom Icon State
  const [customIcon, setCustomIcon] = useState<string | null>(() => {
    try {
        return localStorage.getItem('smartRoster_customIcon');
    } catch (e) {
        return null;
    }
  });

  // Save custom icon when it changes
  useEffect(() => {
    if (customIcon) {
        try {
            localStorage.setItem('smartRoster_customIcon', customIcon);
        } catch (e) {
            console.warn("Failed to save icon to local storage (might be too large)", e);
        }
    } else {
        localStorage.removeItem('smartRoster_customIcon');
    }
  }, [customIcon]);
  
  // Default Print Settings with localStorage persistence
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>(() => {
    const defaultSettings: PrintSettingsType = {
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
    };

    try {
      const saved = localStorage.getItem('smartRoster_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge defaults with saved data to ensure all fields exist
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to load settings from local storage", e);
    }
    
    return defaultSettings;
  });

  // Presets State
  const [presets, setPresets] = useState<PrintPreset[]>(() => {
    try {
        const saved = localStorage.getItem('smartRoster_presets');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('smartRoster_settings', JSON.stringify(printSettings));
  }, [printSettings]);

  // Save presets to localStorage
  useEffect(() => {
      localStorage.setItem('smartRoster_presets', JSON.stringify(presets));
  }, [presets]);

  const handleSavePreset = (name: string, settings: PrintSettingsType) => {
      const newPreset: PrintPreset = {
          id: Date.now().toString(),
          name,
          settings: { ...settings } // Deep copy
      };
      setPresets(prev => [...prev, newPreset]);
  };

  const handleDeletePreset = (id: string) => {
      if (window.confirm("このお気に入り設定を削除しますか？")) {
        setPresets(prev => prev.filter(p => p.id !== id));
      }
  };

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
    <div className="min-h-screen pb-32 print:pb-0">
      {/* Dynamic Style Injection for Print Orientation */}
      <style>{`
        @media print {
          @page {
            size: ${printSettings.orientation};
            margin: 3mm; /* Reduced margins to minimize wasted space */
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 no-print relative">
        <div className="max-w-4xl mx-auto text-center relative">
          
          {/* Main Icon Area */}
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-2xl shadow-lg shadow-indigo-200 ${customIcon ? 'bg-white' : 'bg-indigo-600'}`}>
              {customIcon ? (
                <img src={customIcon} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Bot className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
            名簿自動整理くん
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            バラバラな予約リストを印刷用のきれいな名簿に大変身させるのだ！
          </p>

          {/* Top Right Actions */}
          <div className="absolute top-0 right-0 flex items-center gap-1">
             {/* Settings Button */}
            <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                title="アプリ設定"
            >
                <Settings className="w-6 h-6" />
            </button>

            {/* Help Button */}
            <button 
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                title="使い方ガイド"
            >
                <HelpCircle className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      </header>

      {/* 
         The separate print header is REMOVED from here.
         It has been moved inside RosterTable.tsx using column-span: all 
         to prevent page break separation issues.
      */}

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
             
             <PrintSettings 
                settings={printSettings} 
                onChange={setPrintSettings}
                presets={presets}
                onSavePreset={handleSavePreset}
                onDeletePreset={handleDeletePreset}
             />

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

      {showSettingsModal && (
        <AppSettingsModal 
            onClose={() => setShowSettingsModal(false)} 
            customIcon={customIcon}
            onSetIcon={setCustomIcon}
        />
      )}
    </div>
  );
};

export default App;