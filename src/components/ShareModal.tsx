import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Facebook, Share2 } from 'lucide-react';
import { Recipe } from '../types';

interface ShareModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/receta/${recipe.slug}`;
  const shareTitle = `Mirá esta receta de ${recipe.title} en ConCocina`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle}: ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: shareUrl
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl border border-stone-200 text-stone-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-xl font-bold mb-1">Compartir Receta</h3>
        <p className="text-xs text-stone-500 mb-6 truncate">{recipe.title}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={handleWhatsApp}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors border border-emerald-200"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-[11px] font-bold">WhatsApp</span>
          </button>

          <button
            onClick={handleFacebook}
            className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors border border-blue-200"
          >
            <Facebook className="w-6 h-6" />
            <span className="text-[11px] font-bold">Facebook</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors border border-orange-200"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-[11px] font-bold">Nativo</span>
          </button>
        </div>

        {/* Copy URL Box */}
        <div className="p-2.5 bg-stone-100 rounded-2xl border border-stone-200 flex items-center justify-between">
          <span className="text-xs font-mono text-stone-600 truncate mr-2">{shareUrl}</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
