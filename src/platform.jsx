import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, ArrowLeft, Share2, ExternalLink, Store, RefreshCw,
  Image as ImageIcon, Rows, Square, SquareStack,
} from "lucide-react";
import { PRESET_PALETTES, getPalette, genId, slugify, loadShared, siteKey, DEFAULT_SITE_CONFIG } from "./lib.js";
import { Field, inputCls, ImageSlot } from "./ui.jsx";

function PaletteSwatch({ palette, size }) {
  const s = size || 32;
  return (
    <div className="rounded-full overflow-hidden flex shrink-0" style={{ width: s, height: s }}>
      <div style={{ background: palette.ink, width: "34%", height: "100%" }} />
      <div style={{ background: palette.primary, width: "33%", height: "100%" }} />
      <div style={{ background: palette.accent, width: "33%", height: "100%" }} />
    </div>
  );
}

function PalettePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
      {PRESET_PALETTES.map((p) => (
        <button
          type="button"
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition ${value === p.id ? "border-stone-900 ring-1 ring-stone-900" : "border-stone-200 hover:border-stone-400"}`}
        >
          <PaletteSwatch palette={p} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{p.name}</p>
            <p className="text-xs text-stone-400 truncate">{p.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

const HERO_STYLES = [
  { id: "text", label: "Solo texto", Icon: Rows },
  { id: "full", label: "Imagen de fondo", Icon: SquareStack },
  { id: "side", label: "Imagen al costado", Icon: ImageIcon },
];

function HeroStylePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {HERO_STYLES.map((s) => (
        <button
          type="button"
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${value === s.id ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}
        >
          <s.Icon size={18} className="text-stone-600" />
          <span className="text-xs font-medium text-stone-700 text-center">{s.label}</span>
        </button>
      ))}
    </div>
  );
}

function RadiusPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={() => onChange("rounded")}
        className={`flex items-center gap-2.5 rounded-2xl border p-3 transition ${value === "rounded" ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}
      >
        <span className="w-8 h-8 bg-stone-300 rounded-2xl shrink-0" />
        <span className="text-xs font-medium text-stone-700">Redondeado</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("sharp")}
        className={`flex items-center gap-2.5 rounded-lg border p-3 transition ${value === "sharp" ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}
      >
        <span className="w-8 h-8 bg-stone-300 rounded-md shrink-0" />
        <span className="text-xs font-medium text-stone-700">Recto</span>
      </button>
    </div>
  );
}

function SiteForm({ site, onCancel, onSave, existingSlugs }) {
  const isNew = !site;
  const [name, setName] = useState(site ? site.name : "");
  const [businessType, setBusinessType] = useState(site && site.businessType ? site.businessType : "tienda");
  const [paletteId, setPaletteId] = useState(site ? site.paletteId : PRESET_PALETTES[0].id);
  const [heroStyle, setHeroStyle] = useState(site && site.heroStyle ? site.heroStyle : "text");
  const [radiusStyle, setRadiusStyle] = useState(site && site.radiusStyle ? site.radiusStyle : "rounded");
  const [productLimit, setProductLimit] = useState(site && site.productLimit ? String(site.productLimit) : "");
  const [logoImage, setLogoImage] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [faviconImage, setFaviconImage] = useState("");
  const [logoSize, setLogoSize] = useState("md");
  const [nameSize, setNameSize] = useState("md");
  const [headerLayout, setHeaderLayout] = useState("left");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!site) return;
    (async () => {
      const [branding, cfg] = await Promise.all([
        loadShared(siteKey(site.id, "branding"), {}),
        loadShared(siteKey(site.id, "config"), DEFAULT_SITE_CONFIG),
      ]);
      setLogoImage(branding.logoImage || "");
      setHeroImage(branding.heroImage || "");
      setFaviconImage(branding.faviconImage || "");
      setLogoSize((cfg && cfg.logoSize) || "md");
      setNameSize((cfg && cfg.nameSize) || "md");
      setHeaderLayout((cfg && cfg.headerLayout) || "left");
    })();
  }, [site]);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Ingresá un nombre."); return; }
    const branding = { logoImage, heroImage, faviconImage };
    const limit = productLimit.trim() ? Math.max(0, parseInt(productLimit, 10) || 0) : null;
    if (isNew) {
      let slug = slugify(name);
      let n = 2;
      while (existingSlugs.includes(slug)) { slug = `${slugify(name)}-${n}`; n += 1; }
      onSave({ id: genId("site"), slug, name: name.trim(), businessType, paletteId, heroStyle, radiusStyle, productLimit: limit, branding, logoSize, nameSize, headerLayout });
    } else {
      onSave({ ...site, name: name.trim(), paletteId, heroStyle, radiusStyle, productLimit: limit, branding, logoSize, nameSize, headerLayout });
    }
  }

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft size={15} /> Volver a mis tiendas
      </button>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">{isNew ? "Crear tienda" : "Editar tienda"}</h1>
      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 max-w-lg">
        <Field label="Nombre de la tienda" error={error}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls(error)} placeholder="Ej: Panadería Doña Rosa" />
        </Field>
        {!isNew && <p className="text-xs text-stone-400 -mt-4">Link de la tienda: /t/{site.slug} (no se puede cambiar).</p>}

        {isNew && (
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Tipo de negocio</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBusinessType("tienda")}
                className={`rounded-2xl border p-3.5 text-left transition ${businessType === "tienda" ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}
              >
                <p className="text-sm font-semibold text-stone-900">Tienda</p>
                <p className="text-xs text-stone-400 mt-0.5">Catálogo de productos, carrito y pedidos por WhatsApp.</p>
              </button>
              <button
                type="button"
                onClick={() => setBusinessType("estetica")}
                className={`rounded-2xl border p-3.5 text-left transition ${businessType === "estetica" ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-400"}`}
              >
                <p className="text-sm font-semibold text-stone-900">Centro de estética</p>
                <p className="text-xs text-stone-400 mt-0.5">Servicios con reserva de turnos por calendario.</p>
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-1.5">No se puede cambiar después de crear la tienda.</p>
          </div>
        )}
        {!isNew && (
          <p className="text-xs text-stone-400 -mt-4">
            Tipo de negocio: <span className="font-medium text-stone-600">{site.businessType === "estetica" ? "Centro de estética" : "Tienda"}</span> (no se puede cambiar).
          </p>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Paleta de diseño</label>
          <PalettePicker value={paletteId} onChange={setPaletteId} />
        </div>

        <Field label="Logo (reemplaza la inicial en el encabezado)">
          <ImageSlot value={logoImage} onChange={setLogoImage} maxDim={500} quality={0.85} />
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
                onClick={() => setLogoSize(opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${logoSize === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-1.5">El cliente puede volver a cambiarlo desde su propio panel.</p>
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
                onClick={() => setNameSize(opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${nameSize === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
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
                onClick={() => setHeaderLayout(opt.id)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${headerLayout === opt.id ? "border-stone-900 bg-stone-50 text-stone-900" : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-1.5">El buscador y el carrito se acomodan solos para no superponerse.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Estilo de portada</label>
          <HeroStylePicker value={heroStyle} onChange={setHeroStyle} />
        </div>

        {heroStyle !== "text" && (
          <Field label={heroStyle === "full" ? "Imagen de fondo de la portada" : "Imagen al costado de la portada"}>
            <ImageSlot value={heroImage} onChange={setHeroImage} maxDim={1400} quality={0.65} aspect="wide" />
          </Field>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Estilo de bordes</label>
          <RadiusPicker value={radiusStyle} onChange={setRadiusStyle} />
        </div>

        <Field label="Ícono de la pestaña del navegador (favicon)">
          <ImageSlot value={faviconImage} onChange={setFaviconImage} maxDim={256} quality={0.85} />
        </Field>

        <Field label={`Límite de ${(site ? site.businessType : businessType) === "estetica" ? "servicios" : "productos"} (opcional)`}>
          <input
            type="number"
            min="0"
            value={productLimit}
            onChange={(e) => setProductLimit(e.target.value)}
            className={inputCls()}
            placeholder="Sin límite"
          />
          <p className="text-xs text-stone-400 mt-1">Dejalo vacío para que el cliente pueda cargar sin límite.</p>
        </Field>

        <button type="submit" className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3">
          {isNew ? "Crear tienda" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export function PlatformDashboard({ sites, onCreateSite, onUpdateSite, onDeleteSite, onRegenerateCode }) {
  const [view, setView] = useState("list"); // 'list' | 'new' | site object being edited
  const [confirmId, setConfirmId] = useState(null);

  if (view === "new" || (view && typeof view === "object")) {
    const editingSite = view === "new" ? null : view;
    return (
      <SiteForm
        site={editingSite}
        existingSlugs={sites.map((s) => s.slug)}
        onCancel={() => setView("list")}
        onSave={(site) => {
          if (editingSite) onUpdateSite(site);
          else onCreateSite(site);
          setView("list");
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl font-bold text-stone-900">Mis tiendas</h1>
        <button type="button" onClick={() => setView("new")} className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-full px-4 py-2.5">
          <Plus size={16} /> Crear tienda
        </button>
      </div>
      <p className="text-sm text-stone-500 mb-6">Acá manejás el nombre y el diseño de cada tienda. Cada cliente entra a la suya con el link y el código que le compartas.</p>
      {sites.length === 0 ? (
        <div className="text-center py-16 text-stone-400 bg-white border border-stone-200 rounded-3xl">
          <Store size={32} className="mx-auto mb-3" strokeWidth={1} />
          <p>Todavía no creaste ninguna tienda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map((s) => {
            const palette = getPalette(s.paletteId);
            const storeUrl = `/t/${s.slug}`;
            const shareMsg = `Hola! Ya está lista tu tienda "${s.name}".\n\nEntrá al panel para cargar tus productos:\n${window.location.origin}${storeUrl}/admin\n\nTu código de acceso es: ${s.clientCode}`;
            return (
              <div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <PaletteSwatch palette={palette} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 truncate">{s.name}</p>
                    <p className="text-xs text-stone-400">{palette.name} · /t/{s.slug}{s.productLimit ? ` · límite ${s.productLimit} productos` : ""}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a href={storeUrl} target="_blank" rel="noreferrer" className="text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                    <ExternalLink size={12} /> Ver tienda
                  </a>
                  <span className="text-xs bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5 font-mono-data text-stone-600">Código: {s.clientCode}</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    <Share2 size={12} /> Enviar acceso por WhatsApp
                  </a>
                  <button type="button" onClick={() => onRegenerateCode(s.id)} className="text-xs font-medium text-stone-500 hover:text-stone-800 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                    <RefreshCw size={12} /> Regenerar código
                  </button>
                  <button type="button" onClick={() => setView(s)} className="text-xs font-medium text-stone-500 hover:text-stone-800 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                    <Pencil size={12} /> Editar
                  </button>
                  {confirmId === s.id ? (
                    <button type="button" onClick={() => { onDeleteSite(s.id); setConfirmId(null); }} className="text-xs font-semibold bg-red-700 text-white rounded-full px-3 py-1.5">
                      ¿Eliminar esta tienda?
                    </button>
                  ) : (
                    <button type="button" onClick={() => setConfirmId(s.id)} className="text-xs font-medium text-red-600 hover:text-red-800 rounded-full px-3 py-1.5 inline-flex items-center gap-1">
                      <Trash2 size={12} /> Eliminar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
