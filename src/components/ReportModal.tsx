import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle } from 'lucide-react';
import { Recipe } from '../types';
import { submitReport } from '../services/api';

interface ReportModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  const [reason, setReason] = useState<any>('enlace_roto');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitReport(recipe.id, reason, details);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">¡Reporte Enviado!</h3>
            <p className="text-xs text-stone-600">
              Gracias por ayudarnos a mantener la calidad del catálogo ConCocina. Un administrador revisará la publicación.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <Flag className="w-5 h-5" />
              <h3 className="font-serif text-xl font-bold text-stone-900">Reportar Receta</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">{recipe.title}</p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Motivo del reporte:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-rose-500"
              >
                <option value="enlace_roto">Enlace roto o video no disponible</option>
                <option value="contenido_eliminado">Contenido borrado de la plataforma original</option>
                <option value="categoria_incorrecta">Categoría o ingredientes incorrectos</option>
                <option value="informacion_incorrecta">Información de receta errónea</option>
                <option value="contenido_inapropiado">Contenido inapropiado</option>
                <option value="derechos_autor">Posible problema de derechos de autor</option>
                <option value="duplicado">Receta duplicada en el catálogo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Detalles adicionales (opcional):
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Escribe detalles útiles para los moderadores..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
