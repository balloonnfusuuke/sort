import React, { useState, useCallback } from 'react';
import { AppState, Participant, PrintSettings as PrintSettingsType } from './types';
import DropZone from './components/DropZone';
import RosterTable from './components/RosterTable';
import StatsBar from './components/StatsBar';
import PrintSettings from './components/PrintSettings';
import { normalizeRosterData } from './services/geminiService';
import { processSimpleRoster } from './services/simpleService';
import { AlertTriangle, Zap, Printer } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [usedAi, setUsedAi] = useState<boolean>(true);
  
  // Default Print Settings: Medium size, 3 columns (Good for A3)
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>({
    fontSize: 'medium',
    columns: 3
  });

  const handleDataLoaded = useCallback(async (rawData: any[], useAi: boolean) => {
    setAppState(AppState.PROCESSING);
    setErrorMsg(null);
    setUsedAi(useAi);

    try {
      let resultData: Participant[] = [];

      if (useAi) {
        resultData = await normalizeRosterData(rawData);
      } else {
        // Delay slightly to show UI state change, looks better
        await new Promise(resolve => setTimeout(resolve, 500));
        resultData = processSimpleRoster(rawData);
      }
      
      // Sort by Reading (50-on jun)
      const sorted = resultData.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
      
      setParticipants(sorted);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(
        useAi 
          ? "AI解析に失敗しました。データ量が多いか、形式が複雑な可能性があります。" 
          : "読み込みに失敗しました。ファイル形式を確認してください。"
      );
    }
  }, []);

  const handleUpdateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(prev => {
        const updatedList = prev.map(p => 
            p.id === id ? { ...p, ...updates } : p
        );
        // Re-sort automatically whenever data changes
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
            <br/>AIが読み仮名を補完し、50音順に並べ替えます。
          </p>
        </div>
      </header>

      {/* Print Only Header */}
      <div className="hidden print:flex items-end justify-between pt-8 pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-5xl font-black tracking-tight">参加者名簿</h1>
        <div className="text-right">
             <p className="text-2xl font-bold">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             <p className="text-lg text-slate-600 mt-1">受付用リスト (50音順)</p>
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
             {!usedAi && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-center justify-center print:hidden">
                    <Zap className="w-4 h-4 mr-2" />
                    <span>シンプルモード中：並び順がおかしい場合は、<strong className="font-bold">鉛筆アイコン</strong>から「ヨミガナ」を修正してください。</span>
                </div>
             )}
             
             <PrintSettings settings={printSettings} onChange={setPrintSettings} />

             {/* Preview Note */}
             <div className="text-center mb-4 text-slate-400 text-sm print:hidden">
                ▼ 以下の内容で印刷されます ({printSettings.columns}列モード)
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
