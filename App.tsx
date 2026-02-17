import React, { useState, useCallback } from 'react';
import { AppState, Participant, PrintSettings as PrintSettingsType } from './types';
import DropZone from './components/DropZone';
import RosterTable from './components/RosterTable';
import StatsBar from './components/StatsBar';
import PrintSettings from './components/PrintSettings';
import { processSimpleRoster } from './services/simpleService';
import { AlertTriangle, Printer } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Default Print Settings with numeric values
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>({
    orientation: 'landscape',
    columns: 3,
    fontSize: 12,       // 12px
    rowPadding: 2,      // 2px
    checkboxSize: 40,   // 40px for memo
    headerFontSize: 16  // 16px for headers
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
        const updatedList = prev.map(p => 
            p.id === id ? { ...p, ...updates } : p
        );
        return updatedList.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
    });
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
      <header className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 no-print">
        <div className="max-w-4xl mx-auto text-center">
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
        </div>
      </header>

      {/* Print Only Header */}
      <div className="hidden print:flex items-end justify-between pt-4 pb-2 mb-2 border-b-2 border-black">
        <h1 className="font-black tracking-tight" style={{ fontSize: '24px' }}>参加者名簿</h1>
        <div className="text-right">
             <p className="font-bold" style={{ fontSize: '12px' }}>{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             <p className="text-slate-600 mt-0" style={{ fontSize: '10px' }}>受付用リスト (50音順)</p>
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
        <StatsBar participants={participants} onReset={resetApp} />
      )}
    </div>
  );
};

export default App;