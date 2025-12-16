import React, { useCallback, useState } from 'react';
import { Upload, ArrowDown, Cpu } from 'lucide-react';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface ImageUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  language: Language;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, language }) => {
  const [isDragging, setIsDragging] = useState(false);
  const t = UI_TEXT[language];

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const mimeType = result.split(';')[0].split(':')[1];
      const base64Data = result.split(',')[1];
      onImageSelected(base64Data, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        relative w-full h-[500px] rounded-xl flex flex-col items-center justify-center transition-all duration-500 overflow-hidden group
        ${isDragging 
          ? 'bg-orange-950/30 border-2 border-orange-500 shadow-[0_0_100px_rgba(249,115,22,0.3)]' 
          : 'bg-slate-900/40 border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-900/60'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 1. Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{ 
           backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)', 
           backgroundSize: '40px 40px',
           transform: isDragging ? 'scale(1.1)' : 'scale(1)',
           transition: 'transform 0.5s ease-out'
        }}>
      </div>
      
      {/* 2. Holographic Scan Line */}
      <div className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent z-10 shadow-[0_0_20px_#f97316] opacity-50 ${isDragging ? 'animate-scan-fast' : 'animate-scan-slow'}`}></div>

      {/* 3. Corner Brackets (HUD Style) */}
      <div className={`absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 transition-all duration-300 z-10 ${isDragging ? 'border-orange-500 translate-x-2 translate-y-2' : 'border-slate-600'}`}></div>
      <div className={`absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 transition-all duration-300 z-10 ${isDragging ? 'border-orange-500 -translate-x-2 translate-y-2' : 'border-slate-600'}`}></div>
      <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 transition-all duration-300 z-10 ${isDragging ? 'border-orange-500 translate-x-2 -translate-y-2' : 'border-slate-600'}`}></div>
      <div className={`absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 transition-all duration-300 z-10 ${isDragging ? 'border-orange-500 -translate-x-2 -translate-y-2' : 'border-slate-600'}`}></div>

      {/* 4. Central Visual */}
      <div className="relative z-20 flex flex-col items-center">
        <div className={`
           w-32 h-32 mb-8 rounded-full border-2 flex items-center justify-center relative
           ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-800/50'}
           transition-all duration-300
        `}>
           {/* Rotating ring */}
           <div className={`absolute inset-0 border-2 border-dashed rounded-full animate-spin-slow opacity-30 ${isDragging ? 'border-orange-400' : 'border-slate-500'}`}></div>
           
           {/* Icon */}
           {isDragging ? (
             <ArrowDown className="w-12 h-12 text-orange-500 animate-bounce" />
           ) : (
             <Upload className="w-12 h-12 text-slate-400 group-hover:text-orange-500 transition-colors" />
           )}
        </div>

        <h3 className={`text-3xl font-black tracking-tighter mb-2 uppercase ${isDragging ? 'text-orange-500' : 'text-white'}`}>
          {isDragging ? t.releaseUpload : t.initProject}
        </h3>
        
        <p className="text-slate-400 mb-10 text-center max-w-md font-mono text-sm leading-relaxed">
          <span className="text-orange-500 font-bold">{'>'}</span> {t.dragDrop}
          <br/>
          <span className="text-xs opacity-50">SUPPORTED PROTOCOLS: JPG, PNG // MAX SIZE: 25MB</span>
        </p>
        
        <div className="flex items-center gap-4">
          <label className="cursor-pointer group/btn relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            <span className={`
              relative bg-transparent border border-orange-500 text-orange-500 px-10 py-4 
              font-bold uppercase tracking-widest text-sm flex items-center gap-3
              group-hover/btn:text-white transition-colors
            `}>
              <Cpu className="w-4 h-4" />
              {t.accessDrive}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileInput}
            />
          </label>
        </div>
      </div>
      
      {/* 5. Status Footer inside box */}
      <div className="absolute bottom-6 flex items-center gap-3 text-[10px] font-mono tracking-[0.2em] uppercase opacity-60">
        <div className={`w-2 h-2 rounded-full ${isDragging ? 'bg-orange-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
        <span className={isDragging ? 'text-orange-400' : 'text-slate-500'}>
          {isDragging ? t.incomingStream : t.systemStandby}
        </span>
      </div>
    </div>
  );
};