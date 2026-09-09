import React from 'react';
import { Search, Mic, Sparkles, ChefHat } from 'lucide-react';

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onOpenVoiceSearch: () => void;
  onQuickCategoryClick: (cat: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenVoiceSearch,
  onQuickCategoryClick
}) => {
  const quickExamples = [
    'Milanesa',
    'Pizza',
    'Empanadas',
    'Pollo al horno',
    'Asado',
    'Ñoquis',
    'Pastas',
    'Torta de chocolate',
    'Pan casero',
    'Arroz con pollo'
  ];

  const trendBadges = [
    { label: '🔥 Tendencias', category: 'Carnes' },
    { label: '⚡ Recetas rápidas', filter: 'quick' },
    { label: '🍗 Con pollo', category: 'Pollo' },
    { label: '🥩 Carnes', category: 'Carnes' },
    { label: '🍝 Pastas', category: 'Pastas' },
    { label: '🍰 Repostería', category: 'Tortas' },
    { label: '🇦🇷 Cocina argentina', cuisine: 'Argentina' },
    { label: '🥗 Saludables', filter: 'healthy' },
    { label: '💰 Económicas', filter: 'budget' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-stone-50 py-10 sm:py-14 border-b border-orange-100/60">
      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-4 shadow-2xs">
          <ChefHat className="w-4 h-4 text-orange-600" />
          <span>El buscador gastronómico en video</span>
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight mb-3">
          ¿Qué querés cocinar hoy?
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto mb-8 leading-relaxed">
          Escribe una comida, ingredientes que tengas en casa, dificultad o tipo de cocina y encuentra al instante los mejores videos paso a paso.
        </p>

        {/* Big Search Input */}
        <form onSubmit={onSearchSubmit} className="relative max-w-2xl mx-auto mb-5 group">
          <div className="relative flex items-center bg-white rounded-2xl shadow-md border-2 border-orange-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 transition-all">
            <Search className="w-5 h-5 text-stone-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Ej: "pollo al horno con papas", "pizza sin máquina", "algo dulce"...'
              className="w-full py-4 px-3 text-stone-900 placeholder:text-stone-400 bg-transparent text-base sm:text-lg focus:outline-hidden"
            />
            
            <button
              type="button"
              onClick={onOpenVoiceSearch}
              className="p-2 mr-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
              title="Búsqueda por voz"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 sm:px-7 py-3 mr-1.5 rounded-xl text-sm sm:text-base shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Examples Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-8 text-xs text-stone-500">
          <span className="font-medium text-stone-700 mr-1">Sugerencias:</span>
          {quickExamples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                onSearchChange(ex);
              }}
              className="px-2.5 py-1 bg-white hover:bg-orange-100 hover:text-orange-900 border border-stone-200 rounded-full text-stone-700 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Categories / Trend Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-stone-200/60">
          {trendBadges.map((badge, idx) => (
            <button
              key={idx}
              onClick={() => onQuickCategoryClick(badge.category || badge.filter || badge.cuisine || '')}
              className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-orange-500 hover:text-white border border-stone-200/80 text-stone-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5"
            >
              {badge.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
