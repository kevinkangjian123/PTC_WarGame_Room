import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Target, 
  Search, 
  Zap, 
  History, 
  Upload, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2,
  BarChart3,
  Globe,
  BrainCircuit,
  Settings,
  Activity,
  Languages,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Phase, AnalysisResult, StrategicMemory } from './types';
import { BCGMatrix } from './components/BCGMatrix';
import { IntelligenceCard } from './components/IntelligenceCard';
import { VerdictCard } from './components/VerdictCard';
import { BCGTable } from './components/BCGTable';
import { RoadmapCard } from './components/RoadmapCard';
import { i18n, Lang } from './i18n';

export default function App() {
  const [lang, setLang] = useState<Lang>('zh');
  const [activePhase, setActivePhase] = useState<Phase>(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [memories, setMemories] = useState<StrategicMemory[]>([]);
  const [userId] = useState('commander_01');
  const [fileContent, setFileContent] = useState<string | null>(null);

  const t = i18n[lang];

  const PHASES = [
    { id: 0, name: t['phase.0.name'], icon: Globe, desc: t['phase.0.desc'] },
    { id: 1, name: t['phase.1.name'], icon: Search, desc: t['phase.1.desc'] },
    { id: 2, name: t['phase.2.name'], icon: Target, desc: t['phase.2.desc'] },
    { id: 3, name: t['phase.3.name'], icon: Zap, desc: t['phase.3.desc'] },
  ] as const;

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const res = await fetch(`/api/memory/${userId}`);
      const data = await res.json();
      setMemories(data);
    } catch (err) {
      console.error('Failed to fetch memories', err);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() && !fileContent) return;
    setLoading(true);
    try {
      // Context Injection: Get the last memory as context
      const lastMemory = memories[0] ? `Previous Win Probability: ${memories[0].last_win_prob}%. Industry: ${memories[0].industry_key}.` : '';
      const combinedInput = fileContent ? `[Document Content: ${fileContent}]\nUser Input: ${input}` : input;
      
      // Call server-side API instead of direct SDK call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: activePhase,
          input: combinedInput,
          lang: lang,
          context: lastMemory
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      
      setResult(data);
      
      if (activePhase === 2 && !data.isDivergent) {
        await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            industry_key: input.slice(0, 20) || 'Document Analysis',
            last_win_prob: data.winProbability,
            last_factors: data.factors
          })
        });
        fetchMemories();
      }
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const toggleLang = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  return (
    <div className="flex h-screen bg-war-bg overflow-hidden relative font-sans text-war-text">
      {/* Sidebar */}
      <aside className="w-80 border-r border-war-border bg-war-card flex flex-col z-10 ptc-shadow">
        <div className="p-8 border-b border-war-border">
          <div className="flex items-center gap-3 text-war-accent">
            <div className="p-1.5 rounded-xl bg-white border border-war-border ptc-shadow overflow-hidden flex items-center justify-center w-12 h-12">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/PTC_logo.svg/512px-PTC_logo.svg.png" 
                alt="PTC Logo" 
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">{t['app.title']}</h1>
              <p className="text-[10px] font-mono text-war-text-light uppercase tracking-widest">{t['app.version']}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 war-scrollbar overflow-y-auto">
          <div className="px-4 py-2 text-[10px] font-bold text-war-text-light uppercase tracking-widest mb-2">{t['nav.phases']}</div>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as Phase)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-sm group",
                activePhase === phase.id 
                  ? "bg-war-accent text-white shadow-lg ptc-shadow" 
                  : "text-war-text-light hover:bg-zinc-100 hover:text-war-text"
              )}
            >
              <phase.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activePhase === phase.id ? "text-white" : "text-war-text-light")} />
              <div className="text-left">
                <div className="font-bold">{phase.name}</div>
                <div className="text-[10px] opacity-80 truncate w-32">{phase.desc}</div>
              </div>
              {activePhase === phase.id && <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto animate-pulse" />}
            </button>
          ))}

          <div className="pt-8 px-4 py-2 text-[10px] font-bold text-war-text-light uppercase tracking-widest mb-2">{t['nav.history']}</div>
          <div className="space-y-3">
            {memories.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-war-text-light opacity-50">
                {t['memory.empty']}
              </div>
            ) : (
              memories.map((mem) => (
                <div 
                  key={mem.id} 
                  onClick={() => setInput(mem.industry_key)}
                  className="p-4 rounded-xl bg-war-bg border border-war-border hover:border-war-accent/30 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-war-text truncate w-32 group-hover:text-war-accent">{mem.industry_key}</span>
                    <span className="text-[10px] font-mono text-war-accent">{mem.last_win_prob}%</span>
                  </div>
                  <div className="text-[9px] font-mono text-war-text-light uppercase">
                    {new Date(mem.update_time!).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </nav>

        <div className="p-6 border-t border-war-border bg-zinc-50">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-war-text-light hover:bg-white hover:text-war-text transition-all text-xs border border-transparent hover:border-war-border ptc-shadow">
            <Settings className="w-4 h-4" />
            <span className="font-medium">{t['nav.settings']}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-war-border flex items-center justify-between px-10 bg-white/80 backdrop-blur-xl z-10 ptc-shadow">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-xl text-war-text tracking-tight">{PHASES[activePhase].name}</h2>
                <div className="px-2 py-0.5 rounded bg-war-accent/10 text-[10px] font-mono text-war-accent border border-war-accent/20 uppercase tracking-tighter">
                  Active_Session_0{activePhase}
                </div>
              </div>
              <span className="text-war-text-light text-xs font-medium mt-0.5">{PHASES[activePhase].desc}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-war-bg border border-war-border hover:border-war-accent/30 transition-all text-xs font-bold text-war-text-light hover:text-war-accent"
            >
              <Languages className="w-4 h-4" />
              {lang === 'zh' ? 'English' : '中文'}
            </button>
            <div className="h-8 w-px bg-war-border mx-2" />
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-war-accent/5 border border-war-accent/10">
                <div className="w-2 h-2 rounded-full bg-war-accent animate-pulse" />
                <span className="text-[10px] font-mono text-war-accent font-bold uppercase tracking-widest">{t['status.online']}</span>
              </div>
              <span className="text-[9px] text-war-text-light font-mono mt-1 uppercase">{t['status.latency']}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 war-scrollbar">
          {/* Input Section */}
          <section className="glass-panel p-8 relative overflow-hidden group ptc-shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuit className="w-32 h-32" />
            </div>
            
            <div className="flex items-start gap-6 relative z-10">
              <div className="p-4 rounded-2xl bg-war-accent/10 border border-war-accent/20 shadow-inner">
                <Activity className="w-8 h-8 text-war-accent" />
              </div>
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-bold text-war-text uppercase tracking-widest mb-1">{t['input.title']}</h3>
                    <p className="text-xs text-war-text-light">{t['input.desc']}</p>
                  </div>
                  {fileContent && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-war-accent/10 border border-war-accent/20 text-[10px] font-bold text-war-accent">
                      <CheckCircle2 className="w-3 h-3" />
                      Document Loaded
                      <button onClick={() => setFileContent(null)} className="ml-1 hover:text-war-danger">×</button>
                    </div>
                  )}
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t['input.placeholder']}
                  className="w-full h-36 bg-war-bg border border-war-border rounded-2xl p-5 text-sm text-war-text focus:outline-none focus:border-war-accent/50 focus:bg-white transition-all resize-none font-sans placeholder:text-war-text-light/50"
                />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-war-text-light hover:text-war-text text-xs font-bold transition-all border border-war-border ptc-shadow cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {t['input.upload']}
                      <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.json" />
                    </label>
                    <button className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-war-text-light hover:text-war-text text-xs font-bold transition-all border border-war-border ptc-shadow">
                      <Globe className="w-4 h-4" />
                      {t['input.search']}
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || (!input.trim() && !fileContent)}
                    className={cn(
                      "px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 active:scale-95 ptc-shadow-lg",
                      loading 
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-war-border" 
                        : "bg-war-accent text-white hover:bg-war-accent-dark shadow-lg"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                        {t['input.analyzing']}
                      </>
                    ) : (
                      <>
                        {t['input.analyze']}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-10 pb-20"
              >
                {/* Divergent Handling */}
                {result.isDivergent ? (
                  <div className="glass-panel p-10 border-l-4 border-war-blue ptc-shadow-lg">
                    <div className="flex items-center gap-3 text-war-blue mb-4">
                      <BrainCircuit className="w-6 h-6" />
                      <h4 className="font-bold text-lg">AI Knowledge Assistant</h4>
                    </div>
                    <div className="prose prose-zinc max-w-none mb-6">
                      <p className="text-base text-war-text leading-relaxed">
                        {result.summary}
                      </p>
                    </div>
                    {result.divergentReminder && (
                      <div className="p-4 rounded-xl bg-war-accent/5 border border-war-accent/20 flex items-center gap-3 text-war-accent text-xs font-bold">
                        <ArrowRight className="w-4 h-4" />
                        {result.divergentReminder}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Divergent Reminder (if any) */}
                    {result.divergentReminder && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-war-orange/5 border border-war-orange/20 flex items-center gap-3 text-war-orange text-xs font-medium"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        {result.divergentReminder}
                      </motion.div>
                    )}

                    {/* Verdict Card (MMM Model) */}
                    <div className="glass-panel p-10 ptc-shadow-lg">
                      <VerdictCard 
                        winProbability={result.winProbability} 
                        factors={result.factors} 
                        mmmBreakdown={result.mmmBreakdown}
                        variance={result.variance}
                        lang={lang} 
                      />
                    </div>

                    {/* Summary & Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      <div className="lg:col-span-8 glass-panel p-10 space-y-8 ptc-shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-war-accent/10">
                            <BarChart3 className="w-6 h-6 text-war-accent" />
                          </div>
                          <h4 className="font-bold text-lg text-war-text tracking-tight">{t['result.summary']}</h4>
                        </div>
                        
                        <div className="prose prose-zinc max-w-none">
                          <p className="text-base text-war-text-light leading-relaxed font-medium">
                            {result.summary}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="p-6 rounded-2xl bg-war-danger/5 border border-war-danger/10 group hover:border-war-danger/30 transition-all">
                            <div className="flex items-center gap-3 text-war-danger mb-4">
                              <AlertTriangle className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">{t['result.risks']}</span>
                            </div>
                            <ul className="text-sm text-war-text-light space-y-2.5">
                              {result.risks.map((risk, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-war-danger/40">•</span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="p-6 rounded-2xl bg-war-accent/5 border border-war-accent/10 group hover:border-war-accent/30 transition-all">
                            <div className="flex items-center gap-3 text-war-accent mb-4">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-widest">{t['result.recommendations']}</span>
                            </div>
                            <ul className="text-sm text-war-text-light space-y-2.5">
                              {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-war-accent/40">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-4 space-y-10">
                        {/* Phase Specific Visualizations */}
                        {activePhase === 0 && (
                          <div className="glass-panel p-8 space-y-6 ptc-shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-war-blue" />
                                <h4 className="font-bold text-sm text-war-text">{t['result.bcg_title']}</h4>
                              </div>
                            </div>
                            
                            {result.bcgPoints ? (
                              <div className="space-y-6">
                                <BCGMatrix points={result.bcgPoints} />
                                <BCGTable points={result.bcgPoints} lang={lang} />
                              </div>
                            ) : (
                              <div className="h-48 flex items-center justify-center text-war-text-light border border-dashed border-war-border rounded-xl text-[10px] uppercase tracking-widest">
                                {t['result.no_data']}
                              </div>
                            )}
                          </div>
                        )}

                        {activePhase === 3 && result.roadmap && (
                          <div className="glass-panel p-8 ptc-shadow-lg">
                            <RoadmapCard steps={result.roadmap} lang={lang} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Intelligence (Phase 1) */}
                    {activePhase === 1 && (
                      <div className="glass-panel p-10 space-y-8 ptc-shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-war-danger/10">
                              <Search className="w-6 h-6 text-war-danger" />
                            </div>
                            <h4 className="font-bold text-lg text-war-text tracking-tight">{t['result.intel_title']}</h4>
                          </div>
                        </div>
                        
                        {result.intelligence ? (
                          <IntelligenceCard data={result.intelligence} />
                        ) : (
                          <div className="h-32 flex items-center justify-center text-war-text-light border border-dashed border-war-border rounded-xl text-[10px] uppercase tracking-widest">
                            {t['result.no_data']}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Factors Grid */}
                    <div className="glass-panel p-10 ptc-shadow-lg">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-war-orange/10">
                            <Target className="w-6 h-6 text-war-orange" />
                          </div>
                          <h4 className="font-bold text-lg text-war-text tracking-tight">{t['result.factors_title']}</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {result.factors.map((factor, i) => (
                          <div key={i} className="p-6 rounded-2xl bg-war-bg border border-war-border hover:border-war-accent/30 transition-all group relative overflow-hidden ptc-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-xs font-black text-war-text-light group-hover:text-war-text transition-colors uppercase tracking-wider">{factor.name}</span>
                              <span className="text-[10px] font-mono text-war-accent">{factor.score}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden mb-4">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.abs(factor.score)}%` }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                className={cn("h-full", factor.score >= 0 ? "bg-war-accent" : "bg-war-danger")}
                              />
                            </div>
                            <p className="text-[11px] text-war-text-light leading-relaxed font-medium group-hover:text-war-text transition-colors">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
