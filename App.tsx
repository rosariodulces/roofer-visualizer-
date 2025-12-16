import React, { useState, useEffect, useRef } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Visualizer } from './components/Visualizer';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Button } from './components/Button';
import { ROOF_MATERIALS, ROOF_COLORS, UI_TEXT } from './constants';
import { analyzeHouseImage, generateNewRoof, getMaterialInsight } from './services/geminiService';
import { AnalysisResult, AppState, Language } from './types';
import { AlertCircle, Zap, Shield, Menu, Box, RotateCcw, Volume2, VolumeX, Mic, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(ROOF_MATERIALS[0].id);
  const [selectedColor, setSelectedColor] = useState<string>(ROOF_COLORS[0].id);
  const [error, setError] = useState<string | null>(null);
  
  // Language State
  const [language, setLanguage] = useState<Language>('en');
  
  // AI Insight & Audio State
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Get current translations
  const t = UI_TEXT[language];

  // Initialize Voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleImageSelected = async (base64: string, type: string) => {
    setOriginalImage(`data:${type};base64,${base64}`);
    setMimeType(type);
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const result = await analyzeHouseImage(base64, type, language);
      setAnalysis(result);
      setAppState(AppState.READY_TO_EDIT);
    } catch (err) {
      console.error(err);
      setError(t.errorAnalysis);
      setAppState(AppState.READY_TO_EDIT);
    }
  };

  // Effect to fetch insight when material changes
  useEffect(() => {
    const fetchInsight = async () => {
      if (!originalImage || !analysis || appState === AppState.IDLE || appState === AppState.ANALYZING) return;
      
      const mat = ROOF_MATERIALS.find(m => m.id === selectedMaterial);
      const materialName = language === 'es' ? mat?.name_es || 'Techo' : mat?.name || 'Roof';
      const rawBase64 = originalImage.split(',')[1];
      
      setIsInsightLoading(true);
      // Cancel any current speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      try {
        const text = await getMaterialInsight(rawBase64, mimeType, analysis.style, materialName, language);
        setAiInsight(text);
        
        if (isAudioEnabled) {
          speakText(text);
        }
      } catch (e) {
        console.error("Failed to get insight", e);
      } finally {
        setIsInsightLoading(false);
      }
    };

    // Debounce slightly to avoid rapid clicks spamming API
    const timeoutId = setTimeout(fetchInsight, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedMaterial, analysis, originalImage, appState, mimeType, language]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Explicitly set language for the utterance
    utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
    
    // Voice selection strategy
    let preferredVoice;
    const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();

    if (language === 'es') {
       // Priority: Mexican Spanish (common in US), Spain Spanish, any Spanish
       preferredVoice = voices.find(v => (v.lang === 'es-MX' || v.lang === 'es-US') && v.name.includes('Google')) || 
                        voices.find(v => v.lang.includes('es') && v.name.includes('Google')) ||
                        voices.find(v => v.lang.includes('es'));
    } else {
       preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || 
                        voices.find(v => v.lang.includes('en'));
    }

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    if (!newState) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (aiInsight) {
      // If enabling and text exists, speak it
      speakText(aiInsight);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const handleGenerate = async () => {
    if (!originalImage || !mimeType) return;
    
    // Stop speaking when generation starts
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setAppState(AppState.GENERATING);
    setError(null);
    
    // We can use English names for prompt engineering as models often understand English attributes better for generation
    // but the displayed UI will be Spanish.
    const materialName = ROOF_MATERIALS.find(m => m.id === selectedMaterial)?.name || 'shingle';
    const colorName = ROOF_COLORS.find(c => c.id === selectedColor)?.name || 'dark';
    const style = analysis?.style || 'standard';

    try {
      const rawBase64 = originalImage.split(',')[1];
      const newImageBase64 = await generateNewRoof(
        rawBase64, 
        mimeType, 
        materialName, 
        colorName, 
        style
      );
      
      setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
      setAppState(AppState.COMPLETE);
    } catch (err) {
      console.error(err);
      setError(t.error);
      setAppState(AppState.READY_TO_EDIT);
    }
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setAppState(AppState.IDLE);
    setOriginalImage(null);
    setGeneratedImage(null);
    setAnalysis(null);
    setError(null);
    setAiInsight("");
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Tech Header */}
      <header className="h-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center rounded-sm relative border border-orange-400/50">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic flex items-center gap-1">
              Garciaroofing<span className="text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">AI</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 tracking-[0.3em] leading-none uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              {t.systemOnline}
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
           {/* Enhanced Mute Button */}
           <button 
             onClick={toggleAudio}
             className={`
                flex items-center gap-2 px-4 py-2 rounded font-bold text-xs tracking-wider transition-all shadow-lg border
                ${isAudioEnabled 
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white shadow-cyan-500/20' 
                  : 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/20'
                }
             `}
             title={isAudioEnabled ? "Mute Voice" : "Enable Voice"}
           >
             {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
             <span>{isAudioEnabled ? (language === 'es' ? 'VOZ ACTIVA' : 'VOICE ON') : (language === 'es' ? 'SILENCIO' : 'MUTED')}</span>
           </button>

           <button 
             onClick={toggleLanguage}
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-300 hover:text-white hover:border-orange-500 transition-all group"
           >
             <Globe className="w-3 h-3 group-hover:text-orange-500" />
             <span className={language === 'en' ? 'text-orange-500 font-bold' : ''}>EN</span>
             <span className="text-slate-600">|</span>
             <span className={language === 'es' ? 'text-orange-500 font-bold' : ''}>ES</span>
           </button>

           <div className="flex flex-col items-end text-xs font-mono text-slate-500">
             <span>{t.server}: <span className="text-emerald-500">US-EAST-1</span></span>
             <span>{t.latency}: <span className="text-emerald-500">12ms</span></span>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <button className="p-3 hover:bg-slate-800/80 rounded border border-transparent hover:border-slate-700 transition-all text-slate-400 hover:text-white">
             <Menu className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto p-8">
        
        {error && (
          <div className="mb-8 bg-red-950/20 border border-red-500/50 text-red-200 px-6 py-4 flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] backdrop-blur-md rounded-lg">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-500" />
            <p className="font-mono text-sm tracking-wide">{error}</p>
          </div>
        )}

        {appState === AppState.IDLE ? (
          <div className="max-w-5xl mx-auto mt-12 relative">
            {/* Background decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="text-center mb-16 relative z-10">
              <div className="inline-block mb-4 px-4 py-1 bg-slate-900/50 border border-orange-500/30 rounded-full">
                <span className="text-orange-500 text-xs font-mono tracking-[0.3em] uppercase glow-text">{t.nextGenArch}</span>
              </div>
              <h2 className="text-7xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
                {t.futureProof} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700 drop-shadow-lg">{t.yourShelter}</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            <div className="relative z-10">
              {/* Corner Accents for the container */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-slate-700/50 rounded-tl-3xl pointer-events-none"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b-2 border-r-2 border-slate-700/50 rounded-br-3xl pointer-events-none"></div>
              
              <div className="glass-panel p-1 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-2xl border border-slate-800/50">
                <ImageUploader onImageSelected={handleImageSelected} language={language} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-[calc(100vh-160px)] min-h-[800px]">
            
            {/* Left Control Deck */}
            <div className="xl:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Material Module */}
              <div className="glass-panel p-0 overflow-hidden rounded-lg border border-slate-800">
                <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                    <Box className="w-3 h-3" /> {t.materialSelect}
                  </h3>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3 bg-slate-950/30">
                  {ROOF_MATERIALS.map(material => {
                    const displayName = language === 'es' ? material.name_es : material.name;
                    // const displayDesc = language === 'es' ? material.description_es : material.description; 
                    return (
                      <button
                        key={material.id}
                        onClick={() => setSelectedMaterial(material.id)}
                        className={`
                          flex flex-col items-center justify-between text-center p-4 border transition-all duration-300 h-32 relative overflow-hidden group rounded-md
                          ${selectedMaterial === material.id 
                            ? 'bg-gradient-to-b from-orange-500/10 to-orange-900/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.15)]' 
                            : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-300'
                          }
                        `}
                      >
                        {selectedMaterial === material.id && (
                          <>
                            <div className="absolute top-0 right-0 w-4 h-4 bg-orange-500 clip-path-polygon"></div>
                            <div className="absolute inset-0 border border-orange-500/30 animate-pulse"></div>
                          </>
                        )}
                        <Zap className={`w-6 h-6 shrink-0 mb-3 transition-transform duration-300 ${selectedMaterial === material.id ? 'text-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'text-slate-700 group-hover:text-slate-400 group-hover:scale-105'}`} />
                        <span className="font-bold text-xs leading-tight uppercase font-mono tracking-wide">{displayName}</span>
                        <span className={`text-[9px] leading-tight mt-2 font-mono ${selectedMaterial === material.id ? 'text-orange-300' : 'text-slate-600'}`}>
                          ID: {material.id.split('-')[0].toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Module - COMPACT & SMALLER */}
              <div className="glass-panel p-0 overflow-hidden rounded-lg border border-slate-800">
                 <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800">
                  <h3 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{t.colorGrade}</h3>
                </div>
                <div className="p-3 bg-slate-950/30">
                  <div className="grid grid-cols-6 gap-2">
                    {ROOF_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`
                          group relative w-full aspect-square rounded-full border transition-all duration-300
                          ${selectedColor === color.id 
                            ? 'border-white ring-2 ring-orange-500/50 scale-110 shadow-[0_0_10px_rgba(249,115,22,0.4)]' 
                            : 'border-slate-700 hover:border-slate-500 hover:scale-105'
                          }
                        `}
                        style={{ backgroundColor: color.hex }}
                        title={language === 'es' ? color.name_es : color.name}
                      >
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase bg-slate-900/80 px-2 py-1 border border-slate-800 rounded">
                    <span>{ROOF_COLORS.find(c => c.id === selectedColor)?.hex}</span>
                    <span className="text-white font-bold truncate ml-2">{language === 'es' ? ROOF_COLORS.find(c => c.id === selectedColor)?.name_es : ROOF_COLORS.find(c => c.id === selectedColor)?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <Button 
                  onClick={handleGenerate}
                  isLoading={appState === AppState.GENERATING}
                  disabled={appState === AppState.ANALYZING}
                  className="w-full text-lg shadow-[0_0_30px_rgba(234,88,12,0.2)] py-5"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  {t.initiateRender}
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleReset}
                  disabled={appState === AppState.GENERATING}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.resetSystem}
                </Button>
              </div>

            </div>

            {/* Center Viewport */}
            <div className="xl:col-span-6 flex flex-col h-full relative">
              <div className="absolute inset-0 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                 <Visualizer 
                  originalImage={originalImage!}
                  generatedImage={generatedImage}
                  isGenerating={appState === AppState.GENERATING}
                  onReset={handleReset}
                  language={language}
                />
              </div>
            </div>

            {/* Right Data Deck */}
            <div className="xl:col-span-3 flex flex-col gap-6 h-full">
              
              {/* High Visibility AI Consultant Panel - NOW AT TOP */}
              <div className={`
                 glass-panel p-6 border-2 rounded-xl flex-shrink-0 flex flex-col transition-all duration-500 relative overflow-hidden min-h-[250px]
                 ${isSpeaking 
                   ? 'border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-slate-900/90' 
                   : 'border-slate-700 bg-slate-900/60 hover:border-cyan-500/50'
                 }
              `}>
                 
                 {/* Decorative background grid for audio panel */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                 </div>

                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3">
                       <div className={`p-2 rounded bg-cyan-950/50 border border-cyan-500/30 ${isSpeaking ? 'animate-pulse border-cyan-400' : ''}`}>
                         <Mic className={`w-5 h-5 ${isSpeaking ? 'text-white' : 'text-cyan-600'}`} /> 
                       </div>
                       {t.aiConsultant}
                    </h3>
                    <button 
                      onClick={toggleAudio}
                      className={`
                        p-3 rounded-md transition-all border
                        ${isAudioEnabled 
                          ? 'bg-cyan-950/30 text-cyan-400 border-cyan-500/30 hover:bg-cyan-900 hover:text-white hover:border-cyan-400' 
                          : 'bg-red-950/30 text-red-500 border-red-500/30 hover:bg-red-900 hover:text-red-300'
                        }
                      `}
                      title={isAudioEnabled ? "Mute Voice" : "Enable Voice"}
                    >
                      {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                 </div>
                 
                 <div className="relative flex-1 z-10">
                    {isInsightLoading ? (
                      <div className="flex flex-col gap-3 animate-pulse mt-4">
                        <div className="h-3 bg-cyan-900/40 w-full rounded"></div>
                        <div className="h-3 bg-cyan-900/40 w-3/4 rounded"></div>
                        <div className="h-3 bg-cyan-900/40 w-5/6 rounded"></div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-cyan-500">
                           <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                           {t.analyzing}
                        </div>
                      </div>
                    ) : aiInsight ? (
                      <div className="h-full flex flex-col">
                        <div className="font-mono text-sm md:text-base leading-relaxed text-cyan-50 relative bg-slate-950/60 p-6 rounded-lg border border-cyan-900/50 shadow-inner">
                           <div className="absolute -top-3 -left-2 text-5xl text-cyan-600/30 font-serif leading-none">"</div>
                           <p className="indent-1">{aiInsight}</p>
                           <div className="absolute -bottom-6 right-2 text-5xl text-cyan-600/30 font-serif leading-none rotate-180">"</div>
                        </div>
                         
                         {isSpeaking && (
                           <div className="mt-auto pt-6 flex items-end justify-center gap-1.5 h-16">
                             {[...Array(10)].map((_, i) => (
                               <div key={i} className="w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-t animate-music-bar shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ animationDelay: `${i * 0.08}s` }}></div>
                             ))}
                           </div>
                         )}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-mono italic opacity-70">
                        <div className="mb-4 p-4 rounded-full bg-slate-900/80 border border-slate-800">
                            <Box className="w-8 h-8 text-slate-600" />
                        </div>
                        {t.awaitingSelect}
                      </div>
                    )}
                 </div>

                 <div className="mt-6 pt-4 border-t border-slate-800/50 border-dashed relative z-10">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 tracking-wider">
                       <span>MAT_REF: {selectedMaterial}</span>
                       <span className={isSpeaking ? "text-cyan-400 animate-pulse font-bold" : "text-slate-600"}>{isSpeaking ? "AUDIO_STREAM: ON" : "AUDIO_STREAM: STANDBY"}</span>
                    </div>
                 </div>
              </div>

              <AnalysisPanel 
                analysis={analysis} 
                isLoading={appState === AppState.ANALYZING}
                language={language}
              />
              
            </div>

          </div>
        )}
      </main>
      
      <style>{`
        @keyframes music-bar {
          0% { height: 10%; opacity: 0.3; }
          50% { height: 80%; opacity: 1; }
          100% { height: 10%; opacity: 0.3; }
        }
        .animate-music-bar {
          animation: music-bar 0.8s ease-in-out infinite;
        }
        
        @keyframes scan-slow {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-slow {
          animation: scan-slow 4s linear infinite;
        }

        @keyframes scan-fast {
           0% { top: 0%; opacity: 0.8; }
           100% { top: 100%; opacity: 0.8; }
        }
        .animate-scan-fast {
           animation: scan-fast 1.5s linear infinite;
        }
        
        .clip-path-polygon {
           clip-path: polygon(100% 0, 0 0, 100% 100%);
        }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;