import { useState } from "react";
import {
  Plus, Minus, Trash2, Star, Pencil, Check, X, ArrowLeft, LogOut, Package,
  Tags, ClipboardList, Settings, LayoutDashboard, AlertCircle, Share2, Lock,
  Image as ImageIcon,
} from "lucide-react";
import { fmt, genId, ICON_MAP, ICON_CHOICES } from "./lib.js";
import { Field, Toggle, ImageSlot, ProductArt, inputCls } from "./ui.jsx";

const ORDER_STATUSES = ["Pendiente", "Confirmado", "Preparando", "Enviado", "Entregado", "Cancelado"];
export const ADMIN_TABS = [
  { id: "dashboard", label: "Resumen", Icon: LayoutDashboard },
  { id: "products", label: "Productos", Icon: Package },
  { id: "categories", label: "Categorías", Icon: Tags },
  { id: "orders", label: "Pedidos", Icon: ClipboardList },
  { id: "config", label: "Configuración", Icon: Settings },
];

export function AdminShell({ branding, adminScreen, setAdminScreen, onExit, onLogout, children, tabs }) {
  const tabList = tabs || ADMIN_TABS;
  return (
    <div className="min-h-screen bg-stone-100 font-body">
      <div className="bg-stone-900 text-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Lock size={14} className="text-stone-400 shrink-0" />
            <span className="font-display font-semibold text-sm truncate">{branding.name} · Panel</span>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <button type="button" onClick={onExit} className="text-stone-300 hover:text-white">Ver tienda</button>
            <button type="button" onClick={onLogout} className="text-stone-300 hover:text-white inline-flex items-center gap-1">
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto no-scrollbar pb-2">
          {tabList.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setAdminScreen(t.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${adminScreen === t.id ? "bg-white text-stone-900" : "text-stone-400 hover:text-white"}`}
            >
              <t.Icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}

export function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col items-center gap-2 hover:border-stone-400 hover:shadow-sm transition text-center">
      <span className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center"><Icon size={17} /></span>
      <span className="text-xs font-medium text-stone-700">{label}</span>
    </button>
  );
}

export function AdminDashboard({ products, categories, orders, onNavigate, waReady, onShareCatalog, productLimit }) {
  const stats = [
    { label: productLimit ? `Productos (${products.length}/${productLimit})` : "Productos", value: products.length },
    { label: "Activos", value: products.filter((p) => p.active).length },
    { label: "Agotados", value: products.filter((p) => !p.inStock).length },
    { label: "Categorías", value: categories.length },
    { label: "Destacados", value: products.filter((p) => p.featured).length },
    { label: "Pedidos pendientes", value: orders.filter((o) => o.status === "Pendiente").length },
  ];
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Resumen</h1>
      {!waReady && (
        <div className="mb-6 flex items-start gap-2.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl p-4 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Falta configurar el WhatsApp de la tienda.</p>
            <button type="button" onClick={() => onNavigate("config")} className="underline font-medium">Ir a configuración</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="font-mono-data text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="font-mono-data text-xs uppercase tracking-wider text-stone-400 mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <QuickAction
          icon={Plus}
          label={productLimit !== null && productLimit !== undefined && products.length >= productLimit ? "Límite alcanzado" : "Agregar producto"}
          onClick={() => onNavigate("products", "new")}
        />
        <QuickAction icon={Package} label="Ver productos" onClick={() => onNavigate("products")} />
        <QuickAction icon={Tags} label="Categorías" onClick={() => onNavigate("categories")} />
        <QuickAction icon={Share2} label="Compartir catálogo" onClick={onShareCatalog} />
        <QuickAction icon={Settings} label="Configuración" onClick={() => onNavigate("config")} />
      </div>
    </div>
  );
}

export function AdminProductsList({ products, categories, currency, onEdit, onNew, onToggleActive, onDelete, onShareCatalog, productLimit }) {
  const [confirmId, setConfirmId] = useState(null);
  const [q, setQ] = useState("");
  const atLimit = productLimit !== null && productLimit !== undefined && products.length >= productLimit;
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Productos</h1>
          {productLimit !== null && productLimit !== undefined && (
            <p className="text-xs text-stone-400 mt-0.5">{products.length} / {productLimit} productos usados</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onShareCatalog} className="inline-flex items-center gap-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-700 text-sm font-semibold rounded-full px-4 py-2.5 transition">
            <Share2 size={16} /> Compartir catálogo
          </button>
          <button
            type="button"
            onClick={onNew}
            disabled={atLimit}
            title={atLimit ? `Alcanzaste el límite de ${productLimit} productos` : undefined}
            className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-full px-4 py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} /> Agregar producto
          </button>
        </div>
      </div>
      {atLimit && (
        <div className="mb-4 flex items-start gap-2.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl p-3.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>Alcanzaste el límite de {productLimit} productos de tu plan. Para cargar más, contactá a quien te dio de alta.</p>
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto..." className="w-full sm:w-72 border border-stone-300 rounded-full px-4 py-2 text-sm mb-4 focus:outline-none" />
      <div className="space-y-2.5">
        {filtered.length === 0 && <p className="text-sm text-stone-400 py-10 text-center">No hay productos que coincidan.</p>}
        {filtered.map((p) => {
          const cat = categories.find((c) => c.id === p.categoryId);
          return (
            <div key={p.id} className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-stone-200 relative overflow-hidden shrink-0">
                {p.images && p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <ProductArt name={p.name} size="mini" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-stone-900 text-sm truncate">{p.name}</p>
                  {p.featured && <Star size={13} className="text-amber-600 shrink-0" fill="currentColor" />}
                  {!p.inStock && <span className="text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full shrink-0">Agotado</span>}
                  {!p.active && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full shrink-0">Inactivo</span>}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {cat ? cat.name : "Sin categoría"} · <span className="font-mono-data">{fmt(p.price, currency)}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onToggleActive(p.id)} title={p.active ? "Desactivar" : "Activar"} className={`w-8 h-8 rounded-full flex items-center justify-center ${p.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>
                  <Check size={14} />
                </button>
                <button type="button" onClick={() => onEdit(p.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200">
                  <Pencil size={14} />
                </button>
                {confirmId === p.id ? (
                  <button type="button" onClick={() => { onDelete(p.id); setConfirmId(null); }} className="text-xs font-semibold bg-red-700 text-white rounded-full px-2.5 py-1.5">
                    ¿Confirmar?
                  </button>
                ) : (
                  <button type="button" onClick={() => setConfirmId(p.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminProductForm({ product, categories, currency, onSave, onCancel }) {
  const isNew = !product;
  const [form, setForm] = useState(() =>
    product
      ? { ...product, price: String(product.price), comparePrice: product.comparePrice ? String(product.comparePrice) : "", tags: (product.tags || []).join(", "), images: product.images && product.images.length ? [...product.images] : [""] }
      : { name: "", shortDescription: "", description: "", price: "", comparePrice: "", categoryId: categories[0] ? categories[0].id : "", tags: "", images: [""], inStock: true, featured: false, active: true }
  );
  const [errors, setErrors] = useState({});

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }
  function setImage(i, val) { setForm((f) => { const imgs = [...f.images]; imgs[i] = val; return { ...f, images: imgs }; }); }
  function addImage() { setForm((f) => ({ ...f, images: [...f.images, ""] })); }
  function removeImage(i) { setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ingresá un nombre.";
    if (!form.categoryId) e.categoryId = "Elegí una categoría.";
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) e.price = "Ingresá un precio válido.";
    if (form.comparePrice) {
      const cp = Number(form.comparePrice);
      if (isNaN(cp) || cp <= priceNum) e.comparePrice = "Debe ser mayor al precio actual.";
    }
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const cleanImages = form.images.map((s) => s.trim()).filter(Boolean);
    const tagsArr = form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    onSave({
      id: product ? product.id : genId("prod"),
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : 0,
      categoryId: form.categoryId,
      tags: tagsArr,
      images: cleanImages,
      inStock: !!form.inStock,
      featured: !!form.featured,
      active: !!form.active,
      order: product ? product.order : Date.now(),
      createdAt: product ? product.createdAt : new Date().toISOString(),
    });
  }

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft size={15} /> Volver a productos
      </button>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">{isNew ? "Agregar producto" : "Editar producto"}</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 space-y-5 max-w-2xl">
        <Field label="Nombre" error={errors.name}>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} placeholder="Ej: Remera básica" />
        </Field>
        <Field label="Descripción corta">
          <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls()} placeholder="Una frase para la tarjeta del producto" />
        </Field>
        <Field label="Descripción completa">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls()} placeholder="Detalle del producto..." />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={`Precio (${currency})`} error={errors.price}>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls(errors.price)} placeholder="0" />
          </Field>
          <Field label={`Precio anterior / oferta (${currency})`} error={errors.comparePrice}>
            <input type="number" min="0" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} className={inputCls(errors.comparePrice)} placeholder="Opcional" />
          </Field>
        </div>
        <Field label="Categoría" error={errors.categoryId}>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls(errors.categoryId)}>
            <option value="">Seleccionar...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Etiquetas (separadas por coma)">
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls()} placeholder="ej: verano, oferta" />
        </Field>
        <Field label="Fotos del producto">
          <div className="space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageSlot value={img} onChange={(v) => setImage(i, v)} label={i === 0 ? "Foto principal" : `Foto adicional ${i}`} />
                </div>
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(i)} className="w-9 h-9 mt-0.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-700 flex items-center justify-center shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addImage} className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
              <Plus size={13} /> Agregar otra foto
            </button>
            <p className="text-xs text-stone-400 flex items-start gap-1.5">
              <ImageIcon size={13} className="mt-0.5 shrink-0" /> La primera foto es la principal. Podés subirla desde tu celular o pegar un link.
            </p>
          </div>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Toggle label="Destacado" checked={form.featured} onChange={(v) => set("featured", v)} />
          <Toggle label="Disponible" checked={form.inStock} onChange={(v) => set("inStock", v)} />
          <Toggle label="Activo" checked={form.active} onChange={(v) => set("active", v)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 transition">Guardar producto</button>
          <button type="button" onClick={onCancel} className="rounded-full border border-stone-300 text-stone-600 font-semibold px-6 hover:bg-stone-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

function CategoryForm({ category, onCancel, onSave }) {
  const [name, setName] = useState(category ? category.name : "");
  const [icon, setIcon] = useState(category ? category.icon : "Tag");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Ingresá un nombre."); return; }
    onSave({ id: category ? category.id : genId("cat"), name: name.trim(), icon, order: category ? category.order : Date.now() });
  }

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft size={15} /> Volver a categorías
      </button>
      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-5 max-w-md">
        <Field label="Nombre" error={error}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls(error)} placeholder="Ej: Remeras" />
        </Field>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Ícono</label>
          <div className="flex flex-wrap gap-2">
            {ICON_CHOICES.map((key) => {
              const Icon = ICON_MAP[key];
              return (
                <button type="button" key={key} onClick={() => setIcon(key)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${icon === key ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-500 border-stone-200"}`}>
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3">Guardar categoría</button>
      </form>
    </div>
  );
}

export function AdminCategories({ categories, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  if (editing) {
    return <CategoryForm category={editing === "new" ? null : editing} onCancel={() => setEditing(null)} onSave={(c) => { onSave(c); setEditing(null); }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold text-stone-900">Categorías</h1>
        <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-full px-4 py-2.5">
          <Plus size={16} /> Nueva categoría
        </button>
      </div>
      <div className="space-y-2.5">
        {categories.length === 0 && <p className="text-sm text-stone-400 py-10 text-center">Todavía no creaste categorías.</p>}
        {categories.map((c) => {
          const Icon = ICON_MAP[c.icon] || ICON_MAP.Tag;
          return (
            <div key={c.id} className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0"><Icon size={17} /></span>
              <p className="flex-1 font-medium text-stone-900 text-sm">{c.name}</p>
              <button type="button" onClick={() => setEditing(c)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200">
                <Pencil size={14} />
              </button>
              {confirmId === c.id ? (
                <button type="button" onClick={() => { onDelete(c.id); setConfirmId(null); }} className="text-xs font-semibold bg-red-700 text-white rounded-full px-2.5 py-1.5">¿Confirmar?</button>
              ) : (
                <button type="button" onClick={() => setConfirmId(c.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminOrders({ orders, currency, onStatusChange }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-stone-400 py-10 text-center">Todavía no hay pedidos registrados.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-stone-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-mono-data font-semibold text-stone-900">#{o.number}</p>
                <p className="text-xs text-stone-400">{new Date(o.date).toLocaleString("es-AR")}</p>
              </div>
              {(o.customerName || o.customerLocality) && (
                <p className="text-sm text-stone-700 font-medium mb-1.5">
                  {o.customerName}{o.customerName && o.customerLocality ? " · " : ""}{o.customerLocality}
                </p>
              )}
              <ul className="text-sm text-stone-600 mb-2 space-y-0.5">
                {o.items.map((it, i) => <li key={i}>{it.qty} x {it.name}</li>)}
              </ul>
              <div className="flex items-center justify-between">
                <span className="font-mono-data font-bold text-stone-900">{fmt(o.total, currency)}</span>
                <select value={o.status} onChange={(e) => onStatusChange(o.id, e.target.value)} className="text-xs border border-stone-300 rounded-full px-3 py-1.5 focus:outline-none">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminConfigForm({ config, onSave }) {
  const [form, setForm] = useState({ ...config });
  function set(f, v) { setForm((s) => ({ ...s, [f]: v })); }
  function submit(e) { e.preventDefault(); onSave(form); }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Configuración</h1>
      <p className="text-sm text-stone-500 -mt-3 mb-5">Estos son los datos de contacto y textos de tu tienda. El nombre y el diseño los maneja quien te dio de alta.</p>
      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 space-y-5 max-w-xl">
        <Field label="Frase principal (hero)">
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls()} />
        </Field>
        <Field label="Texto del botón principal">
          <input value={form.heroButtonText} onChange={(e) => set("heroButtonText", e.target.value)} className={inputCls()} placeholder="Ver productos" />
        </Field>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Tamaño del logo</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "sm", label: "Chico" },
              { id: "md", label: "Mediano" },
              { id: "lg", label: "Grande" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => set("logoSize", opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${form.logoSize === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Tamaño del nombre</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "sm", label: "Chico" },
              { id: "md", label: "Mediano" },
              { id: "lg", label: "Grande" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => set("nameSize", opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${form.nameSize === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Posición del logo en el encabezado</label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: "left", label: "Izquierda" },
              { id: "center", label: "Centro" },
              { id: "right", label: "Derecha" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => set("headerLayout", opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${form.headerLayout === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-1.5">El resto del encabezado (buscador, carrito) se acomoda solo, sin superponerse.</p>
        </div>
        <Field label="Texto de bienvenida">
          <textarea rows={3} value={form.welcomeText} onChange={(e) => set("welcomeText", e.target.value)} className={inputCls()} />
        </Field>
        <Field label="Fotos destacadas (carrusel en la portada)">
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <ImageSlot
                key={i}
                label={`Foto ${i + 1}`}
                value={form.carouselImages && form.carouselImages[i] ? form.carouselImages[i] : ""}
                onChange={(v) => {
                  const next = [form.carouselImages && form.carouselImages[0] ? form.carouselImages[0] : "", form.carouselImages && form.carouselImages[1] ? form.carouselImages[1] : "", form.carouselImages && form.carouselImages[2] ? form.carouselImages[2] : ""];
                  next[i] = v;
                  set("carouselImages", next);
                }}
                maxDim={1200}
                quality={0.7}
              />
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-1.5">Elegí hasta 3 fotos llamativas de tus productos. Van a ir rotando solas arriba de la tienda.</p>
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="WhatsApp (con código de país, solo números)">
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls()} placeholder="541112345678" />
            <p className="text-xs text-stone-400 mt-1">Tu número de WhatsApp habitual, con código de país. Ej: si tu celular es 11 1234-5678, poné 541112345678.</p>
          </Field>
          <Field label="Moneda">
            <input value={form.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls()} placeholder="$" />
          </Field>
        </div>
        <Field label="Dirección">
          <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls()} />
        </Field>
        <Field label="Horarios">
          <input value={form.hours} onChange={(e) => set("hours", e.target.value)} className={inputCls()} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Instagram (usuario)">
            <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputCls()} placeholder="tuusuario" />
          </Field>
          <Field label="Facebook (link)">
            <input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputCls()} />
          </Field>
        </div>
        <Field label="Código QR de Instagram">
          <ImageSlot value={form.instagramQrImage} onChange={(v) => set("instagramQrImage", v)} label="Se muestra en el pie de la tienda" />
        </Field>
        <Field label="Mensaje de WhatsApp — introducción">
          <input value={form.whatsappIntro} onChange={(e) => set("whatsappIntro", e.target.value)} className={inputCls()} />
        </Field>
        <Field label="Mensaje de WhatsApp — cierre">
          <input value={form.whatsappOutro} onChange={(e) => set("whatsappOutro", e.target.value)} className={inputCls()} />
        </Field>
        <button type="submit" className="rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold px-6 py-3">Guardar cambios</button>
      </form>
    </div>
  );
}
