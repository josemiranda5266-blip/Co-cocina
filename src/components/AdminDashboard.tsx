import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, CheckCircle, XCircle, AlertTriangle, RefreshCw, BarChart2, Eye, Flag, Layers, Award, Sparkles, Youtube, ExternalLink, Settings } from 'lucide-react';
import { Recipe, Report } from '../types';
import { fetchAdminMetrics, updateRecipeStatus, fetchRecipes } from '../services/api';

interface AdminDashboardProps {
  onOpenImportModal: () => void;
  onSelectRecipe: (r: Recipe) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenImportModal,
  onSelectRecipe
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'rejected' | 'reports'>('pending');
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, r] = await Promise.all([
        fetchAdminMetrics(),
        fetchRecipes({ status: 'ALL' })
      ]);
      setMetrics(m);
      setRecipes(r.recipes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateRecipeStatus(id, 'ACTIVE', 'Aprobado por moderador');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateRecipeStatus(id, 'REJECTED', 'Rechazado por moderador');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredRecipes = recipes.filter(r => {
    if (activeTab === 'pending') return r.status === 'PENDING_REVIEW';
    if (activeTab === 'active') return r.status === 'ACTIVE';
    if (activeTab === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-3 border border-amber-500/30">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Panel de Control & Moderación</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight mb-2">
            Administración ConCocina
          </h1>
          <p className="text-stone-400 text-sm max-w-xl">
            Gestiona el catálogo gastronómico, importa enlaces con ConCocina Collector, revisa recetas pendientes y monitorea reportes.
          </p>
        </div>

        <button
          onClick={onOpenImportModal}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Importar con Collector</span>
        </button>
      </div>

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">Total Recetas</span>
            <span className="font-serif text-3xl font-extrabold text-stone-900">{metrics.total}</span>
            <span className="text-[11px] text-stone-400 block mt-1">En catálogo general</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Activas / Públicas</span>
            <span className="font-serif text-3xl font-extrabold text-emerald-700">{metrics.active}</span>
            <span className="text-[11px] text-emerald-600 block mt-1">Visibles para usuarios</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Pendientes de Revisión</span>
            <span className="font-serif text-3xl font-extrabold text-amber-900">{metrics.pending}</span>
            <span className="text-[11px] text-amber-700 block mt-1">Requieren moderación</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-rose-200 bg-rose-50/40 shadow-2xs">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">Reportes Pendientes</span>
            <span className="font-serif text-3xl font-extrabold text-rose-900">{metrics.pendingReports}</span>
            <span className="text-[11px] text-rose-700 block mt-1">Sugerencias de usuarios</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Pendientes ({recipes.filter(r => r.status === 'PENDING_REVIEW').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Activas ({recipes.filter(r => r.status === 'ACTIVE').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rejected'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Rechazadas ({recipes.filter(r => r.status === 'REJECTED').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Reportes ({metrics?.reports?.length || 0})</span>
        </button>
      </div>

      {/* Recipe Moderation Table */}
      {activeTab !== 'reports' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-bold border-b border-stone-200">
                <tr>
                  <th className="p-4">Receta</th>
                  <th className="p-4">Fuente / Autor</th>
                  <th className="p-4">Quality Score</th>
                  <th className="p-4">Ingredientes IA</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredRecipes.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.video.thumbnailUrl}
                          alt={r.title}
                          className="w-14 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <span
                            onClick={() => onSelectRecipe(r)}
                            className="font-bold text-stone-900 hover:text-orange-600 cursor-pointer line-clamp-1"
                          >
                            {r.title}
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            Categorías: {r.categories.join(', ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-semibold">
                      <span>{r.video.author}</span>
                      <span className="text-[10px] text-stone-400 capitalize block">{r.video.source}</span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        r.qualityScore >= 80 ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {r.qualityScore}/100
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate text-stone-500">
                      {r.ingredients.map(i => i.name).join(', ')}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-1 transition-colors"
                            title="Aprobar"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Aprobar</span>
                          </button>
                        )}

                        {r.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleReject(r.id)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-bold flex items-center gap-1 transition-colors"
                            title="Rechazar"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rechazar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRecipes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400 italic">
                      No hay recetas en esta categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {activeTab === 'reports' && metrics?.reports && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h3 className="font-bold text-lg text-stone-900">Reportes de usuarios sobre recetas</h3>
          <div className="space-y-3">
            {metrics.reports.map((rep: Report) => (
              <div key={rep.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between">
                <div>
                  <span className="font-bold text-stone-900 block">{rep.recipeTitle}</span>
                  <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block my-1">
                    Motivo: {rep.reason}
                  </span>
                  {rep.details && <p className="text-xs text-stone-600 mt-1">{rep.details}</p>}
                </div>
                <span className="text-[11px] text-stone-400">{new Date(rep.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
