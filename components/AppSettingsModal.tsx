import React, { useRef } from 'react';
import { X, Upload, RotateCcw, Bot, Settings } from 'lucide-react';

interface AppSettingsModalProps {
  onClose: () => void;
  customIcon: string | null;
  onSetIcon: (iconDataUrl: string | null) => void;
}

const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ onClose, customIcon, onSetIcon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          onSetIcon(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (window.confirm('アイコンを初期設定（ロボット）に戻しますか？')) {
      onSetIcon(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center space-x-2 text-slate-700">
             <Settings className="w-6 h-6" />
             <h2 className="font-bold text-xl">アプリ設定</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
            
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800">アプリアイコン設定</h3>
                <p className="text-sm text-slate-500">
                    ホーム画面上部に表示されるアイコンを好きな画像に変更できます。<br/>
                    お店のロゴなどを設定すると便利です。
                </p>

                <div className="flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    {customIcon ? (
                        <div className="relative group">
                            <img src={customIcon} alt="Custom Icon" className="w-24 h-24 object-contain rounded-xl shadow-sm bg-white" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                             <Bot className="w-12 h-12 text-white" />
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-bold transition-colors"
                    >
                        <Upload className="w-4 h-4" />
                        画像をアップロード
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    
                    {customIcon && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 py-2 px-4 rounded-lg font-bold transition-colors"
                            title="初期設定に戻す"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
             <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-sm">
                閉じる
            </button>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsModal;