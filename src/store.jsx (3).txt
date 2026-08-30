import { useState, useEffect } from "react";
import {
  Search, ShoppingBag, X, Plus, Minus, Trash2, Star, Instagram, Facebook,
  MapPin, Clock, Phone, ArrowLeft, MessageCircle, ChevronRight,
} from "lucide-react";
import { fmt, calcDiscount, ICON_MAP, formatPhoneDisplay, normalizeWhatsAppDigits, LOGO_SIZES } from "./lib.js";
import { CategoryPill, ProductArt } from "./ui.jsx";

export function ImageCarousel({ images }) {
  const validImages = (images || []).filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % validImages.length), 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validImages.length]);

  if (validImages.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="relative rounded-3xl overflow-hidden aspect-video bg-stone-100">
        {validImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validImages.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Foto ${i + 1}`}
                className={`w-2 h-2 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Header({ branding, config, categories, cartCount, onCartClick, onLogoClick, searchQuery, setSearchQuery, activeCategory, setActiveCategory, showCart, searchPlaceholder }) {
  const initial = (branding.name || "?").trim().charAt(0).toUpperCase();
  const size = LOGO_SIZES[(config && config.logoSize) || "md"] || LOGO_SIZES.md;
  const cartVisible = showCart !== false;
  return (
    <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <button type="button" onClick={onLogoClick} className="flex items-center gap-2 min-w-0 flex-1">
            {branding.logoImage ? (
              <img src={branding.logoImage} alt={branding.name} className={`${size.img} w-auto object-contain shrink-0`} />
            ) : (
              <span className={`${size.box} rounded-full bg-brand-ink flex items-center justify-center shrink-0`}>
                <span className={`font-display font-bold ${size.text} text-brand-accent`}>{initial}</span>
              </span>
            )}
            <span className="font-display font-bold text-base sm:text-lg text-stone-900 truncate">{branding.name}</span>
          </button>
          {cartVisible && (
            <button
              type="button"
              onClick={onCartClick}
              className="relative w-10 h-10 rounded-full bg-brand-ink text-white flex items-center justify-center hover:bg-brand transition shrink-0"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
        <div className="pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder || "Buscar productos..."}
              className="w-full bg-white border border-stone-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none ring-brand"
            />
          </div>
        </div>
        <div className="pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryPill active={activeCategory === null} label="Todos" onClick={() => setActiveCategory(null)} />
          {categories.map((c) => (
            <CategoryPill key={c.id} active={activeCategory === c.id} label={c.name} icon={ICON_MAP[c.icon]} onClick={() => setActiveCategory(c.id)} />
          ))}
        </div>
      </div>
    </header>
  );
}

export function Hero({ branding, config, onCta, waLink, waReady }) {
  const heroStyle = branding.heroStyle || "text";
  const heroImage = branding.heroImage;
  const buttonText = config.heroButtonText || "Ver productos";

  const textBlock = (
    <div>
      <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight max-w-2xl">
        {config.tagline || `Bienvenido a ${branding.name}`}
      </h1>
      <p className="mt-4 text-stone-300 text-base sm:text-lg max-w-md">{config.welcomeText}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={onCta} className="rounded-full bg-brand hover:opacity-90 text-white font-semibold px-6 py-3 transition">
          {buttonText}
        </button>
        {waReady && (
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-stone-600 hover:border-stone-400 text-stone-100 font-semibold px-6 py-3 inline-flex items-center gap-2 transition"
          >
            <MessageCircle size={18} /> Escribinos
          </a>
        )}
      </div>
    </div>
  );

  if (heroStyle === "full" && heroImage) {
    return (
      <section className="relative text-stone-50 overflow-hidden hero-bg-image" style={{ backgroundImage: `url(${heroImage})` }}>
        <div className="absolute inset-0 bg-brand-ink opacity-70" />
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 relative z-10">{textBlock}</div>
      </section>
    );
  }

  if (heroStyle === "side" && heroImage) {
    return (
      <section className="relative bg-brand-ink text-stone-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative z-10 grid sm:grid-cols-2 gap-8 items-center">
          {textBlock}
          <div className="rounded-3xl overflow-hidden aspect-square hidden sm:block">
            <img src={heroImage} alt={branding.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-brand-ink text-stone-50 overflow-hidden">
      <div className="absolute w-72 h-72 rounded-full bg-brand opacity-20 blur-3xl pointer-events-none" style={{ top: "-6rem", right: "-6rem" }} />
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-14 sm:py-20 relative z-10">{textBlock}</div>
    </section>
  );
}

export function ProductCard({ product, currency, onView, onAdd }) {
  const discount = calcDiscount(product.price, product.comparePrice);
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={onView}
        style={{ aspectRatio: "4 / 5" }}
        className="relative block w-full rounded-3xl overflow-hidden border border-stone-200 text-left focus:outline-none ring-brand"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <ProductArt name={product.name} size="card" />
        )}
        <div className="absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3">
          <div className="flex items-start justify-between">
            {discount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-brand-accent text-white text-xs font-bold px-2 py-1">-{discount}%</span>
            ) : (
              <span />
            )}
            {product.featured && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-brand-accent shadow-sm">
                <Star size={13} fill="currentColor" />
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md px-3 py-2 -rotate-1 group-hover:rotate-0 transition-transform duration-300 self-start max-w-full">
            <p className="font-display font-semibold text-stone-900 text-xs sm:text-sm leading-tight line-clamp-2">{product.name}</p>
          </div>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">AGOTADO</span>
          </div>
        )}
      </button>
      <div className="mt-2.5 px-0.5 flex-1 flex flex-col">
        <p className="text-xs text-stone-500 line-clamp-2">{product.shortDescription}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          {product.comparePrice > 0 && <span className="text-xs text-stone-400 line-through">{fmt(product.comparePrice, currency)}</span>}
          <span className="font-mono-data font-bold text-stone-900">{fmt(product.price, currency)}</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!product.inStock}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-brand text-white text-sm font-medium py-2 hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={15} /> Agregar
        </button>
      </div>
    </article>
  );
}

function Section({ eyebrow, title, products, currency, onViewProduct, onAddToCart }) {
  return (
    <div className="mb-12">
      <div className="mb-4">
        <span className="inline-block bg-white border border-stone-200 rounded-md px-2 py-0.5 text-xs font-mono-data uppercase tracking-wider text-brand -rotate-1">{eyebrow}</span>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">{title}</h2>
      </div>
      <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="w-40 sm:w-auto shrink-0">
            <ProductCard product={p} currency={currency} onView={() => onViewProduct(p.id)} onAdd={() => onAddToCart(p)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterBar({ categories, activeCategory, setActiveCategory, sortBy, setSortBy, onlyFeatured, setOnlyFeatured, onlyOffers, setOnlyOffers }) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-stone-200 rounded-2xl p-2.5">
      <select value={activeCategory || ""} onChange={(e) => setActiveCategory(e.target.value || null)} className="text-xs border border-stone-200 rounded-full px-3 py-1.5 bg-stone-50 focus:outline-none">
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs border border-stone-200 rounded-full px-3 py-1.5 bg-stone-50 focus:outline-none">
        <option value="relevancia">Relevancia</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
        <option value="nombre">Nombre A-Z</option>
      </select>
      <button type="button" onClick={() => setOnlyFeatured(!onlyFeatured)} className={`text-xs rounded-full px-3 py-1.5 border font-medium ${onlyFeatured ? "bg-brand-ink text-white border-transparent" : "bg-stone-50 text-stone-600 border-stone-200"}`}>
        ★ Destacados
      </button>
      <button type="button" onClick={() => setOnlyOffers(!onlyOffers)} className={`text-xs rounded-full px-3 py-1.5 border font-medium ${onlyOffers ? "bg-brand-accent text-white border-transparent" : "bg-stone-50 text-stone-600 border-stone-200"}`}>
        Ofertas
      </button>
    </div>
  );
}

export function HomeScreen({
  branding, config, categories, activeProducts, filtersActive, browseProducts,
  onViewProduct, onAddToCart, currency,
  sortBy, setSortBy, onlyFeatured, setOnlyFeatured, onlyOffers, setOnlyOffers,
  activeCategory, setActiveCategory, clearFilters, productsSectionRef, waLink, waReady,
}) {
  const destacados = activeProducts.filter((p) => p.featured).slice(0, 8);
  const ofertas = activeProducts.filter((p) => p.comparePrice > p.price).slice(0, 8);
  const nuevos = [...activeProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  function scrollToAll() {
    if (productsSectionRef.current) productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      {!filtersActive && <Hero branding={branding} config={config} onCta={scrollToAll} waLink={waLink} waReady={waReady} />}
      {!filtersActive && <ImageCarousel images={config.carouselImages} />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {filtersActive ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-semibold text-stone-900">Resultados</h2>
              <button type="button" onClick={clearFilters} className="text-sm text-brand font-medium">Limpiar filtros</button>
            </div>
            <FilterBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} onlyFeatured={onlyFeatured} setOnlyFeatured={setOnlyFeatured} onlyOffers={onlyOffers} setOnlyOffers={setOnlyOffers} />
            {browseProducts.length === 0 ? (
              <div className="text-center py-16 text-stone-400">
                <Search size={32} className="mx-auto mb-3" strokeWidth={1} />
                <p>No encontramos productos con esos filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-5">
                {browseProducts.map((p) => (
                  <ProductCard key={p.id} product={p} currency={currency} onView={() => onViewProduct(p.id)} onAdd={() => onAddToCart(p)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {destacados.length > 0 && <Section eyebrow="Selección" title="Destacados" products={destacados} currency={currency} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />}
            {ofertas.length > 0 && <Section eyebrow="Aprovechá" title="Ofertas" products={ofertas} currency={currency} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />}
            {nuevos.length > 0 && <Section eyebrow="Recién llegados" title="Nuevos" products={nuevos} currency={currency} onViewProduct={onViewProduct} onAddToCart={onAddToCart} />}
            <div ref={productsSectionRef}>
              <div className="mb-4">
                <span className="inline-block bg-white border border-stone-200 rounded-md px-2 py-0.5 text-xs font-mono-data uppercase tracking-wider text-brand -rotate-1">Catálogo</span>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">Todos los productos</h2>
              </div>
              <FilterBar categories={categories} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} onlyFeatured={onlyFeatured} setOnlyFeatured={setOnlyFeatured} onlyOffers={onlyOffers} setOnlyOffers={setOnlyOffers} />
              {activeProducts.length === 0 ? (
                <p className="text-center text-stone-400 py-16">Todavía no hay productos cargados en esta tienda.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-5">
                  {activeProducts.map((p) => (
                    <ProductCard key={p.id} product={p} currency={currency} onView={() => onViewProduct(p.id)} onAdd={() => onAddToCart(p)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export function ProductDetailScreen({ product, category, related, currency, onBack, onAddMain, onViewProduct, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-stone-400">
        <p>Producto no encontrado.</p>
        <button type="button" onClick={onBack} className="text-brand underline mt-2">Volver a la tienda</button>
      </div>
    );
  }

  const discount = calcDiscount(product.price, product.comparePrice);
  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-5">
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <div className="relative rounded-3xl overflow-hidden aspect-square border border-stone-200">
            {images.length > 0 ? <img src={images[activeImg]} alt={product.name} className="w-full h-full object-cover" /> : <ProductArt name={product.name} size="detail" />}
            {discount > 0 && <span className="absolute top-4 left-4 bg-brand-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>}
            {!product.inStock && (
              <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
                <span className="bg-stone-900 text-white text-sm font-semibold px-4 py-2 rounded-full">AGOTADO</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button type="button" key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${activeImg === i ? "border-brand" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          {category && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono-data uppercase tracking-wider text-brand bg-brand-surface border border-stone-200 rounded-full px-2.5 py-1">
              {category.name}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-stone-900 mt-3">{product.name}</h1>
          <p className="text-stone-600 mt-3 leading-relaxed whitespace-pre-line">{product.description}</p>
          <div className="mt-5 flex items-baseline gap-3">
            {product.comparePrice > 0 && <span className="text-stone-400 line-through text-lg">{fmt(product.comparePrice, currency)}</span>}
            <span className="font-mono-data font-bold text-3xl text-stone-900">{fmt(product.price, currency)}</span>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-full">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center font-mono-data font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900">
                <Plus size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onAddMain(product, qty)}
              disabled={!product.inStock}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand hover:opacity-90 text-white font-semibold py-3 disabled:opacity-40 transition"
            >
              <ShoppingBag size={17} /> {product.inStock ? "Agregar al carrito" : "Agotado"}
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-stone-900 mb-4">También te puede interesar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} onView={() => onViewProduct(p.id)} onAdd={() => onAddToCart(p)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CartDrawer({ open, onClose, items, currency, onInc, onDec, onRemove, onClear, onCheckout, waReady }) {
  const [customerName, setCustomerName] = useState("");
  const [customerLocality, setCustomerLocality] = useState("");
  const [formError, setFormError] = useState("");

  if (!open) return null;
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  function handleCheckout() {
    if (!customerName.trim() || !customerLocality.trim()) {
      setFormError("Completá tu nombre y localidad para continuar.");
      return;
    }
    setFormError("");
    onCheckout({ name: customerName.trim(), locality: customerLocality.trim() });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-stone-900/40" onClick={onClose} />
      <div className="lg-drawer absolute right-0 top-0 h-full w-full sm:w-96 bg-stone-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-display text-xl font-semibold text-stone-900 flex items-center gap-2">
            <ShoppingBag size={19} /> Tu carrito
          </h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-stone-200 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-16">
              <ShoppingBag size={40} strokeWidth={1} />
              <p className="mt-3 text-sm">Tu carrito está vacío.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.product.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl border border-stone-200 shrink-0 relative overflow-hidden">
                    {i.product.images && i.product.images[0] ? <img src={i.product.images[0]} alt="" className="w-full h-full object-cover" /> : <ProductArt name={i.product.name} size="mini" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 text-sm truncate">{i.product.name}</p>
                    <p className="font-mono-data text-sm text-stone-500 mt-0.5">{fmt(i.product.price, currency)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button type="button" onClick={() => onDec(i.product.id)} className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-mono-data">{i.qty}</span>
                      <button type="button" onClick={() => onInc(i.product.id)} className="w-7 h-7 rounded-full border border-stone-300 flex items-center justify-center">
                        <Plus size={12} />
                      </button>
                      <button type="button" onClick={() => onRemove(i.product.id)} className="ml-auto text-stone-400 hover:text-red-700">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={onClose} className="text-xs font-medium text-brand inline-flex items-center gap-1">
                <ArrowLeft size={13} /> Seguir comprando
              </button>
              <button type="button" onClick={onClear} className="text-xs text-stone-400 hover:text-red-700">Vaciar carrito</button>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span className="font-mono-data">{fmt(subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>Total</span>
              <span className="font-mono-data text-lg">{fmt(subtotal, currency)}</span>
            </div>
            <div className="pt-1 space-y-2">
              <p className="text-xs font-semibold text-stone-600">Tus datos para el pedido</p>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre y apellido" className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ring-brand" />
              <input value={customerLocality} onChange={(e) => setCustomerLocality(e.target.value)} placeholder="Localidad" className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ring-brand" />
              {formError && (
                <p className="text-red-700 text-xs flex items-center gap-1">
                  <X size={12} /> {formError}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!waReady}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageCircle size={18} /> Pedir por WhatsApp
            </button>
            {!waReady && <p className="text-xs text-stone-400 text-center">Esta tienda todavía no configuró su WhatsApp.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export function Footer({ branding, config, onAdminClick, showAdminLink }) {
  const footerSize = LOGO_SIZES[(config && config.logoSize) || "md"] || LOGO_SIZES.md;
  return (
    <footer className="bg-brand-ink text-stone-300 mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {branding.logoImage ? (
              <img src={branding.logoImage} alt={branding.name} className={`${footerSize.img} w-auto object-contain`} />
            ) : (
              <span className={`${footerSize.box} rounded-full bg-brand-ink-soft flex items-center justify-center`}>
                <span className={`font-display font-bold text-brand-accent ${footerSize.text}`}>{(branding.name || "?").charAt(0).toUpperCase()}</span>
              </span>
            )}
            <span className="font-display font-bold text-white">{branding.name}</span>
          </div>
          <p className="text-sm text-stone-400 max-w-xs">{config.welcomeText}</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-mono-data text-xs uppercase tracking-wider text-stone-500 mb-2">Contacto</p>
          {config.address && <p className="flex items-center gap-2"><MapPin size={14} /> {config.address}</p>}
          {config.hours && <p className="flex items-center gap-2"><Clock size={14} /> {config.hours}</p>}
          {config.whatsapp && <p className="flex items-center gap-2"><Phone size={14} /> {formatPhoneDisplay(normalizeWhatsAppDigits(config.whatsapp))}</p>}
        </div>
        <div className="text-sm space-y-3">
          <p className="font-mono-data text-xs uppercase tracking-wider text-stone-500 mb-2">Seguinos</p>
          <div className="flex gap-3">
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-brand-ink-soft flex items-center justify-center hover:opacity-80">
                <Instagram size={16} />
              </a>
            )}
            {config.facebook && (
              <a href={config.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-brand-ink-soft flex items-center justify-center hover:opacity-80">
                <Facebook size={16} />
              </a>
            )}
          </div>
          {config.instagramQrImage && config.instagram && (
            <a href={`https://instagram.com/${config.instagram}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-brand-ink-soft rounded-2xl p-2.5 hover:opacity-90 transition">
              <img src={config.instagramQrImage} alt="QR Instagram" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              <span className="text-xs text-stone-300 max-w-28">Escaneá para seguirnos en Instagram</span>
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-stone-800 py-4 px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
        <p>© {new Date().getFullYear()} {branding.name}.</p>
        {showAdminLink && (
          <button type="button" onClick={onAdminClick} className="hover:text-stone-300 transition">Panel de la tienda</button>
        )}
      </div>
    </footer>
  );
}
