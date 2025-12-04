

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Search, Loader2, CheckCircle, Save, Terminal, ExternalLink, ImageOff, X, Plus } from 'lucide-react';
import { Product } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface AIImporterViewProps {
  onAddProduct: (product: any) => Promise<void>;
}

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
}

export const AIImporterView: React.FC<AIImporterViewProps> = ({ onAddProduct }) => {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Partial<Product> | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [imageError, setImageError] = useState(false); 
  const [newImageUrl, setNewImageUrl] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [...prev, { id: Date.now(), message, type, timestamp: Date.now() }]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setFoundProduct(null);
    setImageError(false);
    setNewImageUrl('');
    setLogs([]); 
    addLog(`Initializing Agent...`, 'info');
    addLog(`Connecting to Gemini 2.5 Flash...`, 'info');
    addLog(`Searching global catalog for: "${query}"`, 'info');

    try {
      // High-Precision Prompt Engineering
      const prompt = `
        You are an elite E-commerce Merchandising Bot.
        Your goal is to find the *exact* product "${query}" online and extract high-fidelity data for a store import.

        INSTRUCTIONS:
        1.  **Search & Identify**: Locate the specific product page.
        2.  **Extract Image (CRITICAL)**: 
            -   Find a **PUBLIC, ACCESSIBLE** direct URL to the main product image.
            -   Avoid "protected" URLs that expire or block hotlinking (like some dynamic Amazon links).
            -   Prefer static CDNs or Open Graph images.
            -   It MUST end in .jpg, .png, or .webp if possible.
        3.  **Write Copy**: 
            -   Write a "Benefit-Driven" description. Don't just list specs; explain *why* it's good.
            -   Include 3 key bullet points in the description text.
        4.  **Extract Data**: Get price, accurate title, and technical specs.

        OUTPUT FORMAT (Strict JSON Only):
        {
          "title": "Exact Product Title",
          "description": "Compelling marketing description with key benefits...",
          "price": 99.99,
          "originalPrice": 129.99,
          "category": "Best Fit Category (e.g., Electronics, Home, Fashion)",
          "imageUrl": "https://example.com/image.jpg",
          "sourceUrl": "https://amazon.com/dp/......",
          "brand": "Brand Name",
          "color": "Primary Color",
          "rating": 4.5,
          "stock": 50
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      addLog(`Search complete. Parsing data structure...`, 'info');
      
      let text = response.text || '';
      
      // 1. Clean Code Blocks
      const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
          text = codeBlockMatch[1];
      } else {
          // 2. Fallback: Extract strictly between braces
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
              text = text.substring(firstBrace, lastBrace + 1);
          }
      }

      text = text.trim();

      try {
        const data = JSON.parse(text);
        
        if (!data.title || typeof data.price !== 'number') {
            throw new Error("Incomplete data received from agent.");
        }

        // Image Validation Logic
        let finalImageUrl = data.imageUrl;
        
        // Simple check if it looks like a URL
        const isValidUrl = (url: string) => {
            try {
                new URL(url);
                return url.length > 10;
            } catch {
                return false;
            }
        };

        if (!isValidUrl(finalImageUrl)) {
            addLog(`Warning: Agent could not find a valid image URL. Using placeholder.`, 'info');
            finalImageUrl = `https://placehold.co/600x600/png?text=${encodeURIComponent(data.title.substring(0,15))}`;
        } else {
            addLog(`Image URL found. Verifying accessibility...`, 'success');
        }

        const productData: Partial<Product> = {
            ...data,
            id: `AI-${Date.now()}`,
            imageUrl: finalImageUrl,
            hidden: false,
            isProSeller: true,
            condition: 'new',
            deliveryType: 'standard',
            images: [finalImageUrl],
            rating: data.rating || 0,
            stock: data.stock || 50,
            brand: data.brand || 'Generic',
            color: data.color || 'Multi',
            category: data.category || 'General'
        };

        setFoundProduct(productData);
        addLog(`Success! Product ready for review.`, 'success');
        
      } catch (parseError) {
        console.error(parseError);
        addLog(`Data formatting error. The agent found text but failed to structure it as JSON.`, 'error');
        throw new Error("Agent returned invalid JSON.");
      }

    } catch (error) {
      console.error(error);
      addLog(`Agent Error: ${error instanceof Error ? error.message : 'Connection failed'}`, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async () => {
    if (!foundProduct) return;
    try {
        await onAddProduct(foundProduct);
        addLog(`Product imported successfully!`, 'success');
        setFoundProduct(null);
        setQuery('');
        setNewImageUrl('');
    } catch (e) {
        addLog(`Database save failed.`, 'error');
    }
  };

  const handleImageError = () => {
    setImageError(true);
    addLog("The AI-sourced image URL was blocked or invalid. Try adding a manual URL below.", "error");
  };

  const handleAddImage = () => {
    if (!newImageUrl || !foundProduct) return;
    const updatedImages = [...(foundProduct.images || []), newImageUrl];
    setFoundProduct({
        ...foundProduct,
        images: updatedImages,
        // If it was the first image added and no main image existed (edge case), set main
        imageUrl: foundProduct.imageUrl || newImageUrl
    });
    setNewImageUrl('');
    setImageError(false);
  };

  const handleRemoveImage = (index: number) => {
    if (!foundProduct || !foundProduct.images) return;
    const images = [...foundProduct.images];
    const removedUrl = images[index];
    images.splice(index, 1);
    
    // If we removed the main image, update main image to next available or empty
    let newMainUrl = foundProduct.imageUrl;
    if (removedUrl === foundProduct.imageUrl) {
        newMainUrl = images.length > 0 ? images[0] : '';
    }

    setFoundProduct({
        ...foundProduct,
        images: images,
        imageUrl: newMainUrl
    });
  };

  const handleSetMainImage = (url: string) => {
    if (!foundProduct) return;
    setFoundProduct({
        ...foundProduct,
        imageUrl: url
    });
    setImageError(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-fox-500 to-fox-700 rounded-lg shadow-lg">
           <Bot className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('ai.title')}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('ai.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left: Controls & Logs */}
        <div className="space-y-6">
            
            {/* Search Box */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <form onSubmit={handleSearch}>
                    <label htmlFor="query" className="block text-sm font-bold text-slate-900 mb-2">
                        {t('ai.input_label')}
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                id="query"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-fox-500 focus:border-fox-500 transition duration-150 font-medium"
                                placeholder={t('ai.placeholder')}
                                disabled={isSearching}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !query}
                            className="px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md"
                        >
                            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            {isSearching ? t('ai.scanning') : t('ai.find')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Terminal / Logs */}
            <div className="bg-slate-950 rounded-xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col h-80">
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-mono text-slate-300 font-bold">{t('ai.terminal')}</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/40 border border-green-500/50"></div>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1">
                    {logs.length === 0 && (
                        <div className="text-slate-600 italic opacity-50">{t('ai.waiting')}</div>
                    )}
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
                            <span className="text-slate-600 shrink-0 select-none">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })} >
                            </span>
                            <span className={`
                                ${log.type === 'info' ? 'text-slate-300' : ''}
                                ${log.type === 'success' ? 'text-green-400 font-bold' : ''}
                                ${log.type === 'error' ? 'text-red-400' : ''}
                            `}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>

        {/* Right: Preview & Action */}
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-fox-600" />
                {t('ai.preview')}
            </h3>
            
            {foundProduct ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-full md:max-h-[500px]">
                    
                    {/* Left: Image Preview & Gallery Manager - UNIFIED BG & REMOVED BORDER */}
                    <div className="w-full md:w-1/2 bg-white relative flex flex-col p-6 group">
                        
                        {/* Main Preview */}
                        <div className="aspect-square bg-white rounded-lg border border-slate-200 mb-4 relative overflow-hidden flex items-center justify-center">
                            {imageError || !foundProduct.imageUrl ? (
                                 <div className="text-center p-6">
                                    <ImageOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">{t('ai.no_image')}</p>
                                 </div>
                            ) : (
                                <img 
                                    src={foundProduct.imageUrl} 
                                    className="max-w-full max-h-full object-contain p-2" 
                                    alt="Preview" 
                                    onError={handleImageError} 
                                />
                            )}
                             {foundProduct.sourceUrl && (
                                <a 
                                    href={foundProduct.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 text-slate-600 hover:text-fox-600 border border-slate-200"
                                >
                                    <ExternalLink className="w-3 h-3" /> {t('ai.source')}
                                </a>
                            )}
                        </div>

                        {/* Thumbnails List */}
                        <div className="grid grid-cols-4 gap-2 mb-4 overflow-y-auto max-h-32">
                            {foundProduct.images?.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className={`relative aspect-square bg-white rounded border cursor-pointer overflow-hidden group/thumb ${foundProduct.imageUrl === img ? 'ring-2 ring-fox-500 border-transparent' : 'border-slate-200 hover:border-slate-300'}`} 
                                    onClick={() => handleSetMainImage(img)}
                                >
                                    <img src={img} className="w-full h-full object-contain p-1" alt={`thumb-${idx}`} onError={(e) => e.currentTarget.style.display = 'none'} />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                        className="absolute top-0.5 right-0.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full p-0.5 shadow-sm border border-slate-200 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Image Input - Removed Top Border for cleaner look */}
                        <div className="flex gap-2 mt-auto pt-4">
                            <input 
                                type="text" 
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder={t('ai.paste_url')} 
                                className="flex-1 text-xs border border-slate-300 rounded px-2 py-2 focus:ring-1 focus:ring-fox-500 outline-none"
                            />
                            <button 
                                onClick={handleAddImage}
                                disabled={!newImageUrl}
                                className="px-3 py-2 bg-fox-600 text-white rounded hover:bg-fox-700 text-xs font-bold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-3 h-3 mr-1" /> {t('ai.add_image')}
                            </button>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="w-full md:w-1/2 flex flex-col p-6 bg-white">
                         <div className="flex-1 overflow-y-auto pr-2">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-fox-100 text-fox-700 text-xs font-bold px-2 py-1 rounded uppercase">
                                    {foundProduct.category}
                                </span>
                                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase">
                                    {foundProduct.brand}
                                </span>
                            </div>

                            <h2 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                                {foundProduct.title}
                            </h2>
                            
                            <div className="text-2xl font-extrabold text-slate-900 mb-4">
                                ${foundProduct.price?.toFixed(2)}
                                {foundProduct.originalPrice && (
                                    <span className="ml-2 text-sm text-slate-400 line-through font-normal">
                                        ${foundProduct.originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <div className="prose prose-sm text-slate-600 mb-4">
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{t('ai.ai_desc')}</p>
                                <p className="text-sm leading-relaxed">{foundProduct.description}</p>
                            </div>

                            {/* Removed border-t from here */}
                            <div className="grid grid-cols-2 gap-4 text-sm pt-4">
                                <div>
                                    <span className="text-slate-400 text-xs">{t('ai.rating')}</span>
                                    <p className="font-medium">{foundProduct.rating} / 5.0</p>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs">{t('ai.stock_est')}</span>
                                    <p className="font-medium">{foundProduct.stock} units</p>
                                </div>
                            </div>
                         </div>

                         {/* Removed border-t from here */}
                         <div className="mt-6 pt-4 flex gap-3">
                            <button 
                                onClick={() => setFoundProduct(null)}
                                className="flex-1 py-3 px-4 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
                            >
                                {t('ai.discard')}
                            </button>
                            <button 
                                onClick={handleImport}
                                className="flex-[2] py-3 px-4 bg-fox-600 text-white rounded-lg font-bold shadow-lg shadow-fox-200 hover:bg-fox-500 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Save className="w-4 h-4" />
                                {t('ai.import')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                    {isSearching ? (
                         <div className="flex flex-col items-center animate-pulse">
                            <div className="relative">
                                <Search className="w-16 h-16 text-fox-200 mb-6" />
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                                    <Loader2 className="w-6 h-6 text-fox-600 animate-spin" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">{t('ai.analyzing')}</h3>
                            <p className="text-slate-500 text-sm max-w-xs mt-2">
                                {t('ai.analyzing_sub')}
                            </p>
                         </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-6">
                                <Bot className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-slate-900 font-bold text-lg mb-2">{t('ai.idle_title')}</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                                {t('ai.idle_msg')}
                            </p>
                            
                            <div className="mt-8 flex flex-wrap justify-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {t('ai.badge.auto_image')}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {t('ai.badge.copy')}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {t('ai.badge.specs')}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};