import {
  Leaf, Mountain, Sprout, Microscope, Droplets, Sun, FlaskConical, Flame,
  Coffee, Shirt, Utensils, Gift, Heart, Sparkles, Package, Tag, Palette,
  Scissors, Dumbbell, BookOpen, Music,
} from "lucide-react";

/* ============ Paletas de diseño (kits de color + tipografía) ============ */

export const PRESET_PALETTES = [
  {
    id: "verde-tierra",
    name: "Verde Tierra",
    description: "Orgánico, tierra y hojas",
    primary: "#065f46",
    primaryHover: "#064e3b",
    ink: "#1c1917",
    inkSoft: "#3a2a18",
    accent: "#9a3412",
    surfaceTint: "#fffbeb",
    fontDisplay: "Fraunces",
  },
  {
    id: "oceano",
    name: "Océano",
    description: "Fresco, claro, confiable",
    primary: "#0e7490",
    primaryHover: "#155e75",
    ink: "#0f172a",
    inkSoft: "#1e3a5f",
    accent: "#d97706",
    surfaceTint: "#f0f9ff",
    fontDisplay: "Playfair Display",
  },
  {
    id: "atardecer",
    name: "Atardecer",
    description: "Cálido, energético",
    primary: "#c2410c",
    primaryHover: "#9a3412",
    ink: "#292524",
    inkSoft: "#44281c",
    accent: "#a16207",
    surfaceTint: "#fff7ed",
    fontDisplay: "DM Serif Display",
  },
  {
    id: "berries",
    name: "Berries",
    description: "Intenso, moderno",
    primary: "#9d174d",
    primaryHover: "#831843",
    ink: "#18181b",
    inkSoft: "#3b1030",
    accent: "#7e22ce",
    surfaceTint: "#fdf2f8",
    fontDisplay: "Fraunces",
  },
  {
    id: "monocromo",
    name: "Monocromo",
    description: "Minimal, elegante",
    primary: "#18181b",
    primaryHover: "#000000",
    ink: "#09090b",
    inkSoft: "#27272a",
    accent: "#71717a",
    surfaceTint: "#fafafa",
    fontDisplay: "Inter",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    description: "Suave, premium",
    primary: "#6d28d9",
    primaryHover: "#5b21b6",
    ink: "#1e1b3a",
    inkSoft: "#332a5c",
    accent: "#be185d",
    surfaceTint: "#f5f3ff",
    fontDisplay: "Fraunces",
  },
];

export function getPalette(id) {
  return PRESET_PALETTES.find((p) => p.id === id) || PRESET_PALETTES[0];
}

export function paletteCssVars(palette) {
  return {
    "--brand-primary": palette.primary,
    "--brand-primary-hover": palette.primaryHover,
    "--brand-ink": palette.ink,
    "--brand-ink-soft": palette.inkSoft,
    "--brand-accent": palette.accent,
    "--brand-surface": palette.surfaceTint,
    "--font-display": `'${palette.fontDisplay}', serif`,
  };
}

export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Playfair+Display:wght@600;700&family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
.font-display{font-family:var(--font-display, 'Fraunces', serif);}
.font-body{font-family:'Inter',ui-sans-serif,sans-serif;}
.font-mono-data{font-family:'Space Mono',ui-monospace,monospace;}
.bg-brand{background-color:var(--brand-primary);}
.bg-brand-hover:hover{background-color:var(--brand-primary-hover);}
.text-brand{color:var(--brand-primary);}
.border-brand{border-color:var(--brand-primary);}
.bg-brand-ink{background-color:var(--brand-ink);}
.bg-brand-ink-soft{background-color:var(--brand-ink-soft);}
.text-brand-accent{color:var(--brand-accent);}
.bg-brand-accent{background-color:var(--brand-accent);}
.bg-brand-surface{background-color:var(--brand-surface);}
.ring-brand:focus{outline:none;box-shadow:0 0 0 2px var(--brand-primary);}
.no-scrollbar::-webkit-scrollbar{display:none;}
.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}
.organic-bg{background-color:#fafaf9;}
@keyframes lg-fade-in{from{opacity:0;transform:translate(-50%,8px);}to{opacity:1;transform:translate(-50%,0);}}
.lg-toast{animation:lg-fade-in .25s ease;}
@keyframes lg-slide-in{from{transform:translateX(100%);}to{transform:translateX(0);}}
.lg-drawer{animation:lg-slide-in .3s cubic-bezier(.16,1,.3,1);}
@media (prefers-reduced-motion: reduce){ *{animation-duration:0.01ms !important; transition-duration:0.01ms !important;} }
`;

/* ============ Íconos de categorías (set amplio, no solo huerta) ============ */

export const ICON_MAP = {
  Leaf, Mountain, Sprout, Microscope, Droplets, Sun, FlaskConical, Flame,
  Coffee, Shirt, Utensils, Gift, Heart, Sparkles, Package, Tag, Palette,
  Scissors, Dumbbell, BookOpen, Music,
};
export const ICON_CHOICES = Object.keys(ICON_MAP);

/* ============ Ids, slugs, formato ============ */

let __idSeq = 0;
export function genId(prefix) {
  __idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${__idSeq}`;
}

export function slugify(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "tienda";
}

export function fmt(n, currency) {
  const cur = currency || "$";
  const num = Number(n) || 0;
  return `${cur}${num.toLocaleString("es-AR")}`;
}

export function calcDiscount(price, comparePrice) {
  const p = Number(price) || 0;
  const cp = Number(comparePrice) || 0;
  if (!cp || cp <= p) return 0;
  return Math.round((1 - p / cp) * 100);
}

export function formatPhoneDisplay(digits) {
  if (!digits) return "";
  if (digits.length === 13 && digits.startsWith("549")) {
    const area = digits.slice(3, 5);
    const rest = digits.slice(5);
    return `+54 9 ${area} ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `+${digits}`;
}

export function buildWhatsAppMessage(cartItems, total, config, customer) {
  const lines = [];
  lines.push(config.whatsappIntro || "Hola! Quiero realizar el siguiente pedido:");
  lines.push("");
  lines.push("🛒 MI PEDIDO");
  lines.push("");
  cartItems.forEach((ci) => {
    lines.push(`${ci.qty} x ${ci.product.name} — ${fmt(ci.product.price * ci.qty, config.currency)}`);
  });
  lines.push("");
  lines.push(`TOTAL: ${fmt(total, config.currency)}`);
  lines.push("");
  if (customer && customer.name) lines.push(`👤 Nombre: ${customer.name}`);
  if (customer && customer.locality) lines.push(`📍 Localidad: ${customer.locality}`);
  if (customer && (customer.name || customer.locality)) lines.push("");
  lines.push(config.whatsappOutro || "Espero confirmación del pedido. ¡Gracias!");
  return lines.join("\n");
}

export function buildCatalogMessage(products, categories, config) {
  const lines = [];
  lines.push(`🛍️ CATÁLOGO — ${config.storeName || ""}`);
  if (config.tagline) lines.push(config.tagline);
  categories.forEach((cat) => {
    const items = products.filter((p) => p.categoryId === cat.id);
    if (items.length === 0) return;
    lines.push("");
    lines.push(`— ${cat.name} —`);
    items.forEach((p) => {
      const priceTxt = p.comparePrice > p.price ? `${fmt(p.price, config.currency)} (antes ${fmt(p.comparePrice, config.currency)})` : fmt(p.price, config.currency);
      lines.push(`• ${p.name} — ${priceTxt}`);
    });
  });
  const noCategory = products.filter((p) => !categories.some((c) => c.id === p.categoryId));
  if (noCategory.length > 0) {
    lines.push("");
    lines.push("— Otros —");
    noCategory.forEach((p) => lines.push(`• ${p.name} — ${fmt(p.price, config.currency)}`));
  }
  lines.push("");
  lines.push("¿Querés hacer un pedido? Escribinos por acá. 🙌");
  return lines.join("\n");
}

export function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const max = maxDim || 1000;
        if (width > max || height > max) {
          if (width > height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        let q = quality || 0.72;
        let dataUrl = canvas.toDataURL("image/jpeg", q);
        if (dataUrl.length > 700000 && q > 0.4) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.45);
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ============ Almacenamiento ============ */
// Datos de la PLATAFORMA (registro de tiendas) y de CADA TIENDA (namespaced por id)
// se guardan con Netlify Blobs, a través de la función netlify/functions/data.js.
// El carrito de cada visitante se guarda en su propio navegador (localStorage).

export async function loadShared(key, fallback) {
  try {
    const res = await fetch(`/.netlify/functions/data?key=${encodeURIComponent(key)}`);
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.value !== null && data.value !== undefined ? data.value : fallback;
  } catch (err) {
    return fallback;
  }
}
export async function saveShared(key, value) {
  try {
    await fetch(`/.netlify/functions/data?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } catch (err) {
    console.error("storage error", err);
  }
}
export function loadPersonal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}
export function savePersonal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("storage error", err);
  }
}

export function siteKey(siteId, part) {
  return `site:${siteId}:${part}`;
}

export const DEFAULT_SITE_CONFIG = {
  tagline: "Elegí tus productos y coordinamos el pedido por WhatsApp.",
  welcomeText: "Mirá nuestros productos y hacé tu pedido en un toque.",
  whatsapp: "",
  currency: "$",
  address: "",
  hours: "",
  instagram: "",
  instagramQrImage: "",
  facebook: "",
  whatsappIntro: "Hola! Quiero realizar el siguiente pedido:",
  whatsappOutro: "Espero confirmación del pedido. ¡Gracias!",
};
