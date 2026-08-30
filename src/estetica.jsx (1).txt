import { useState } from "react";
import {
  Clock, Calendar, CalendarClock, MessageCircle, ArrowLeft, AlertCircle, Plus,
  Pencil, Trash2, Check, Scissors, Tags, Settings, LayoutDashboard, Star,
  Image as ImageIcon,
} from "lucide-react";
import { fmt, genId } from "./lib.js";
import { Field, Toggle, ImageSlot, ProductArt, inputCls } from "./ui.jsx";
import { QuickAction } from "./admin.jsx";
import { Hero, ImageCarousel } from "./store.jsx";

/* =========================================================
   Horarios y turnos: datos por defecto y utilidades
   ========================================================= */

export const DEFAULT_SCHEDULE = {
  slotMinutes: 30,
  capacity: 1,
  days: {
    mon: { open: true, start: "09:00", end: "18:00" },
    tue: { open: true, start: "09:00", end: "18:00" },
    wed: { open: true, start: "09:00", end: "18:00" },
    thu: { open: true, start: "09:00", end: "18:00" },
    fri: { open: true, start: "09:00", end: "18:00" },
    sat: { open: true, start: "09:00", end: "13:00" },
    sun: { open: false, start: "09:00", end: "13:00" },
  },
};

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABELS = { mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo" };
const APPOINTMENT_STATUSES = ["Pendiente", "Confirmado", "Completado", "Cancelado"];

export function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dayKeyOf(d) {
  return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][d.getDay()];
}
function minutesOf(hhmm) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return h * 60 + m;
}
function hhmmOf(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
export function formatDateDisplay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

// Calcula los horarios disponibles para un servicio en una fecha, respetando
// el horario del día, la duración del servicio, los turnos ya tomados y la
// cantidad de turnos simultáneos permitidos (capacidad).
export function computeAvailableSlots(schedule, dateStr, appointments, durationMinutes) {
  const sch = schedule || DEFAULT_SCHEDULE;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dKey = dayKeyOf(dateObj);
  const day = sch.days && sch.days[dKey];
  if (!day || !day.open) return [];
  const slotMin = sch.slotMinutes || 30;
  const capacity = sch.capacity || 1;
  const duration = durationMinutes || slotMin;
  const startMin = minutesOf(day.start || "09:00");
  const endMin = minutesOf(day.end || "18:00");
  const existing = (appointments || [])
    .filter((a) => a.date === dateStr && a.status !== "Cancelado")
    .map((a) => ({ start: minutesOf(a.time), end: minutesOf(a.time) + (a.durationMinutes || slotMin) }));
  const now = new Date();
  const isToday = dateKey(now) === dateStr;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots = [];
  for (let s = startMin; s + duration <= endMin; s += slotMin) {
    if (isToday && s <= nowMin) continue;
    const e = s + duration;
    const overlapCount = existing.filter((ex) => ex.start < e && ex.end > s).length;
    if (overlapCount < capacity) slots.push(hhmmOf(s));
  }
  return slots;
}

export function buildAppointmentMessage(appt, config, branding) {
  const lines = [];
  lines.push(`Hola! Quiero reservar el siguiente turno en ${branding.name}:`);
  lines.push("");
  lines.push(`💆 Servicio: ${appt.serviceName}`);
  if (appt.variantLabel) lines.push(`✨ Opción: ${appt.variantLabel}`);
  lines.push(`📅 Fecha: ${formatDateDisplay(appt.date)}`);
  lines.push(`🕐 Hora: ${appt.time}`);
  lines.push("");
  lines.push(`👤 Nombre: ${appt.customerName}`);
  if (appt.customerNote) lines.push(`📝 Nota: ${appt.customerNote}`);
  lines.push("");
  lines.push("¡Espero confirmación! Gracias.");
  return lines.join("\n");
}

export const ESTETICA_TABS = [
  { id: "dashboard", label: "Resumen", Icon: LayoutDashboard },
  { id: "services", label: "Servicios", Icon: Scissors },
  { id: "categories", label: "Categorías", Icon: Tags },
  { id: "appointments", label: "Turnos", Icon: CalendarClock },
  { id: "schedule", label: "Horarios", Icon: Clock },
  { id: "config", label: "Configuración", Icon: Settings },
];

/* =========================================================
   Tienda pública: catálogo de servicios y reserva de turno
   ========================================================= */

export function ServiceCard({ service, currency, onSelect }) {
  const imageUrl = service.image || null;
  const variants = service.variants || [];
  const lowestVariantPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : null;
  return (
    <article className="group flex flex-col">
      <button
        type="button"
        onClick={onSelect}
        style={{ aspectRatio: "4 / 5" }}
        className="relative block w-full rounded-3xl overflow-hidden border border-stone-200 text-left focus:outline-none ring-brand"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <ProductArt name={service.name} size="card" />
        )}
        <div className="absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 text-stone-700 text-xs font-medium px-2 py-1">
              <Clock size={11} /> {service.durationMinutes} min
            </span>
            {service.featured && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-brand-accent shadow-sm">
                <Star size={13} fill="currentColor" />
              </span>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md px-3 py-2 -rotate-1 group-hover:rotate-0 transition-transform duration-300 self-start max-w-full">
            <p className="font-display font-semibold text-stone-900 text-xs sm:text-sm leading-tight line-clamp-2">{service.name}</p>
          </div>
        </div>
      </button>
      <div className="mt-2.5 px-0.5 flex-1 flex flex-col">
        <p className="text-xs text-stone-500 line-clamp-2">{service.shortDescription}</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          {lowestVariantPrice !== null && <span className="text-xs text-stone-400">Desde</span>}
          <span className="font-mono-data font-bold text-stone-900">{fmt(lowestVariantPrice !== null ? lowestVariantPrice : service.price, currency)}</span>
        </div>
        <button type="button" onClick={onSelect} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-brand text-white text-sm font-medium py-2 hover:opacity-90 active:scale-95 transition">
          <Calendar size={15} /> Reservar turno
        </button>
      </div>
    </article>
  );
}

export function ServicesHomeScreen({ branding, config, services, onSelectService, currency, waLink, waReady, sectionRef }) {
  function scrollToServices() {
    if (sectionRef.current) sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <main>
      <Hero branding={branding} config={config} onCta={scrollToServices} waLink={waLink} waReady={waReady} />
      <ImageCarousel images={config.carouselImages} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12" ref={sectionRef}>
        <div className="mb-4">
          <span className="inline-block bg-white border border-stone-200 rounded-md px-2 py-0.5 text-xs font-mono-data uppercase tracking-wider text-brand -rotate-1">Servicios</span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-stone-900 mt-1">Reservá tu turno</h2>
        </div>
        {services.length === 0 ? (
          <p className="text-center text-stone-400 py-16">Todavía no hay servicios cargados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} currency={currency} onSelect={() => onSelectService(s.id)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export function BookingScreen({ service, schedule, appointments, config, branding, onBack, onConfirm }) {
  const variants = service && service.variants ? service.variants : [];
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [error, setError] = useState("");

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center text-stone-400">
        <p>Servicio no encontrado.</p>
        <button type="button" onClick={onBack} className="text-brand underline mt-2">Volver</button>
      </div>
    );
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;
  const displayPrice = selectedVariant ? selectedVariant.price : service.price;
  const readyForDate = variants.length === 0 || !!selectedVariant;

  const days = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  const slots = selectedDate ? computeAvailableSlots(schedule, selectedDate, appointments, service.durationMinutes) : [];

  function handleConfirm() {
    if (variants.length > 0 && !selectedVariant) { setError("Elegí una opción."); return; }
    if (!selectedDate || !selectedTime) { setError("Elegí una fecha y un horario."); return; }
    if (!customerName.trim() || !customerPhone.trim()) { setError("Completá tu nombre y tu WhatsApp."); return; }
    setError("");
    onConfirm({
      serviceId: service.id,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      variantId: selectedVariant ? selectedVariant.id : null,
      variantLabel: selectedVariant ? selectedVariant.label : "",
      price: displayPrice,
      date: selectedDate,
      time: selectedTime,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerNote: customerNote.trim(),
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-5">
        <ArrowLeft size={16} /> Volver
      </button>
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7">
        <div className="flex items-center justify-between mb-1 gap-3">
          <h1 className="font-display text-2xl font-bold text-stone-900">{service.name}</h1>
          <span className="font-mono-data font-bold text-lg text-stone-900 shrink-0">{fmt(displayPrice, config.currency)}</span>
        </div>
        <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-6">
          <Clock size={13} /> {service.durationMinutes} minutos
        </p>

        {variants.length > 0 && (
          <>
            <p className="text-xs font-semibold text-stone-600 mb-2">Elegí una opción</p>
            <div className="grid gap-2 mb-6">
              {variants.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition ${selectedVariantId === v.id ? "border-brand bg-brand-surface" : "border-stone-200 hover:border-stone-400"}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-800">{v.label}</span>
                    {v.badge && <span className="text-xs font-semibold text-brand-accent bg-white rounded-full px-2 py-0.5 border border-stone-200">{v.badge}</span>}
                  </span>
                  <span className="font-mono-data font-bold text-stone-900">{fmt(v.price, config.currency)}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {readyForDate && (
        <>
        <p className="text-xs font-semibold text-stone-600 mb-2">Elegí un día</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
          {days.map((d) => {
            const key = dateKey(d);
            const dKey = dayKeyOf(d);
            const open = schedule && schedule.days && schedule.days[dKey] && schedule.days[dKey].open;
            return (
              <button
                type="button"
                key={key}
                disabled={!open}
                onClick={() => { setSelectedDate(key); setSelectedTime(null); }}
                className={`shrink-0 w-14 rounded-2xl border py-2.5 text-center transition ${
                  !open ? "opacity-30 cursor-not-allowed border-stone-200" : selectedDate === key ? "bg-brand-ink text-white border-transparent" : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <p className="text-xs uppercase font-medium opacity-70">{d.toLocaleDateString("es-AR", { weekday: "short" })}</p>
                <p className="font-display font-bold text-lg">{d.getDate()}</p>
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <>
            <p className="text-xs font-semibold text-stone-600 mb-2">Elegí un horario</p>
            {slots.length === 0 ? (
              <p className="text-sm text-stone-400 mb-5">No quedan horarios disponibles ese día. Probá con otra fecha.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-5">
                {slots.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedTime === t ? "bg-brand-ink text-white border-transparent" : "border-stone-200 hover:border-stone-400"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        </>
        )}

        {selectedDate && selectedTime && (
          <div className="space-y-3 pt-4 border-t border-stone-100 mt-1">
            <p className="text-xs font-semibold text-stone-600">Tus datos</p>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre y apellido" className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ring-brand" />
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Tu WhatsApp" className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ring-brand" />
            <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={2} placeholder="Alguna aclaración (opcional)" className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none ring-brand" />
            {error && (
              <p className="text-red-700 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
            <button type="button" onClick={handleConfirm} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 transition">
              <MessageCircle size={18} /> Confirmar turno por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Panel del cliente: servicios, horarios y turnos
   ========================================================= */

export function EsteticaDashboard({ services, appointments, onNavigate, waReady, serviceLimit }) {
  const todayKey = dateKey(new Date());
  const stats = [
    { label: serviceLimit ? `Servicios (${services.length}/${serviceLimit})` : "Servicios", value: services.length },
    { label: "Turnos hoy", value: appointments.filter((a) => a.date === todayKey && a.status !== "Cancelado").length },
    { label: "Turnos pendientes", value: appointments.filter((a) => a.status === "Pendiente").length },
    { label: "Activos", value: services.filter((s) => s.active).length },
  ];
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Resumen</h1>
      {!waReady && (
        <div className="mb-6 flex items-start gap-2.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl p-4 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Falta configurar el WhatsApp del centro.</p>
            <button type="button" onClick={() => onNavigate("config")} className="underline font-medium">Ir a configuración</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-4">
            <p className="font-mono-data text-2xl font-bold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="font-mono-data text-xs uppercase tracking-wider text-stone-400 mb-3">Accesos rápidos</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction icon={Plus} label="Agregar servicio" onClick={() => onNavigate("services", "new")} />
        <QuickAction icon={Scissors} label="Ver servicios" onClick={() => onNavigate("services")} />
        <QuickAction icon={CalendarClock} label="Turnos" onClick={() => onNavigate("appointments")} />
        <QuickAction icon={Settings} label="Configuración" onClick={() => onNavigate("config")} />
      </div>
    </div>
  );
}

export function AdminServicesList({ services, categories, currency, onEdit, onNew, onToggleActive, onDelete, serviceLimit }) {
  const [confirmId, setConfirmId] = useState(null);
  const [q, setQ] = useState("");
  const atLimit = serviceLimit !== null && serviceLimit !== undefined && services.length >= serviceLimit;
  const filtered = services.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Servicios</h1>
          {serviceLimit !== null && serviceLimit !== undefined && <p className="text-xs text-stone-400 mt-0.5">{services.length} / {serviceLimit} servicios usados</p>}
        </div>
        <button
          type="button"
          onClick={onNew}
          disabled={atLimit}
          title={atLimit ? `Alcanzaste el límite de ${serviceLimit} servicios` : undefined}
          className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-full px-4 py-2.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Agregar servicio
        </button>
      </div>
      {atLimit && (
        <div className="mb-4 flex items-start gap-2.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-2xl p-3.5 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>Alcanzaste el límite de {serviceLimit} servicios de tu plan. Para cargar más, contactá a quien te dio de alta.</p>
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar servicio..." className="w-full sm:w-72 border border-stone-300 rounded-full px-4 py-2 text-sm mb-4 focus:outline-none" />
      <div className="space-y-2.5">
        {filtered.length === 0 && <p className="text-sm text-stone-400 py-10 text-center">No hay servicios que coincidan.</p>}
        {filtered.map((s) => {
          const cat = categories.find((c) => c.id === s.categoryId);
          return (
            <div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-stone-200 relative overflow-hidden shrink-0">
                {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : <ProductArt name={s.name} size="mini" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-stone-900 text-sm truncate">{s.name}</p>
                  {s.featured && <Star size={13} className="text-amber-600 shrink-0" fill="currentColor" />}
                  {!s.active && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full shrink-0">Inactivo</span>}
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {cat ? cat.name : "Sin categoría"} · {s.durationMinutes} min · <span className="font-mono-data">{fmt(s.price, currency)}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => onToggleActive(s.id)} title={s.active ? "Desactivar" : "Activar"} className={`w-8 h-8 rounded-full flex items-center justify-center ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>
                  <Check size={14} />
                </button>
                <button type="button" onClick={() => onEdit(s.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200">
                  <Pencil size={14} />
                </button>
                {confirmId === s.id ? (
                  <button type="button" onClick={() => { onDelete(s.id); setConfirmId(null); }} className="text-xs font-semibold bg-red-700 text-white rounded-full px-2.5 py-1.5">¿Confirmar?</button>
                ) : (
                  <button type="button" onClick={() => setConfirmId(s.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-red-100 hover:text-red-700">
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

export function AdminServiceForm({ service, categories, currency, onSave, onCancel }) {
  const isNew = !service;
  const [form, setForm] = useState(() =>
    service
      ? { ...service, price: String(service.price), durationMinutes: String(service.durationMinutes), variants: service.variants && service.variants.length ? service.variants.map((v) => ({ ...v, price: String(v.price) })) : [] }
      : { name: "", shortDescription: "", description: "", price: "", durationMinutes: "30", categoryId: categories[0] ? categories[0].id : "", image: "", active: true, featured: false, variants: [] }
  );
  const [errors, setErrors] = useState({});

  function set(field, val) { setForm((f) => ({ ...f, [field]: val })); }
  function setVariant(i, field, val) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: val };
      return { ...f, variants };
    });
  }
  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, { id: genId("var"), label: "", price: "", badge: "" }] }));
  }
  function removeVariant(i) {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Ingresá un nombre.";
    if (!form.categoryId) e.categoryId = "Elegí una categoría.";
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) e.price = "Ingresá un precio válido.";
    const durNum = Number(form.durationMinutes);
    if (!form.durationMinutes || isNaN(durNum) || durNum <= 0) e.durationMinutes = "Ingresá una duración válida.";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const cleanVariants = form.variants
      .filter((v) => v.label.trim() && v.price !== "")
      .map((v) => ({ id: v.id || genId("var"), label: v.label.trim(), price: Number(v.price) || 0, badge: (v.badge || "").trim() }));
    onSave({
      id: service ? service.id : genId("srv"),
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      durationMinutes: Number(form.durationMinutes),
      categoryId: form.categoryId,
      image: form.image || "",
      active: !!form.active,
      featured: !!form.featured,
      variants: cleanVariants,
      order: service ? service.order : Date.now(),
      createdAt: service ? service.createdAt : new Date().toISOString(),
    });
  }

  return (
    <div>
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-4">
        <ArrowLeft size={15} /> Volver a servicios
      </button>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">{isNew ? "Agregar servicio" : "Editar servicio"}</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 space-y-5 max-w-2xl">
        <Field label="Nombre" error={errors.name}>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls(errors.name)} placeholder="Ej: Limpieza facial profunda" />
        </Field>
        <Field label="Descripción corta">
          <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={inputCls()} placeholder="Una frase para la tarjeta del servicio" />
        </Field>
        <Field label="Descripción completa">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls()} placeholder="Detalle del servicio..." />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={`Precio base (${currency})`} error={errors.price}>
            <input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls(errors.price)} placeholder="0" />
          </Field>
          <Field label="Duración (minutos)" error={errors.durationMinutes}>
            <input type="number" min="5" step="5" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} className={inputCls(errors.durationMinutes)} placeholder="30" />
          </Field>
        </div>
        <Field label="Categoría" error={errors.categoryId}>
          <select value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls(errors.categoryId)}>
            <option value="">Seleccionar...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Foto del servicio">
          <ImageSlot value={form.image} onChange={(v) => set("image", v)} />
          <p className="text-xs text-stone-400 flex items-start gap-1.5 mt-1.5">
            <ImageIcon size={13} className="mt-0.5 shrink-0" /> Sin foto, el servicio se muestra con una ilustración de la marca.
          </p>
        </Field>
        <Field label="Packs u opciones (opcional)">
          <div className="space-y-2">
            {form.variants.map((v, i) => (
              <div key={v.id || i} className="flex gap-2 items-start">
                <input value={v.label} onChange={(e) => setVariant(i, "label", e.target.value)} className={inputCls() + " flex-1"} placeholder="Ej: Pack 6 sesiones" />
                <input type="number" min="0" value={v.price} onChange={(e) => setVariant(i, "price", e.target.value)} className={inputCls() + " w-28"} placeholder="Precio" />
                <input value={v.badge} onChange={(e) => setVariant(i, "badge", e.target.value)} className={inputCls() + " w-32"} placeholder="Ej: Más elegido" />
                <button type="button" onClick={() => removeVariant(i)} className="w-10 h-10 rounded-xl border border-stone-200 text-stone-400 hover:text-red-700 flex items-center justify-center shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1">
              <Plus size={13} /> Agregar pack u opción
            </button>
            <p className="text-xs text-stone-400">
              Por ejemplo, para vender por sesiones: "1 sesión", "Pack 3 sesiones", "Pack 6 sesiones" con su propio precio cada uno. Si no cargás ninguno, se usa el precio base.
            </p>
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Toggle label="Destacado" checked={form.featured} onChange={(v) => set("featured", v)} />
          <Toggle label="Activo" checked={form.active} onChange={(v) => set("active", v)} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 transition">Guardar servicio</button>
          <button type="button" onClick={onCancel} className="rounded-full border border-stone-300 text-stone-600 font-semibold px-6 hover:bg-stone-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export function AdminSchedule({ schedule, onSave }) {
  const [form, setForm] = useState(() => ({
    slotMinutes: (schedule && schedule.slotMinutes) || DEFAULT_SCHEDULE.slotMinutes,
    capacity: (schedule && schedule.capacity) || DEFAULT_SCHEDULE.capacity,
    days: { ...DEFAULT_SCHEDULE.days, ...(schedule && schedule.days) },
  }));

  function setDay(key, field, value) {
    setForm((f) => ({ ...f, days: { ...f.days, [key]: { ...f.days[key], [field]: value } } }));
  }
  function submit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Horarios</h1>
      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 space-y-5 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Duración de cada turno">
            <select value={form.slotMinutes} onChange={(e) => setForm((f) => ({ ...f, slotMinutes: Number(e.target.value) }))} className={inputCls()}>
              {[15, 20, 30, 45, 60].map((v) => <option key={v} value={v}>{v} min</option>)}
            </select>
          </Field>
          <Field label="Turnos simultáneos (personal disponible)">
            <input type="number" min="1" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Math.max(1, Number(e.target.value) || 1) }))} className={inputCls()} />
          </Field>
        </div>
        <div className="space-y-2.5">
          {DAY_KEYS.map((key) => {
            const day = form.days[key];
            return (
              <div key={key} className="flex flex-wrap items-center gap-3 border border-stone-200 rounded-xl p-3">
                <button type="button" onClick={() => setDay(key, "open", !day.open)} className={`shrink-0 w-9 h-5 rounded-full inline-flex items-center px-0.5 transition ${day.open ? "bg-brand justify-end" : "bg-stone-300 justify-start"}`}>
                  <span className="w-4 h-4 rounded-full bg-white block" />
                </button>
                <span className="w-20 text-sm font-medium text-stone-700 shrink-0">{DAY_LABELS[key]}</span>
                {day.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={day.start} onChange={(e) => setDay(key, "start", e.target.value)} className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm flex-1" />
                    <span className="text-stone-400 text-xs">a</span>
                    <input type="time" value={day.end} onChange={(e) => setDay(key, "end", e.target.value)} className="border border-stone-200 rounded-lg px-2 py-1.5 text-sm flex-1" />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
        <button type="submit" className="w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3">Guardar horarios</button>
      </form>
    </div>
  );
}

export function AdminAppointments({ appointments, currency, onStatusChange }) {
  const sorted = [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900 mb-5">Turnos</h1>
      {sorted.length === 0 ? (
        <p className="text-sm text-stone-400 py-10 text-center">Todavía no hay turnos reservados.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((a) => (
            <div key={a.id} className="bg-white border border-stone-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                <p className="font-mono-data font-semibold text-stone-900 capitalize">{formatDateDisplay(a.date)} · {a.time}</p>
                <select value={a.status} onChange={(e) => onStatusChange(a.id, e.target.value)} className="text-xs border border-stone-300 rounded-full px-3 py-1.5 focus:outline-none">
                  {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="text-sm font-medium text-stone-800">{a.serviceName}{a.variantLabel ? ` · ${a.variantLabel}` : ""}</p>
              <p className="text-sm text-stone-500">{a.customerName} · {a.customerPhone}</p>
              {a.customerNote && <p className="text-xs text-stone-400 mt-1">"{a.customerNote}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
