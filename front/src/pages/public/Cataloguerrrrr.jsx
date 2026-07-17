
import "../../css/Catalogue.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'




const PRICE_RANGES = [
  { id: "0-200", label: "0 – 200 MAD" },
  { id: "200-500", label: "200 – 500 MAD" },
  { id: "500+", label: "500 MAD +" },
];
 
const CONDITIONS = [
  { id: "neuf", label: "Neuf" },
  { id: "comme-neuf", label: "Comme neuf" },
  { id: "occasion", label: "Occasion" },
];
 
const SORT_OPTIONS = [
  { id: "pertinence", label: "Trier par : Pertinence" },
  { id: "prix-asc", label: "Prix croissant" },
  { id: "prix-desc", label: "Prix décroissant" },
  { id: "nouveautes", label: "Nouveautés" },
];




function Catalogue(){  
    const [prse, setPrse] = useState([]);
    const [info, setInfo] = useState([]);
    const [info, setInfo] = useState([]);


   const handleSearch = async () => {
    try {
      const res = await fetch('http://localhost:3000/catalogue/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search })
      });
      const data = await res.json();
      setPrse(data?.produits?? []);
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  };

const handleGetHomeData = async () => {
    try {
      const res = await fetch('http://localhost:3000/home');
      const data = await res.json();
      setInfo(data?.produitsVedette ?? []);
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  }

useEffect(() => { handleGetHomeData();  }, []);




const handleCat = async () => {
    try {
      const res = await fetch('http://localhost:3000/categories');
      const data = await res.json();
      setCategories(normalizeCategories(data));
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  }
 

useEffect(() => {  handleCat(); }, []);




  useEffect(() => {

  if (!search.trim()) {
    setPrse([]);
    return;
  }

  const timer = setTimeout(() => {
    handleSearch();
  }, 300);

  return () => clearTimeout(timer);

}, [search]); 





  return(


 <main className="main" id="visitorMain">
      <section className="view active" id="catalogue">
        <div className="topline">
          <div>
            <span className="kicker">Catalogue</span>
            <h1>Rechercher, filtrer et trier</h1>
          </div>
        </div>
 
        <div className="cata-layout">
          {/* ---------- Filtres ---------- */}
          <aside className="filters">
            <div className="searchbar">
              🔍{" "}
              <input
                placeholder="Rechercher un produit…"
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
 
            <div className="filter-block">
              <h3>Catégorie</h3>
              {CATEGORIES.map((cat) => (
                <label key={cat.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() =>
                      toggleInArray(
                        selectedCategories,
                        setSelectedCategories,
                        cat.id
                      )
                    }
                  />{" "}
                  {cat.label}
                </label>
              ))}
            </div>
 
            <div className="filter-block">
              <h3>Prix</h3>
              {PRICE_RANGES.map((range) => (
                <label key={range.id}>
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range.id)}
                    onChange={() =>
                      toggleInArray(
                        selectedPriceRanges,
                        setSelectedPriceRanges,
                        range.id
                      )
                    }
                  />{" "}
                  {range.label}
                </label>
              ))}
            </div>
 
            <div className="filter-block">
              <h3>Note vendeur</h3>
              <label>
                <input
                  type="checkbox"
                  checked={minRating}
                  onChange={() => setMinRating(!minRating)}
                />{" "}
                ★ 4 et plus
              </label>
            </div>
 
            <div className="filter-block">
              <h3>État</h3>
              {CONDITIONS.map((cond) => (
                <label key={cond.id}>
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(cond.id)}
                    onChange={() =>
                      toggleInArray(
                        selectedConditions,
                        setSelectedConditions,
                        cond.id
                      )
                    }
                  />{" "}
                  {cond.label}
                </label>
              ))}
            </div>
          </aside>
 
          {/* ---------- Contenu principal ---------- */}
          <div style={{ flex: 1 }}>
            {/* Tags des filtres actifs */}
            <div className="active-filters">
              {activeFilters.map((filter) => (
                <span className="filter-tag" key={`${filter.type}-${filter.id}`}>
                  {filter.label}{" "}
                  <button
                    title="Retirer"
                    onClick={() => removeActiveFilter(filter)}
                  >
                    ✕
                  </button>
                </span>
              ))}
              <button className="filter-tag clear" onClick={clearAllFilters}>
                Tout effacer
              </button>
            </div>
 
            {/* Barre de tri */}
            <div className="sortbar">
              <span style={{ fontSize: "12.5px", color: "var(--ink-soft)" }}>
                {totalCount} produits
              </span>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
 
            {/* Grille produits */}
            <div className="catalogue-grid">
              {products.map((product) => (
                <div
                  className="card"
                  key={product.id}
                  data-page="produit.html"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="thumb">
                    <span className="play">▶</span>
                  </div>
                  <div className="card-body">
                    <div className="name">{product.name}</div>
                    <div className="shop">{product.shop}</div>
                    <div className="price">{product.price} MAD</div>
                  </div>
                </div>
              ))}
            </div>
 
            {/* Pagination */}
            <div className="pagination">
              <button className="nav" onClick={goToPrevious}>
                ← Précédent
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={page === currentPage ? "active" : ""}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button className="nav" onClick={goToNext}>
                Suivant →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>




  );


 }










