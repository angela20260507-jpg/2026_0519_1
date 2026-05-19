import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  Trash2,
  AlertCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  ChevronRight,
  Clock,
  Zap
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "./lib/utils";

export default function App() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGenerate = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    setResult("");
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失敗，請稍後再試。");
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearInput = () => {
    setTranscript("");
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-5 h-5 fill-white/10" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">AI 會議智能助手</span>
        </div>

        <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
          {[
            { id: 'summary', label: '摘要分析', icon: LayoutDashboard, active: true },
            { id: 'history', label: '歷史紀錄', icon: Clock },
            { id: 'team', label: '團隊協作', icon: Users },
            { id: 'settings', label: '設定', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                tab.active 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="w-8" /> {/* Spacer */}
      </header>

      {/* Main Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 overflow-hidden">
        {/* Left Panel: Input */}
        <section className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="h-14 px-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-slate-400" />
              原始會議逐字稿
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100/50">
              偵測語言: 繁體中文
            </span>
          </div>

          <div className="flex-1 p-5 relative overflow-hidden">
            <textarea
              id="transcript-input"
              name="transcript"
              className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all outline-hidden"
              placeholder="請在此貼上您的會議逐字稿、錄音轉文字內容或筆記..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              disabled={isLoading}
            />
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 z-20 shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white shrink-0">
            <button 
              onClick={clearInput}
              disabled={!transcript || isLoading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              清除內容
            </button>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !transcript.trim()}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95",
                isLoading || !transcript.trim()
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                  生成中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  開始 AI 分析
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: Output */}
        <section className="flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 relative">
          <div className="h-14 px-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-50" />
              AI 生成結果
            </div>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      已複製
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      複製
                    </>
                  )}
                </button>
                <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-xs">
                  導出
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white custom-scrollbar">
            {!result && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 opacity-60">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-sm font-medium">分析結果將顯示在此處</p>
              </div>
            )}

            {isLoading && !result && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">正在生成精準摘要...</p>
                  <p className="text-xs text-slate-400 mt-1">這可能需要幾秒鐘的時間</p>
                </div>
              </div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="markdown-body"
              >
                <ReactMarkdown>{result}</ReactMarkdown>
                
                {/* Visual extra from design: Sentiment/Tone */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-6 block">情感與語氣分析</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <div className="text-[10px] font-bold text-emerald-700 opacity-70 uppercase tracking-tighter">正向程度</div>
                      <div className="text-2xl font-black text-emerald-600 mt-1">88%</div>
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <div className="text-[10px] font-bold text-indigo-700 opacity-70 uppercase tracking-tighter">共識水平</div>
                      <div className="text-2xl font-black text-indigo-600 mt-1">高</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-9 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            AI 模型: Gemini 2.0 Flash
          </div>
          <div className="flex items-center gap-1">
             <Zap className="w-3 h-3 text-amber-400" />
             處理時間: ~1.5s
          </div>
        </div>
        <div className="hidden sm:block">
          最後更新: {new Date().toLocaleTimeString('zh-TW', { hour12: false })}
        </div>
      </footer>
    </div>
  );
}
