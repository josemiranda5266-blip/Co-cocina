import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, CheckCircle, Award, ExternalLink, Link, Layers, ShieldCheck, Play } from 'lucide-react';
import { Recipe } from '../types';
import { importRecipeUrl } from '../services/api';

interface AdminImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeImported: (recipe: Recipe) => void;
}

export const AdminImportModal: React.FC<AdminImportModalProps> = ({
  isOpen,
  onClose,
  onRecipeImported
}) => {
  if (!isOpen) return null;

  const [url, setUrl] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewResult, setPreviewResult] = useState<{ recipe: Recipe; duplicateCheck: any; qualityFactors: any } | null>(null);

  const handleRunCollector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setErrorMsg('');
    setPreviewResult(null);

    // Simulate interactive pipeline progress display
    setLoadingStep('FUENTES: Conectando con la plataforma origen...');
    await new Promise(r => setTimeout(r, 400));
    setLoadingStep('NORMALIZADOR: Extrayendo identificadores y metadatos...');
    await new Promise(r => setTimeout(r, 400));
    setLoadingStep('CLASIFICADOR IA: Ejecutando modelo Gemini 3.8 Flash...');

    try {
      const data = await importRecipeUrl(url.trim(), autoApprove);
      setPreviewResult(data);
      onRecipeImported(data.recipe);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar URL con ConCocina Collector.');
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-stone-200 text-stone-900 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
              ConCocina Collector
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Sistema automático de importación y análisis taxonómico de videos públicos
            </p>
          </div>
        </div>

        {/* Pipeline Architecture Graphic */}
        <div className="my-5 p-3 bg-stone-900 text-amber-300 rounded-2xl text-[11px] font-mono flex items-center justify-around flex-wrap gap-2 border border-stone-800 shadow-inner">
          <span className="text-white">FUENTES</span>
          <span className="text-stone-500">→</span>
          <span className="text-orange-400 font-bold">COLLECTOR</span>
          <span className="text-stone-500">→</span>
          <span className="text-sky-300">NORMALIZADOR</span>
          <span className="text-stone-500">→</span>
          <span className="text-emerald-400 font-bold">CLASIFICADOR IA</span>
          <span className="text-stone-500">→</span>
          <span className="text-amber-400">DUPLICATE CHECK</span>
          <span className="text-stone-500">→</span>
          <span className="text-white">CATÁLOGO</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleRunCollector} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Pega la URL del video público (YouTube, Vimeo, RSS, sitio web):
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="font-semibold">¿Aprobar automáticamente si Quality Score es alto?</span>
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded-md focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={Boolean(loadingStep)}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
          >
            {loadingStep ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ejecutar ConCocina Collector</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs mb-6 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Result Preview */}
        {previewResult && (
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/90 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                previewResult.recipe.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                Estado: {previewResult.recipe.status === 'ACTIVE' ? 'Aprobado & En Catálogo' : 'Pendiente de Revisión'}
              </span>

              <div className="flex items-center gap-1 font-bold text-xs text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                <Award className="w-3.5 h-3.5" />
                <span>Quality Score: {previewResult.recipe.qualityScore}/100</span>
              </div>
            </div>

            <div className="flex gap-4">
              <img
                src={previewResult.recipe.video.thumbnailUrl}
                alt={previewResult.recipe.title}
                className="w-28 h-20 rounded-xl object-cover border border-stone-300 shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm text-stone-900 line-clamp-2">
                  {previewResult.recipe.title}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Autor: {previewResult.recipe.video.author} • Fuente: {previewResult.recipe.video.source}
                </p>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                  {previewResult.recipe.description}
                </p>
              </div>
            </div>

            {/* AI Extracted Taxonomies */}
            <div className="pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold text-stone-700 block">Categorías IA:</span>
                <span className="text-stone-600">{previewResult.recipe.categories.join(', ')}</span>
              </div>
              <div>
                <span className="font-bold text-stone-700 block">Ingredientes Detectados:</span>
                <span className="text-stone-600 truncate block">
                  {previewResult.recipe.ingredients.map(i => i.name).join(', ')}
                </span>
              </div>
            </div>

            {previewResult.duplicateCheck.isPossibleDuplicate && (
              <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Posible duplicado detectado ({Math.round(previewResult.duplicateCheck.similarityScore * 100)}%): {previewResult.duplicateCheck.reason}
                </span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl"
              >
                Cerrar y Ver en Catálogo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
