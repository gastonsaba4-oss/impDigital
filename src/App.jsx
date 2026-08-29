import { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Store } from "lucide-react";
import {
  loadShared, saveShared, loadPersonal, savePersonal, siteKey,
  genId, buildWhatsAppMessage, buildCatalogMessage, GLOBAL_CSS,
  getPalette, paletteCssVars, DEFAULT_SITE_CONFIG,
} from "./lib.js";
import { LOWGARTEN_PRODUCTS, LOWGARTEN_CATEGORIES, LOWGARTEN_CONFIG, LOWGARTEN_BRANDING } from "./seed-lowgarten.js";
import { Toast, AccessGate } from "./ui.jsx";
import { Header, HomeScreen, ProductDetailScreen, CartDrawer, Footer } from "./store.jsx";
import {
  AdminShell, AdminDashboard, AdminProductsList, AdminProductForm,
  AdminCategories, AdminOrders, AdminConfigForm,
} from "./admin.jsx";
import { PlatformDashboard } from "./platform.jsx";

const PLATFORM_KEY = "platform";
const SITES_KEY = "sites";

function genCode(len) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < (len || 6); i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function ensureSitesRegistry() {
  let sites = await loadShared(SITES_KEY, null);
  if (sites && sites.length > 0) return sites;
  const site = {
    id: "site-lowgarten",
    slug: "low-garten",
    name: LOWGARTEN_BRANDING.name,
    paletteId: LOWGARTEN_BRANDING.paletteId,
    clientCode: "GARTEN1",
    createdAt: new Date().toISOString(),
  };
  sites = [site];
  await saveShared(SITES_KEY, sites);
  await saveShared(siteKey(site.id, "products"), LOWGARTEN_PRODUCTS);
  await saveShared(siteKey(site.id, "categories"), LOWGARTEN_CATEGORIES);
  await saveShared(siteKey(site.id, "config"), LOWGARTEN_CONFIG);
  await saveShared(siteKey(site.id, "orders"), []);
  return sites;
}

async function ensurePlatformPasscode() {
  let auth = await loadShared(PLATFORM_KEY, null);
  if (auth && auth.passcode) return auth.passcode;
  const passcode = "ADMIN2026";
  await saveShared(PLATFORM_KEY, { passcode });
  return passcode;
}

function useToast() {
  const [toast, setToast] = useState(null);
  function showToast(msg) {
    const id = Date.now();
    setToast({ id, msg });
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 2600);
  }
  return [toast, showToast];
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 font-body">
      <p className="text-sm text-stone-400">Cargando...</p>
    </div>
  );
}

function NotFoundStore() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 font-body text-center px-4">
      <Store size={32} className="text-stone-300 mb-3" strokeWidth={1} />
      <p className="text-stone-500">No encontramos esta tienda.</p>
    </div>
  );
}

/* =========================================================
   Página 1: tienda pública (/t/:slug)
   ========================================================= */

function PublicStorePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [site, setSite] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [siteBranding, setSiteBranding] = useState({});
  const [toast, showToast] = useToast();

  const [screen, setScreen] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState("relevancia");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const productsSectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      const sites = await ensureSitesRegistry();
      const found = sites.find((s) => s.slug === slug);
      if (!found) { setReady(true); return; }
      const [p, c, cfg, o, b] = await Promise.all([
        loadShared(siteKey(found.id, "products"), []),
        loadShared(siteKey(found.id, "categories"), []),
        loadShared(siteKey(found.id, "config"), DEFAULT_SITE_CONFIG),
        loadShared(siteKey(found.id, "orders"), []),
        loadShared(siteKey(found.id, "branding"), {}),
      ]);
      setSite(found);
      setProducts(p);
      setCategories(c);
      setConfig({ ...DEFAULT_SITE_CONFIG, ...cfg });
      setOrders(o);
      setSiteBranding(b || {});
      setCart(loadPersonal(`cart:${found.id}`, []));
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const branding = site
    ? { name: site.name, paletteId: site.paletteId, heroStyle: site.heroStyle, radiusStyle: site.radiusStyle, ...siteBranding }
    : { name: "", paletteId: "verde-tierra" };
  const palette = getPalette(branding.paletteId);

  useEffect(() => {
    if (!site) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (branding.faviconImage) link.href = branding.faviconImage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, branding.faviconImage]);

  function addToCart(product, qty) {
    if (!site) return;
    const q = qty || 1;
    const existing = cart.find((i) => i.productId === product.id);
    const next = existing ? cart.map((i) => (i.productId === product.id ? { ...i, qty: i.qty + q } : i)) : [...cart, { productId: product.id, qty: q }];
    setCart(next);
    savePersonal(`cart:${site.id}`, next);
    showToast(`${product.name} agregado al carrito.`);
    setCartOpen(true);
  }
  function incCart(id) { const next = cart.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i)); setCart(next); savePersonal(`cart:${site.id}`, next); }
  function decCart(id) { const next = cart.map((i) => (i.productId === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)); setCart(next); savePersonal(`cart:${site.id}`, next); }
  function removeCart(id) { const next = cart.filter((i) => i.productId !== id); setCart(next); savePersonal(`cart:${site.id}`, next); }
  function clearCart() { setCart([]); savePersonal(`cart:${site.id}`, []); }

  const cartItems = useMemo(() => cart.map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) })).filter((i) => i.product), [cart, products]);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const waReady = !!(config.whatsapp && config.whatsapp.replace(/\D/g, "").length >= 8);

  function checkout(customer) {
    if (cartItems.length === 0 || !waReady || !site) return;
    const msg = buildWhatsAppMessage(cartItems, cartTotal, config, customer);
    const phone = (config.whatsapp || "").replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    const order = {
      id: genId("ord"),
      number: String(orders.length + 1).padStart(4, "0"),
      date: new Date().toISOString(),
      items: cartItems.map((i) => ({ productId: i.product.id, name: i.product.name, qty: i.qty, price: i.product.price })),
      total: cartTotal,
      status: "Pendiente",
      customerName: customer && customer.name ? customer.name : "",
      customerLocality: customer && customer.locality ? customer.locality : "",
    };
    const nextOrders = [order, ...orders];
    setOrders(nextOrders);
    saveShared(siteKey(site.id, "orders"), nextOrders);
    window.open(url, "_blank");
    clearCart();
    setCartOpen(false);
    showToast("Pedido enviado. Se abrió WhatsApp para confirmar.");
  }

  const activeProducts = useMemo(() => products.filter((p) => p.active), [products]);
  const filtersActive = searchQuery.trim() !== "" || activeCategory !== null || onlyFeatured || onlyOffers || sortBy !== "relevancia";

  const browseProducts = useMemo(() => {
    let list = [...activeProducts];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q)));
    }
    if (activeCategory) list = list.filter((p) => p.categoryId === activeCategory);
    if (onlyFeatured) list = list.filter((p) => p.featured);
    if (onlyOffers) list = list.filter((p) => p.comparePrice > p.price);
    if (sortBy === "precio-asc") list = list.sort((a, b) => a.price - b.price);
    else if (sortBy === "precio-desc") list = list.sort((a, b) => b.price - a.price);
    else if (sortBy === "nombre") list = list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [activeProducts, searchQuery, activeCategory, onlyFeatured, onlyOffers, sortBy]);

  function clearFilters() { setSearchQuery(""); setActiveCategory(null); setOnlyFeatured(false); setOnlyOffers(false); setSortBy("relevancia"); }
  function handleSearchChange(v) { setSearchQuery(v); if (screen !== "home") setScreen("home"); }
  function handleCategoryChange(id) { setActiveCategory(id); if (screen !== "home") setScreen("home"); }
  function viewProduct(id) { setSelectedProductId(id); setScreen("product"); window.scrollTo(0, 0); }
  function goHome() { setScreen("home"); setSelectedProductId(null); clearFilters(); window.scrollTo(0, 0); }

  if (!ready) return <LoadingScreen />;
  if (!site) return <NotFoundStore />;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className={`min-h-screen bg-stone-50 font-body text-stone-800 ${branding.radiusStyle === "sharp" ? "radius-sharp" : ""}`} style={paletteCssVars(palette)}>
      <style>{GLOBAL_CSS}</style>
      <Header
        branding={branding}
        categories={categories}
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onLogoClick={goHome}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
      />
      {screen === "product" ? (
        <ProductDetailScreen
          product={selectedProduct}
          category={categories.find((c) => c.id === (selectedProduct ? selectedProduct.categoryId : null))}
          related={activeProducts.filter((p) => selectedProduct && p.id !== selectedProduct.id && p.categoryId === selectedProduct.categoryId).slice(0, 4)}
          currency={config.currency}
          onBack={goHome}
          onAddMain={(p, qty) => addToCart(p, qty)}
          onViewProduct={viewProduct}
          onAddToCart={(p) => addToCart(p, 1)}
        />
      ) : (
        <HomeScreen
          branding={branding}
          config={config}
          categories={categories}
          activeProducts={activeProducts}
          filtersActive={filtersActive}
          browseProducts={browseProducts}
          onViewProduct={viewProduct}
          onAddToCart={(p) => addToCart(p, 1)}
          currency={config.currency}
          sortBy={sortBy} setSortBy={setSortBy}
          onlyFeatured={onlyFeatured} setOnlyFeatured={setOnlyFeatured}
          onlyOffers={onlyOffers} setOnlyOffers={setOnlyOffers}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          clearFilters={clearFilters}
          productsSectionRef={productsSectionRef}
          waLink={`https://wa.me/${(config.whatsapp || "").replace(/\D/g, "")}`}
          waReady={waReady}
        />
      )}
      <Footer branding={branding} config={config} showAdminLink onAdminClick={() => navigate(`/t/${slug}/admin`)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        currency={config.currency}
        onInc={incCart}
        onDec={decCart}
        onRemove={removeCart}
        onClear={clearCart}
        onCheckout={checkout}
        waReady={waReady}
      />
      <Toast toast={toast} />
    </div>
  );
}

/* =========================================================
   Página 2: panel de cada cliente (/t/:slug/admin)
   ========================================================= */

function ClientAdminPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [site, setSite] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);
  const [orders, setOrders] = useState([]);
  const [toast, showToast] = useToast();
  const [adminScreen, setAdminScreen] = useState("dashboard");
  const [editingProductId, setEditingProductId] = useState(undefined);

  useEffect(() => {
    (async () => {
      const sites = await ensureSitesRegistry();
      const found = sites.find((s) => s.slug === slug);
      if (!found) { setReady(true); return; }
      const [p, c, cfg, o] = await Promise.all([
        loadShared(siteKey(found.id, "products"), []),
        loadShared(siteKey(found.id, "categories"), []),
        loadShared(siteKey(found.id, "config"), DEFAULT_SITE_CONFIG),
        loadShared(siteKey(found.id, "orders"), []),
      ]);
      setSite(found);
      setProducts(p);
      setCategories(c);
      setConfig({ ...DEFAULT_SITE_CONFIG, ...cfg });
      setOrders(o);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function saveProduct(payload) {
    const exists = products.some((p) => p.id === payload.id);
    const next = exists ? products.map((p) => (p.id === payload.id ? payload : p)) : [payload, ...products];
    setProducts(next);
    saveShared(siteKey(site.id, "products"), next);
    showToast(exists ? "Producto actualizado." : "Producto agregado.");
    setEditingProductId(undefined);
    setAdminScreen("products");
  }
  function deleteProduct(id) {
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveShared(siteKey(site.id, "products"), next);
    showToast("Producto eliminado.");
  }
  function toggleProductField(id, field) {
    const next = products.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p));
    setProducts(next);
    saveShared(siteKey(site.id, "products"), next);
  }
  function saveCategory(payload) {
    const exists = categories.some((c) => c.id === payload.id);
    const merged = exists ? categories.map((c) => (c.id === payload.id ? payload : c)) : [...categories, payload];
    const next = merged.slice().sort((a, b) => a.order - b.order);
    setCategories(next);
    saveShared(siteKey(site.id, "categories"), next);
    showToast("Categoría guardada.");
  }
  function deleteCategory(id) {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    saveShared(siteKey(site.id, "categories"), next);
    const nextProducts = products.map((p) => (p.categoryId === id ? { ...p, categoryId: "" } : p));
    setProducts(nextProducts);
    saveShared(siteKey(site.id, "products"), nextProducts);
    showToast("Categoría eliminada.");
  }
  function saveConfig(payload) {
    setConfig(payload);
    saveShared(siteKey(site.id, "config"), payload);
    showToast("Configuración guardada.");
  }
  function setOrderStatus(id, status) {
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(next);
    saveShared(siteKey(site.id, "orders"), next);
  }
  function shareCatalog() {
    const list = products.filter((p) => p.active);
    if (list.length === 0) return;
    const msg = buildCatalogMessage(list, categories, { ...config, storeName: site.name });
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }
  function adminNavigate(screen, action) {
    if (screen === "products" && action === "new") { setEditingProductId(null); setAdminScreen("product-form"); return; }
    setAdminScreen(screen);
  }

  const waReady = !!(config.whatsapp && config.whatsapp.replace(/\D/g, "").length >= 8);

  if (!ready) return <LoadingScreen />;
  if (!site) return <NotFoundStore />;

  return (
    <div className="font-body">
      <style>{GLOBAL_CSS}</style>
      {!authed ? (
        <AccessGate
          icon={Lock}
          title={`Panel de ${site.name}`}
          subtitle="Ingresá el código de acceso que te compartieron."
          expectedCode={site.clientCode}
          onSuccess={() => setAuthed(true)}
          onBack={() => navigate(`/t/${slug}`)}
          backLabel="‹ Volver a la tienda"
        />
      ) : (
        <AdminShell
          branding={{ name: site.name }}
          adminScreen={adminScreen}
          setAdminScreen={setAdminScreen}
          onExit={() => navigate(`/t/${slug}`)}
          onLogout={() => setAuthed(false)}
        >
          {adminScreen === "dashboard" && <AdminDashboard products={products} categories={categories} orders={orders} onNavigate={adminNavigate} waReady={waReady} onShareCatalog={shareCatalog} />}
          {adminScreen === "products" && (
            <AdminProductsList
              products={products}
              categories={categories}
              currency={config.currency}
              onEdit={(id) => { setEditingProductId(id); setAdminScreen("product-form"); }}
              onNew={() => { setEditingProductId(null); setAdminScreen("product-form"); }}
              onToggleActive={(id) => toggleProductField(id, "active")}
              onDelete={deleteProduct}
              onShareCatalog={shareCatalog}
            />
          )}
          {adminScreen === "product-form" && (
            <AdminProductForm
              product={editingProductId ? products.find((p) => p.id === editingProductId) : null}
              categories={categories}
              currency={config.currency}
              onSave={saveProduct}
              onCancel={() => setAdminScreen("products")}
            />
          )}
          {adminScreen === "categories" && <AdminCategories categories={categories} onSave={saveCategory} onDelete={deleteCategory} />}
          {adminScreen === "orders" && <AdminOrders orders={orders} currency={config.currency} onStatusChange={setOrderStatus} />}
          {adminScreen === "config" && <AdminConfigForm config={config} onSave={saveConfig} />}
        </AdminShell>
      )}
      <Toast toast={toast} />
    </div>
  );
}

/* =========================================================
   Página 3: panel general (/panel)
   ========================================================= */

function PlatformPage() {
  const [ready, setReady] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [sites, setSites] = useState([]);
  const [toast, showToast] = useToast();

  useEffect(() => {
    (async () => {
      const [code, siteList] = await Promise.all([ensurePlatformPasscode(), ensureSitesRegistry()]);
      setPasscode(code);
      setSites(siteList);
      setReady(true);
    })();
  }, []);

  function persistSites(next) {
    setSites(next);
    saveShared(SITES_KEY, next);
  }

  async function onCreateSite(site) {
    const { branding, ...registryFields } = site;
    const clientCode = genCode(6);
    const full = { ...registryFields, clientCode, createdAt: new Date().toISOString() };
    const next = [...sites, full];
    persistSites(next);
    await Promise.all([
      saveShared(siteKey(full.id, "products"), []),
      saveShared(siteKey(full.id, "categories"), []),
      saveShared(siteKey(full.id, "config"), DEFAULT_SITE_CONFIG),
      saveShared(siteKey(full.id, "orders"), []),
      saveShared(siteKey(full.id, "branding"), branding || {}),
    ]);
    showToast(`Tienda "${full.name}" creada. Código de acceso: ${clientCode}`);
  }
  function onUpdateSite(site) {
    const { branding, ...registryFields } = site;
    const next = sites.map((s) => (s.id === site.id ? { ...s, name: registryFields.name, paletteId: registryFields.paletteId, heroStyle: registryFields.heroStyle, radiusStyle: registryFields.radiusStyle } : s));
    persistSites(next);
    saveShared(siteKey(site.id, "branding"), branding || {});
    showToast("Tienda actualizada.");
  }
  function onDeleteSite(id) {
    const next = sites.filter((s) => s.id !== id);
    persistSites(next);
    showToast("Tienda eliminada.");
  }
  function onRegenerateCode(id) {
    const newCode = genCode(6);
    const next = sites.map((s) => (s.id === id ? { ...s, clientCode: newCode } : s));
    persistSites(next);
    showToast(`Nuevo código: ${newCode}`);
  }

  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-stone-100 font-body">
      <style>{GLOBAL_CSS}</style>
      {!authed ? (
        <AccessGate icon={ShieldCheck} title="Panel general" subtitle="Acceso del administrador de la plataforma." expectedCode={passcode} onSuccess={() => setAuthed(true)} />
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <PlatformDashboard sites={sites} onCreateSite={onCreateSite} onUpdateSite={onUpdateSite} onDeleteSite={onDeleteSite} onRegenerateCode={onRegenerateCode} />
        </div>
      )}
      <Toast toast={toast} />
    </div>
  );
}

/* =========================================================
   Rutas
   ========================================================= */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/t/low-garten" replace />} />
      <Route path="/panel" element={<PlatformPage />} />
      <Route path="/t/:slug/admin" element={<ClientAdminPage />} />
      <Route path="/t/:slug" element={<PublicStorePage />} />
      <Route path="*" element={<Navigate to="/t/low-garten" replace />} />
    </Routes>
  );
}
