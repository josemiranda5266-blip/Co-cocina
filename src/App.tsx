import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HeroSearch } from './components/HeroSearch';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { PantrySearch } from './components/PantrySearch';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { ShareModal } from './components/ShareModal';
import { ReportModal } from './components/ReportModal';
import { CustomListsModal } from './components/CustomListsModal';
import { AdminImportModal } from './components/AdminImportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Recipe, Category, SearchFilters } from './types';
import { fetchRecipes, fetchCategories, performSemanticSearch } from './services/api';
import { getFavorites, toggleFavorite, getCustomCollections } from './services/storageService';
import { Filter, Sparkles, SlidersHorizontal, ChevronRight, Grid, Heart, Utensils, Award, ChefHat, Check } from 'lucide-react';

export function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'search' | 'pantry' | 'categories' | 'favorites' | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [semanticExplanation, setSemanticExplanation] = useState<string>('');
  const [isSemanticLoading, setIsSemanticLoading] = useState(false);

  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    difficulty: undefined,
    maxTimeMinutes: undefined,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isBudget: false,
    isQuick: false,
    isHealthy: false,
    sortBy: 'score'
  });

  // Modal States
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);
  const [reportRecipe, setReportRecipe] = useState<Recipe | null>(null);
  const [customListRecipe, setCustomListRecipe] = useState<Recipe | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [recData, catData] = await Promise.all([
        fetchRecipes({
          query: searchQuery,
          category: selectedCategory,
          ...filters
        }),
        fetchCategories()
      ]);
      setRecipes(recData.recipes);
      setCategories(catData);
      setFavorites(getFavorites());
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, filters]);

  // Handle Search Submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSemanticExplanation('');
      loadData();
      return;
    }

    // Run Smart Semantic Search via Gemini AI API
    setIsSemanticLoading(true);
    try {
      const semanticRes = await performSemanticSearch(searchQuery.trim());
      setRecipes(semanticRes.results);
      setSemanticExplanation(semanticRes.explanation);
      if (currentTab === 'home') setCurrentTab('search');
    } catch {
      loadData();
    } finally {
      setIsSemanticLoading(false);
    }
  };

  // Toggle Favorite
  const handleToggleFav = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    const updated = toggleFavorite(id);
    setFavorites(updated);
  };

  // Quick Category Click
  const handleQuickCategoryClick = (catName: string) => {
    if (['quick', 'healthy', 'budget'].includes(catName)) {
      setFilters(prev => ({
        ...prev,
        isQuick: catName === 'quick' ? !prev.isQuick : prev.isQuick,
        isHealthy: catName === 'healthy' ? !prev.isHealthy : prev.isHealthy,
        isBudget: catName === 'budget' ? !prev.isBudget : prev.isBudget
      }));
    } else {
      setSelectedCategory(catName === selectedCategory ? '' : catName);
    }
    setCurrentTab('search');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col antialiased selection:bg-orange-500 selection:text-white pb-20 lg:pb-8">
      
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab: any) => setCurrentTab(tab)}
        onOpenVoiceSearch={() => setIsVoiceModalOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          setIsAdmin(!isAdmin);
          if (!isAdmin) setCurrentTab('admin');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Views */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME */}
        {currentTab === 'home' && (
          <div>
            <HeroSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
              onOpenVoiceSearch={() => setIsVoiceModalOpen(true)}
              onQuickCategoryClick={handleQuickCategoryClick}
            />

            {/* Catalog Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              
              {/* Category Strip */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Explora por Categorías
                  </h2>
                  <button
                    onClick={() => setCurrentTab('categories')}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <span>Ver todas ({categories.length})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {categories.slice(0, 6).map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setCurrentTab('search');
                      }}
                      className="group p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2 text-xl group-hover:scale-110 transition-transform">
                        {cat.icon || '🍳'}
                      </div>
                      <h3 className="font-bold text-xs text-stone-800 group-hover:text-orange-600 truncate">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        {cat.count} recetas
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Quality Score Recipes */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <Award className="w-6 h-6 text-amber-500" />
                      <span>Recetas Destacadas ConCocina</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Videos con máxima puntuación de calidad (Quality Score 0-100) y metadatos completos
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-72 bg-stone-200 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.slice(0, 6).map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onSelectRecipe={setSelectedRecipe}
                        isFav={favorites.includes(recipe.id)}
                        onToggleFav={handleToggleFav}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Callout: "¿Qué tenés en casa?" */}
              <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Inteligencia Gastronómica</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold">¿Ingredientes en la heladera?</h3>
                  <p className="text-stone-300 text-sm">
                    Ingresa lo que tenés en casa y nuestra IA te mostrará qué podés cocinar hoy mismo ordenado por porcentaje de coincidencia.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('pantry')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm rounded-2xl shadow-lg transition-transform hover:scale-105 shrink-0"
                >
                  Probar Despensa Inteligente
                </button>
              </div>

            </section>
          </div>
        )}

        {/* VIEW 2: SEARCH & CATALOG FILTER */}
        {currentTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Semantic Explanation Alert */}
            {semanticExplanation && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>IA ConCocina:</strong> {semanticExplanation}</span>
                </div>
                <button
                  onClick={() => {
                    setSemanticExplanation('');
                    setSearchQuery('');
                    loadData();
                  }}
                  className="text-orange-700 font-bold underline shrink-0 ml-2"
                >
                  Limpiar
                </button>
              </div>
            )}

            {/* Filter Controls Header */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-orange-600" />
                  <h2 className="font-bold text-base text-stone-900">Filtros de Catálogo</h2>
                  <span className="text-xs text-stone-500">({recipes.length} resultados)</span>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <span>Ordenar por:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(p => ({ ...p, sortBy: e.target.value as any }))}
                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="score">Quality Score (Calidad)</option>
                    <option value="newest">Más recientes</option>
                    <option value="views">Más vistas</option>
                  </select>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Difficulty */}
                {['Todas', 'Fácil', 'Media', 'Avanzada'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilters(p => ({ ...p, difficulty: d === 'Todas' ? undefined : d as any }))}
                    className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                      (d === 'Todas' && !filters.difficulty) || filters.difficulty === d
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    Dificultad: {d}
                  </button>
                ))}

                {/* Dietary Toggles */}
                <button
                  onClick={() => setFilters(p => ({ ...p, isQuick: !p.isQuick }))}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                    filters.isQuick ? 'bg-amber-500 text-white border-amber-500' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  ⚡ Rápidas (&lt; 30 min)
                </button>

                <button
                  onClick={() => setFilters(p => ({ ...p, isBudget: !p.isBudget }))}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                    filters.isBudget ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  💰 Económicas
                </button>

                <button
                  onClick={() => setFilters(p => ({ ...p, isVegetarian: !p.isVegetarian }))}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                    filters.isVegetarian ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  🌱 Vegetariana
                </button>

                <button
                  onClick={() => setFilters(p => ({ ...p, isGlutenFree: !p.isGlutenFree }))}
                  className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                    filters.isGlutenFree ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  🌾 Sin TACC
                </button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelectRecipe={setSelectedRecipe}
                  isFav={favorites.includes(recipe.id)}
                  onToggleFav={handleToggleFav}
                />
              ))}
            </div>

            {recipes.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No encontramos recetas con esos criterios</h3>
                <p className="text-xs text-stone-500 mt-1">Intenta cambiar los filtros o realizar una búsqueda más amplia.</p>
              </div>
            )}

          </div>
        )}

        {/* VIEW 3: PANTRY ("¿Qué tenés en casa?") */}
        {currentTab === 'pantry' && (
          <PantrySearch
            onSelectRecipe={setSelectedRecipe}
            favorites={favorites}
            onToggleFav={handleToggleFav}
          />
        )}

        {/* VIEW 4: CATEGORIES GRID */}
        {currentTab === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="font-serif text-3xl font-extrabold text-stone-900 mb-2">
              Todas las Categorías Gastronómicas
            </h1>
            <p className="text-stone-600 text-sm mb-8">
              Encuentra videos organizados según el tipo de plato o ingrediente principal.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentTab('search');
                  }}
                  className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform">
                    {cat.icon || '🍽️'}
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-orange-600">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-stone-400 mt-1 block">
                    {cat.count} recetas
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: FAVORITES */}
        {currentTab === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-rose-500 fill-current" />
              <div>
                <h1 className="font-serif text-3xl font-extrabold text-stone-900">
                  Tus Recetas Guardadas
                </h1>
                <p className="text-stone-500 text-xs">
                  {favorites.length} recetas en tu lista personal de favoritos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.filter(r => favorites.includes(r.id)).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelectRecipe={setSelectedRecipe}
                  isFav={true}
                  onToggleFav={handleToggleFav}
                />
              ))}
            </div>

            {favorites.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-stone-800">No tenés recetas guardadas todavía</h3>
                <p className="text-xs text-stone-500 mt-1">Presiona el corazón en cualquier tarjeta para guardarla acá.</p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: ADMIN DASHBOARD */}
        {currentTab === 'admin' && (
          <AdminDashboard
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onSelectRecipe={setSelectedRecipe}
          />
        )}

      </main>

      {/* Navigation for Mobile */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab: any) => setCurrentTab(tab)}
        isAdmin={isAdmin}
      />

      {/* Modals */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        isFav={selectedRecipe ? favorites.includes(selectedRecipe.id) : false}
        onToggleFav={(id) => handleToggleFav(null, id)}
        onOpenShare={setShareRecipe}
        onOpenReport={setReportRecipe}
        onOpenLists={setCustomListRecipe}
        similarRecipes={selectedRecipe ? recipes.filter(r => r.id !== selectedRecipe.id && r.categories.some(c => selectedRecipe.categories.includes(c))) : []}
        onSelectRecipe={setSelectedRecipe}
      />

      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceResult={(transcript) => {
          setSearchQuery(transcript);
          setCurrentTab('search');
        }}
      />

      <ShareModal
        recipe={shareRecipe}
        onClose={() => setShareRecipe(null)}
      />

      <ReportModal
        recipe={reportRecipe}
        onClose={() => setReportRecipe(null)}
      />

      <CustomListsModal
        recipe={customListRecipe}
        onClose={() => setCustomListRecipe(null)}
      />

      <AdminImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRecipeImported={() => loadData()}
      />

    </div>
  );
}
export default App;
