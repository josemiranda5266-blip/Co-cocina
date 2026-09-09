import React, { useState } from 'react';
import { Sparkles, Plus, X, Search, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { PantryMatchResult, Recipe } from '../types';
import { performPantrySearch } from '../services/api';
import { RecipeCard } from './RecipeCard';

interface PantrySearchProps {
  onSelectRecipe: (recipe: Recipe) => void;
  favorites: string[];
  onToggleFav: (e: React.MouseEvent, id: string) => void;
}

export const PantrySearch: React.FC<PantrySearchProps> = ({
  onSelectRecipe,
  favorites,
  onToggleFav
}) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientsList, setIngredientsList] = useState<string[]>([
    'pollo',
    'papa',
    'cebolla',
    'huevo'
  ]);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PantryMatchResult[] | null>(null);

  const handleAddIngredient = () => {
    if (!ingredientInput.trim()) return;
    const clean = ingredientInput.trim().toLowerCase();
    if (!ingredientsList.includes(clean)) {
      setIngredientsList([...ingredientsList, clean]);
    }
    setIngredientInput('');
  };

  const handleRemoveIngredient = (item: string) => {
    setIngredientsList(ingredientsList.filter(i => i !== item));
  };

  const handleRunPantrySearch = async () => {
    if (ingredientsList.length === 0) return;
    setIsSearching(true);
    try {
      const data = await performPantrySearch(ingredientsList);
      setResults(data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100/60 rounded-3xl p-6 sm:p-10 border border-amber-200/80 mb-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Búsqueda por Ingredientes</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
            ¿Qué tenés en casa?
          </h1>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Ingresa los ingredientes que tenés en tu heladera o alacena. Nuestra Inteligencia Artificial encontrará qué recetas podés cocinar hoy sin salir a comprar.
          </p>
        </div>

        {/* Ingredient Input Area */}
        <div className="mt-6 bg-white p-4 sm:p-6 rounded-2xl border border-amber-200/80 shadow-md">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                placeholder="Escribí un ingrediente (ej: carne, tomate, queso)..."
                className="w-full py-3 px-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>
            <button
              onClick={handleAddIngredient}
              className="px-5 py-3 bg-stone-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Added Ingredients Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ingredientsList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-100 text-orange-900 font-semibold text-xs border border-orange-200"
              >
                <span>{item}</span>
                <button
                  onClick={() => handleRemoveIngredient(item)}
                  className="p-0.5 hover:bg-orange-200 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {ingredientsList.length === 0 && (
              <span className="text-xs text-stone-400 italic">No agregaste ingredientes aún...</span>
            )}
          </div>

          <button
            onClick={handleRunPantrySearch}
            disabled={ingredientsList.length === 0 || isSearching}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Buscando recetas compatibles...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar Recetas compatibles</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Recetas que podés hacer con lo que tenés ({results.length})
            </h2>
          </div>

          {/* Grouped Results */}
          {['GREEN', 'YELLOW', 'RED'].map((level) => {
            const levelResults = results.filter(r => r.matchLevel === level);
            if (levelResults.length === 0) return null;

            const headerConfig = {
              GREEN: {
                title: '🟢 Tenés todos los ingredientes principales',
                bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                badge: 'Coincidencia Alta'
              },
              YELLOW: {
                title: '🟡 Te faltan pocos ingredientes',
                bg: 'bg-amber-50 border-amber-200 text-amber-900',
                badge: 'Coincidencia Media'
              },
              RED: {
                title: '🔴 Te faltan varios ingredientes',
                bg: 'bg-rose-50 border-rose-200 text-rose-900',
                badge: 'Coincidencia Parcial'
              }
            }[level as keyof typeof headerConfig];

            return (
              <div key={level} className="space-y-4">
                <div className={`p-4 rounded-2xl border ${headerConfig.bg} flex items-center justify-between`}>
                  <h3 className="font-bold text-base">{headerConfig.title}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-current shadow-2xs">
                    {levelResults.length} recetas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levelResults.map((res) => (
                    <div key={res.recipe.id} className="relative flex flex-col">
                      <RecipeCard
                        recipe={res.recipe}
                        onSelectRecipe={onSelectRecipe}
                        isFav={favorites.includes(res.recipe.id)}
                        onToggleFav={onToggleFav}
                      />
                      
                      {/* Ingredient Match Breakdown Box */}
                      <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700">
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span>Coincidencia de despensa</span>
                          <span className="text-orange-600">{res.matchPercentage}%</span>
                        </div>

                        {res.matchedIngredients.length > 0 && (
                          <div className="text-[11px] text-emerald-700 mb-1">
                            ✓ Tenés: {res.matchedIngredients.join(', ')}
                          </div>
                        )}

                        {res.missingIngredients.length > 0 && (
                          <div className="text-[11px] text-stone-500">
                            ✕ Faltan: {res.missingIngredients.slice(0, 3).join(', ')}
                            {res.missingIngredients.length > 3 && ` (+${res.missingIngredients.length - 3})`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
