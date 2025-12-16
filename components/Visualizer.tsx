import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Download, Eye, Layers } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface VisualizerProps {
  originalImage: string; 
  generatedImage: string | null; 
  isGenerating: boolean;
  onReset: () => void;
  language: Language;
}

export const Visualizer: React.FC<VisualizerProps> = ({ 
  originalImage, 
  generatedImage, 
  isGenerating,
  onReset,
  language
}) => {
  // Default to original view so the user sees their upload immediately
  const [viewMode, setViewMode] = useState<'original' | 'generated'>('original');
  const [isRevealing, setIsRevealing] = useState(false);
  const [resolveProgress, setResolveProgress] = useState(0);
  const t = UI_TEXT[language];
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  // Auto-switch to generated view when a new image is produced
  useEffect(() => {
    if (generatedImage) {
      setViewMode('generated');
    }
  }, [generatedImage]);

  // Animation effect for "Unfocused to Focused" pixelation resolve
  useEffect(() => {
    // Only animate if we are viewing the generated image and it exists
    if (viewMode === 'generated' && generatedImage) {
      setIsRevealing(true);
      setResolveProgress(0);

      const img = new Image();
      img.src = generatedImage;
      img.crossOrigin = "anonymous";
      sourceImageRef.current = img;

      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Match canvas resolution to image resolution for 1:1 pixel control
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Animation config
        const duration = 2000; // 2 seconds
        let startTime: number | null = null;

        // Offscreen canvas for pixelation resizing
        const offscreen = document.createElement('canvas');
        const osCtx = offscreen.getContext('2d');

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const runtime = timestamp - startTime;
          const progress = Math.min(runtime / duration, 1);
          
          // Easing function for resolution: starts very slow (blocky), speeds up at end
          // cubic ease in for resolution
          const easeProgress = progress * progress * progress; 
          
          setResolveProgress(progress * 100);

          // Calculate "pixel" resolution factor (0.01 to 1.0)
          // Start at 2% resolution, end at 100%
          const resolutionFactor = 0.02 + (0.98 * easeProgress);

          if (ctx && osCtx && sourceImageRef.current) {
            const w = canvas.width;
            const h = canvas.height;
            
            // 1. Disable smoothing to get hard pixel edges
            ctx.imageSmoothingEnabled = false;
            osCtx.imageSmoothingEnabled = false;

            // 2. Draw image small to offscreen canvas
            const sw = Math.max(1, Math.floor(w * resolutionFactor));
            const sh = Math.max(1, Math.floor(h * resolutionFactor));
            
            offscreen.width = sw;
            offscreen.height = sh;
            osCtx.drawImage(sourceImageRef.current, 0, 0, sw, sh);

            // 3. Draw scaled up back to main canvas
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(offscreen, 0, 0, w, h);
          }

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setIsRevealing(false);
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      };
    } else {
      // Cleanup if switching away
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setIsRevealing(false);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [generatedImage, viewMode]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'roofai-project-render.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/20 border border-slate-800 relative">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-sm border border-slate-800">
          <button 
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'original' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Eye className="w-3 h-3" /> {t.original}
          </button>
          <button 
            onClick={() => setViewMode('generated')}
            disabled={!generatedImage}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'generated' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-500 hover:text-white disabled:opacity-30'}`}
          >
            <Layers className="w-3 h-3" /> {t.render}
          </button>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
            title={t.resetSystem}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {generatedImage && (
            <button 
              onClick={handleDownload}
              className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 border border-transparent hover:border-orange-500/30 transition-all"
              title={t.export}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[400px] group">
        
        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        {/* HUD Corners */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-500/30 z-10"></div>
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-500/30 z-10"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-500/30 z-10"></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-500/30 z-10"></div>

        {/* Loading / Generating State Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-orange-500 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-2 border-slate-800 rounded-full opacity-50"></div>
              <div className="absolute inset-4 border-r-2 border-cyan-500 rounded-full animate-spin reverse duration-1000"></div>
            </div>
            <div className="mt-8 font-mono text-orange-500 animate-pulse text-sm tracking-widest">{t.processing}</div>
            <div className="text-xs text-slate-500 mt-2 font-mono">{t.physics}</div>
          </div>
        )}

        {/* Image Display Area */}
        <div className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
            
            {/* 1. Original Image View */}
            {viewMode === 'original' && (
               <img 
                src={originalImage} 
                alt="Original Home" 
                className="max-w-full max-h-full object-contain relative z-0"
              />
            )}

            {/* 2. Generated Image View (Canvas or Final Img) */}
            {viewMode === 'generated' && generatedImage && (
              <>
                {/* 
                   Canvas for animation
                   We use 'display: none' instead of unmounting to keep logic simple, 
                   or just swap visibility.
                */}
                <canvas 
                  ref={canvasRef}
                  className={`max-w-full max-h-full object-contain absolute z-10 transition-all duration-100`}
                  style={{ 
                    visibility: isRevealing ? 'visible' : 'hidden',
                    // Apply CSS blur that reduces as we resolve
                    filter: `blur(${(100 - resolveProgress) * 0.1}px) contrast(${1 + (100 - resolveProgress) * 0.005})`
                  }}
                />

                {/* Final Image (Static) - shown when not revealing */}
                <img 
                  src={generatedImage} 
                  alt="Generated Design" 
                  className={`max-w-full max-h-full object-contain relative z-0 ${isRevealing ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Progress Indicator */}
                {isRevealing && (
                   <div className="absolute top-6 right-6 z-20">
                      <div className="bg-black/60 backdrop-blur-md border border-orange-500/30 px-3 py-1 rounded text-orange-500 font-mono text-xs tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                         <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                         {t.resolving}: {Math.floor(resolveProgress)}%
                      </div>
                   </div>
                )}
              </>
            )}
        </div>
        
        {/* Status Footer */}
        <div className="absolute bottom-4 left-6 z-20 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-orange-500 animate-ping' : isRevealing ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
              {isGenerating ? 'RENDERING...' : isRevealing ? 'ENHANCING RESOLUTION...' : viewMode === 'original' ? 'SOURCE INPUT' : 'HIGH DEF RENDER'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};