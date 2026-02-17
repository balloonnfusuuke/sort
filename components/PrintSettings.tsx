import React from 'react';
import { PrintSettings as PrintSettingsType, PrintFontSize, PrintColumns } from '../types';
import { Settings, Grid, Type } from 'lucide-react';

interface PrintSettingsProps {
  settings: PrintSettingsType;
  onChange: (settings: PrintSettingsType) => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ settings, onChange }) => {
  const updateFontSize = (size: PrintFontSize) => {
    onChange({ ...settings, fontSize: size });
  };

  const updateColumns = (cols: PrintColumns) => {
    onChange({ ...settings, columns: cols });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm print:hidden">
      <div className="flex items-center mb-3 text-slate-800 font-bold text-sm">
        <Settings className="w-4 h-4 mr-2" />
        印刷レイアウト設定
      </div>
      
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Font Size Selection */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-2 flex items-center">
            <Type className="w-3 h-3 mr-1" />
            文字の大きさ
          </label>
          <div className="flex bg-slate-100 p-1 rounded-md">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateFontSize(size)}
                className={`
                  flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors
                  ${settings.fontSize === size 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {size === 'small' && '小 (多人数用)'}
                {size === 'medium' && '中 (標準)'}
                {size === 'large' && '大 (見やすい)'}
              </button>
            ))}
          </div>
        </div>

        {/* Column Selection */}
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-2 flex items-center">
            <Grid className="w-3 h-3 mr-1" />
            列数 (A3用紙推奨)
          </label>
          <div className="flex bg-slate-100 p-1 rounded-md">
            {(['2', '3', '4'] as const).map((colStr) => {
              const col = parseInt(colStr) as PrintColumns;
              return (
                <button
                  key={col}
                  onClick={() => updateColumns(col)}
                  className={`
                    flex-1 py-1.5 px-3 rounded text-sm font-medium transition-colors
                    ${settings.columns === col 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'}
                  `}
                >
                  {col}列
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-slate-400 text-center">
        ※ 1000名規模の場合は「小・4列」設定にすると、枚数を大幅に節約できます。
      </div>
    </div>
  );
};

export default PrintSettings;
