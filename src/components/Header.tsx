import React from 'react';
import { Utensils, Search, Mic, ShieldAlert, Heart, Sparkles, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenVoiceSearch: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenVoiceSearch,
  isAdmin,
  onToggleAdmin,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-stone-900 tracking-tight leading-none block">
              Con<span className="text-orange-600">Cocina</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-700 block mt-0.5">
              Catálogo de Recetas
            </span>
          </div>
        </div>

        {/* Quick Header Search Bar (Desktop) */}
        {currentTab !== 'home' && (
          <form 
            onSubmit={onSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar milanesa, pizza, ingrediente..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-stone-100/80 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-orange-500 rounded-full outline-hidden transition-all text-stone-900 placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={onOpenVoiceSearch}
              className="absolute right-3 text-stone-400 hover:text-orange-600 p-1 rounded-full transition-colors"
              title="Buscar por voz"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-700">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-2 rounded-lg transition-colors ${currentTab === 'home' ? 'text-orange-600 bg-orange-50 font-semibold' : 'hover:bg-stone-100'}`}
          >
            Inicio
          </button>
          <button
            onClick={() => onSelectTab('search')}
            className={`px-3 py-2 rounded-lg transition-colors ${currentTab === 'search' ? 'text-orange-600 bg-orange-50 font-semibold' : 'hover:bg-stone-100'}`}
          >
            Buscador
          </button>
          <button
            onClick={() => onSelectTab('pantry')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${currentTab === 'pantry' ? 'text-orange-600 bg-orange-50 font-semibold' : 'hover:bg-stone-100'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            ¿Qué tenés en casa?
          </button>
          <button
            onClick={() => onSelectTab('categories')}
            className={`px-3 py-2 rounded-lg transition-colors ${currentTab === 'categories' ? 'text-orange-600 bg-orange-50 font-semibold' : 'hover:bg-stone-100'}`}
          >
            Categorías
          </button>
          <button
            onClick={() => onSelectTab('favorites')}
            className={`px-3 py-2 rounded-lg transition-colors ${currentTab === 'favorites' ? 'text-orange-600 bg-orange-50 font-semibold' : 'hover:bg-stone-100'}`}
          >
            Favoritos
          </button>
        </nav>

        {/* Actions & Admin Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
              isAdmin
                ? 'bg-stone-900 text-amber-400 border-stone-800 shadow-xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="Cambiar vista de administrador"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Modo Admin' : 'Admin'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
