import React from 'react';
import { Home, Search, Sparkles, Grid, Heart, ShieldAlert } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isAdmin: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isAdmin
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'home' ? 'text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Inicio</span>
        </button>

        <button
          onClick={() => onSelectTab('search')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'search' ? 'text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Buscar</span>
        </button>

        <button
          onClick={() => onSelectTab('pantry')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'pantry' ? 'text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] mt-0.5">Despensa</span>
        </button>

        <button
          onClick={() => onSelectTab('categories')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'categories' ? 'text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categorías</span>
        </button>

        <button
          onClick={() => onSelectTab('favorites')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
            currentTab === 'favorites' ? 'text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Favoritos</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              currentTab === 'admin' ? 'text-amber-600 font-semibold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
