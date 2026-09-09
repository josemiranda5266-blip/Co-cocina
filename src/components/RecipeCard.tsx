import React from 'react';
import { Play, Clock, Flame, Heart, Eye, Award, ExternalLink, Youtube, Video, Globe } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe: (recipe: Recipe) => void;
  isFav: boolean;
  onToggleFav: (e: React.MouseEvent, id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelectRecipe,
  isFav,
  onToggleFav
}) => {
  const sourceIcon = () => {
    switch (recipe.video.source) {
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'vimeo':
        return <Video className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const difficultyColor = () => {
    switch (recipe.difficulty) {
      case 'Fácil':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Media':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Avanzada':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-stone-900 overflow-hidden cursor-pointer" onClick={() => onSelectRecipe(recipe)}>
        <img
          src={recipe.video.thumbnailUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Source Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-stone-800 shadow-sm border border-white/50">
          {sourceIcon()}
          <span className="capitalize">{recipe.video.source}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFav(e, recipe.id)}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isFav
              ? 'bg-rose-500 text-white'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title={isFav ? 'Quitar de favoritos' : 'Guardar receta'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 text-white text-[11px] font-medium backdrop-blur-xs">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{recipe.duration}</span>
        </div>

        {/* Quality Score Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-900/80 text-amber-300 text-[11px] font-bold backdrop-blur-xs border border-amber-400/30">
          <Award className="w-3 h-3 text-amber-400" />
          <span>QS {recipe.qualityScore}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Channel Author & Difficulty */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700 truncate max-w-[170px]">
              {recipe.video.author}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${difficultyColor()}`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectRecipe(recipe)}
            className="font-bold text-stone-900 text-base leading-snug line-clamp-2 hover:text-orange-600 transition-colors cursor-pointer mb-2.5"
          >
            {recipe.title}
          </h3>

          {/* Key Ingredients Pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {recipe.ingredients.slice(0, 4).map((ing, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] rounded-md font-medium border border-stone-200/60"
              >
                {ing.name}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="px-1.5 py-0.5 text-stone-400 text-[11px]">
                +{recipe.ingredients.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            {recipe.video.viewCount && (
              <span className="flex items-center gap-1" title="Visualizaciones externas">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                {recipe.video.viewCount >= 1000000
                  ? `${(recipe.video.viewCount / 1000000).toFixed(1)}M`
                  : recipe.video.viewCount >= 1000
                  ? `${Math.round(recipe.video.viewCount / 1000)}k`
                  : recipe.video.viewCount}
              </span>
            )}
            <span className="text-stone-400">• {recipe.cuisine}</span>
          </div>

          <button
            onClick={() => onSelectRecipe(recipe)}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>VER RECETA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
