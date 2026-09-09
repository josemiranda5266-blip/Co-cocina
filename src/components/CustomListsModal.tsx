import React, { useState, useEffect } from 'react';
import { X, Plus, Bookmark, Check } from 'lucide-react';
import { Recipe, CustomCollection } from '../types';
import { getCustomCollections, addCollection, toggleRecipeInCollection } from '../services/storageService';

interface CustomListsModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const CustomListsModal: React.FC<CustomListsModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const [collections, setCollections] = useState<CustomCollection[]>([]);
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setCollections(getCustomCollections());
  }, []);

  const handleToggleRecipe = (collectionId: string) => {
    const updated = toggleRecipeInCollection(collectionId, recipe.id);
    setCollections(updated);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const updated = addCollection(newListName.trim());
    setCollections(updated);
    setNewListName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-stone-200 text-stone-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-amber-600 mb-1">
          <Bookmark className="w-5 h-5 fill-current" />
          <h3 className="font-serif text-xl font-bold text-stone-900">Guardar en Lista</h3>
        </div>
        <p className="text-xs text-stone-500 mb-6 truncate">{recipe.title}</p>

        {/* Existing Lists */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {collections.map((col) => {
            const isInList = col.recipeIds.includes(recipe.id);
            return (
              <div
                key={col.id}
                onClick={() => handleToggleRecipe(col.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                  isInList
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm">{col.name}</h4>
                  {col.description && <p className="text-xs text-stone-500 line-clamp-1">{col.description}</p>}
                </div>

                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                  isInList
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white border-stone-300 text-transparent'
                }`}>
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New List Inline */}
        {isCreating ? (
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nombre de lista (ej: Recetas de verano)..."
              className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Crear Lista
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear nueva lista personalizada</span>
          </button>
        )}

      </div>
    </div>
  );
};
