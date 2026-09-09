import React, { useEffect } from 'react';
import { X, Play, Heart, Share2, ExternalLink, Flag, Plus, CheckCircle, Info, Clock, ChefHat, Award, Globe, ShieldCheck, Sparkles, Youtube, Bookmark } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onOpenShare: (recipe: Recipe) => void;
  onOpenReport: (recipe: Recipe) => void;
  onOpenLists: (recipe: Recipe) => void;
  similarRecipes: Recipe[];
  onSelectRecipe: (r: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  isFav,
  onToggleFav,
  onOpenShare,
  onOpenReport,
  onOpenLists,
  similarRecipes,
  onSelectRecipe
}) => {
  if (!recipe) return null;

  // Auto inject Schema.org JSON-LD structured data for SEO
  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.title,
      "image": [recipe.video.thumbnailUrl],
      "author": {
        "@type": "Person",
        "name": recipe.video.author
      },
      "datePublished": recipe.createdAt,
      "description": recipe.description,
      "prepTime": `PT${recipe.prepTimeMinutes || 30}M`,
      "recipeYield": `${recipe.servings || 4} porciones`,
      "recipeCategory": recipe.categories.join(', '),
      "recipeCuisine": recipe.cuisine,
      "recipeIngredient": recipe.ingredients.map(i => `${i.name} (${i.amount || 'c/n'})`),
      "video": {
        "@type": "VideoObject",
        "name": recipe.title,
        "description": recipe.description,
        "thumbnailUrl": [recipe.video.thumbnailUrl],
        "uploadDate": recipe.video.publishedAt || recipe.createdAt,
        "contentUrl": recipe.video.originalUrl,
        "embedUrl": recipe.video.embedUrl
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'recipe-schema-jsonld';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('recipe-schema-jsonld');
      if (el) el.remove();
    };
  }, [recipe]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex justify-center overflow-y-auto p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl my-auto rounded-3xl shadow-2xl overflow-hidden border border-stone-200/80 relative text-stone-900">
        
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wider">
              {recipe.categories[0] || 'Receta'}
            </span>
            <span className="text-xs text-stone-500 font-medium hidden sm:inline">
              Publicado por <strong className="text-stone-800">{recipe.video.author}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFav(recipe.id)}
              className={`p-2 rounded-full border transition-colors ${
                isFav
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
              title="Guardar en favoritos"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => onOpenShare(recipe)}
              className="p-2 rounded-full bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100 transition-colors"
              title="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors ml-2"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="bg-black aspect-video w-full relative">
          {recipe.video.source === 'youtube' ? (
            <iframe
              src={recipe.video.embedUrl}
              title={recipe.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-stone-900">
              <img
                src={recipe.video.thumbnailUrl}
                alt={recipe.title}
                className="w-full h-full object-cover opacity-70"
              />
              <a
                href={recipe.video.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute px-6 py-3 rounded-full bg-orange-600 text-white font-bold flex items-center gap-2 shadow-xl hover:bg-orange-700 transition-transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Ver video en {recipe.video.source}</span>
              </a>
            </div>
          )}
        </div>

        {/* Video attribution notice (Legal compliance) */}
        <div className="bg-amber-50/90 px-4 py-2 text-xs text-amber-900 border-b border-amber-200/60 flex items-center justify-between">
          <span>
            📌 Video alojado originalmente por <strong>{recipe.video.author}</strong> en <strong>{recipe.video.source.toUpperCase()}</strong>.
          </span>
          <a
            href={recipe.video.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-orange-700 shrink-0 ml-2 flex items-center gap-1"
          >
            <span>Ver original</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-8">
          
          {/* Title & Actions Bar */}
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug mb-3">
              {recipe.title}
            </h1>

            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              {recipe.description}
            </p>

            {/* Quick Specs Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-700 py-3 px-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>{recipe.duration}</span>
              </div>

              <span className="text-stone-300">•</span>

              <div className="flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>Dificultad: {recipe.difficulty}</span>
              </div>

              <span className="text-stone-300">•</span>

              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Cocina: {recipe.cuisine}</span>
              </div>

              <span className="text-stone-300">•</span>

              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Quality Score: {recipe.qualityScore}/100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2.5 mb-8 pb-6 border-b border-stone-200">
            <a
              href={recipe.video.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver video en {recipe.video.source}</span>
            </a>

            <button
              onClick={() => onToggleFav(recipe.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-colors ${
                isFav
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-rose-600' : ''}`} />
              <span>{isFav ? 'Guardada en Favoritos' : 'Agregar a Favoritos'}</span>
            </button>

            <button
              onClick={() => onOpenLists(recipe)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span>Guardar en Lista</span>
            </button>

            <button
              onClick={() => onOpenReport(recipe)}
              className="px-3 py-2.5 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Reportar</span>
            </button>
          </div>

          {/* Ingredients Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                <span>Ingredientes Requeridos</span>
                <span className="text-xs font-normal text-stone-500">
                  ({recipe.ingredients.length} detectados)
                </span>
              </h2>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Confirmado
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Inferido por IA
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="font-semibold text-stone-800 text-sm">{ing.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {ing.amount && (
                      <span className="text-xs text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                        {ing.amount}
                      </span>
                    )}
                    {ing.isConfirmed ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Confirmado por la fuente original">
                        Confirmado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Inferido automáticamente por Gemini IA">
                        IA
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="mb-8 pt-6 border-t border-stone-200">
            <h3 className="font-bold text-sm text-stone-800 mb-2">Categorías y Etiquetas</h3>
            <div className="flex flex-wrap gap-1.5">
              {recipe.categories.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-900 font-semibold text-xs rounded-lg">
                  {cat}
                </span>
              ))}
              {recipe.tags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs rounded-lg border border-stone-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Similar Recipes Section */}
          {similarRecipes.length > 0 && (
            <div className="pt-6 border-t border-stone-200">
              <h3 className="font-bold text-base text-stone-900 mb-4">Recetas Similares Recomendadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {similarRecipes.slice(0, 3).map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectRecipe(sim)}
                    className="p-3 rounded-2xl bg-stone-50 hover:bg-orange-50 border border-stone-200 cursor-pointer transition-colors group flex items-center gap-3"
                  >
                    <img
                      src={sim.video.thumbnailUrl}
                      alt={sim.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 group-hover:text-orange-600 line-clamp-2">
                        {sim.title}
                      </h4>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        ⏱ {sim.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
