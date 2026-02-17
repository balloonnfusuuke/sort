import React from 'react';
import { PrintSettings as PrintSettingsType, PrintPreset } from '../types';
import { Settings, Grid, Type, MoveVertical, PenLine, File as FileIcon, Heading, Calendar, PlusSquare, Bookmark, X, Plus } from 'lucide-react';

interface PrintSettingsProps {
  settings: PrintSettingsType;
  onChange: (settings: PrintSettingsType) => void;
  presets: PrintPreset[];
  onSavePreset: (name: string, settings: PrintSettingsType) => void;
  onDeletePreset: (id: string) => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ settings, onChange, presets, onSavePreset, onDeletePreset }) => {
  
  const handleChange = (key: keyof PrintSettingsType, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const handleSaveClick = () => {
      const name = window.prompt("現在の設定に名前をつけて保存します。\n設定名を入力してください（例: A4縦・3列）");
      if (name && name.trim()) {
          onSavePreset(name.trim(), settings);
      }
  };

  return (
    <div className="bg-white border border-slate-300 rounded-xl p-5 mb-6 shadow-sm print:hidden">
      
      {/* Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center text-slate-800 font-bold text-base mb-2 md:mb-0">
            <Settings className="w-5 h-5 mr-2 text-indigo-600" />
            印刷設定
        </div>
        
        {/* Presets UI */}
        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center text-xs text-slate-400 mr-1">
                <Bookmark className="w-3 h-3 mr-1" />
                お気に入り:
            </div>
            {presets.length === 0 && (
                <span className="text-xs text-slate-300">保存された設定はありません</span>
            )}
            {presets.map(p => (
                <div key={p.id} className="flex items-center bg-indigo-50 border border-indigo-100 rounded text-xs overflow-hidden group">
                    <button 
                        onClick={() => onChange(p.settings)} 
                        className="px-2 py-1 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition-colors"
                        title="この設定を適用"
                    >
                        {p.name}
                    </button>
                    <button 
                        onClick={() => onDeletePreset(p.id)} 
                        className="px-1 py-1 text-indigo-300 hover:bg-indigo-200 hover:text-indigo-700 border-l border-indigo-100 transition-colors"
                        title="削除"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
            <button 
                onClick={handleSaveClick} 
                className="flex items-center px-2 py-1 bg-white border border-dashed border-slate-300 text-slate-500 rounded text-xs hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all ml-1"
                title="現在の設定を保存"
            >
                <Plus size={12} className="mr-1"/> 保存
            </button>
        </div>
      </div>

      {/* Header Info Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-3 text-xs font-bold text-slate-500 mb-1">
             ヘッダー情報（印刷タイトル）
          </div>
          
          <div className="relative">
              <label className="text-[10px] text-slate-400 absolute top-1 left-2">タイトル</label>
              <input 
                  type="text"
                  value={settings.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full pt-5 pb-2 px-2 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="参加者名簿"
              />
          </div>

           <div className="relative">
              <label className="text-[10px] text-slate-400 absolute top-1 left-2">日付</label>
               <input 
                  type="text"
                  value={settings.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full pt-5 pb-2 px-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="2024年..."
              />
          </div>

          <div className="relative">
              <label className="text-[10px] text-slate-400 absolute top-1 left-2">サブタイトル</label>
               <input 
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full pt-5 pb-2 px-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="受付用リスト..."
              />
          </div>
      </div>
      
      {/* Layout Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. Orientation */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <label className="text-xs font-bold text-slate-500 mb-2 flex items-center">
            <FileIcon className="w-3 h-3 mr-1" />
            用紙の向き
          </label>
          <div className="flex bg-white rounded-md border border-slate-200 overflow-hidden">
            <button
              onClick={() => handleChange('orientation', 'portrait')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${settings.orientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              縦 (Portrait)
            </button>
            <div className="w-px bg-slate-200"></div>
            <button
              onClick={() => handleChange('orientation', 'landscape')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${settings.orientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              横 (Landscape)
            </button>
          </div>
        </div>

        {/* 2. Columns */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><Grid className="w-3 h-3 mr-1" /> 列数</div>
            <span className="text-indigo-600">{settings.columns}列</span>
          </label>
          <input 
            type="range" 
            min="1" 
            max="8" 
            step="1"
            value={settings.columns}
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>1</span><span>8</span>
          </div>
        </div>

        {/* 3. Font Size (Body) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><Type className="w-3 h-3 mr-1" /> 文字サイズ (名前)</div>
            <span className="text-indigo-600">{settings.fontSize}px</span>
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="6" 
              max="32" 
              step="1"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
            <input 
              type="number"
              min="6"
              max="50"
              value={settings.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="w-16 text-right text-sm border border-slate-300 rounded px-1 py-0.5"
            />
          </div>
        </div>

        {/* 4. Font Size (Header) */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><Heading className="w-3 h-3 mr-1" /> 文字サイズ (見出し)</div>
            <span className="text-indigo-600">{settings.headerFontSize || 16}px</span>
          </label>
          <input 
            type="range" 
            min="8" 
            max="40" 
            step="1"
            value={settings.headerFontSize || 16}
            onChange={(e) => handleChange('headerFontSize', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* New: Title Font Size */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><Heading className="w-3 h-3 mr-1" /> タイトル文字サイズ</div>
            <span className="text-indigo-600">{settings.titleFontSize || 24}px</span>
          </label>
          <input 
            type="range" 
            min="16" 
            max="64" 
            step="1"
            value={settings.titleFontSize || 24}
            onChange={(e) => handleChange('titleFontSize', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* 5. Row Padding */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><MoveVertical className="w-3 h-3 mr-1" /> 行間 (余白)</div>
            <span className="text-indigo-600">{settings.rowPadding}px</span>
          </label>
           <input 
            type="range" 
            min="0" 
            max="20" 
            step="1"
            value={settings.rowPadding}
            onChange={(e) => handleChange('rowPadding', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* 6. Memo Column Width */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><PenLine className="w-3 h-3 mr-1" /> 記入欄の幅</div>
            <span className="text-indigo-600">{settings.checkboxSize}px</span>
          </label>
           <input 
            type="range" 
            min="10" 
            max="200" 
            step="5"
            value={settings.checkboxSize}
            onChange={(e) => handleChange('checkboxSize', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
        
        {/* 7. Walk-in Slots */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
           <label className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
            <div className="flex items-center"><PlusSquare className="w-3 h-3 mr-1" /> メモ欄 (空行)</div>
            <span className="text-indigo-600">{settings.walkInSlots}行</span>
          </label>
           <div className="flex items-center gap-2">
            <input 
                type="range" 
                min="0" 
                max="50" 
                step="1"
                value={settings.walkInSlots}
                onChange={(e) => handleChange('walkInSlots', parseInt(e.target.value))}
                className="flex-1 accent-indigo-600"
            />
             <input 
                type="number"
                min="0"
                max="100"
                value={settings.walkInSlots}
                onChange={(e) => handleChange('walkInSlots', parseInt(e.target.value))}
                className="w-16 text-right text-sm border border-slate-300 rounded px-1 py-0.5"
            />
           </div>
        </div>

      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-center">
        <span>※ 画面上の表示はプレビューです。正確な改ページ位置は印刷プレビューで確認してください。</span>
      </div>
    </div>
  );
};

export default PrintSettings;