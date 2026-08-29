import { useState, useRef } from "react";
import { AlertCircle, X, Upload, Image as ImageIcon } from "lucide-react";
import { resizeImageFile } from "./lib.js";

export function inputCls(hasError) {
  return `w-full border rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition ${
    hasError ? "border-red-400 focus:ring-red-200" : "border-stone-300 focus:ring-2 ring-brand"
  }`;
}

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="text-red-700 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-xl border p-3 text-left transition ${checked ? "border-brand bg-brand-surface" : "border-stone-200 bg-white"}`}
    >
      <span className={`w-9 h-5 rounded-full inline-flex items-center px-0.5 transition ${checked ? "bg-brand justify-end" : "bg-stone-300 justify-start"}`}>
        <span className="w-4 h-4 rounded-full bg-white block" />
      </span>
      <p className="text-xs font-medium text-stone-700 mt-1.5">{label}</p>
    </button>
  );
}

export function ProductArt({ name, size }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const s = size || "card";
  const bigFont = s === "detail" ? "6rem" : s === "mini" ? "1.5rem" : "3.75rem";
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-brand-surface">
      <span className="font-display select-none text-brand opacity-20" style={{ fontSize: bigFont, lineHeight: 1 }}>
        {initial}
      </span>
    </div>
  );
}

export function CategoryPill({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
        active ? "bg-brand-ink text-white border-transparent" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
      }`}
    >
      {Icon && <Icon size={13} />} {label}
    </button>
  );
}

export function ImageSlot({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [busy, setBusy] = useState(false);
  const isHttp = !!value && /^https?:\/\//.test(value);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 1000, 0.72);
      onChange(dataUrl);
      setShowUrlInput(false);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange("")} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-stone-900/70 text-white flex items-center justify-center">
              <X size={11} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ImageIcon size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        {label && <p className="text-xs font-medium text-stone-500">{label}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current && inputRef.current.click()}
            disabled={busy}
            className="text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full px-3 py-1.5 inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Upload size={12} /> {busy ? "Procesando..." : value ? "Cambiar foto" : "Subir foto"}
          </button>
          <button type="button" onClick={() => setShowUrlInput((v) => !v)} className="text-xs text-brand underline">
            o pegar un link
          </button>
        </div>
        {(showUrlInput || isHttp) && (
          <input
            value={isHttp ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className="w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          />
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="lg-toast fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg">
      {toast.msg}
    </div>
  );
}

export function AccessGate({ icon: Icon, title, subtitle, expectedCode, onSuccess, onBack, backLabel }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (code === expectedCode) {
      setError("");
      onSuccess();
    } else {
      setError("Código incorrecto.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-stone-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-7 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center mb-4">
          <Icon size={20} className="text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900">{title}</h1>
        <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-5 w-full border border-stone-300 rounded-xl px-4 py-3 text-center tracking-widest font-mono-data text-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
          placeholder="Código de acceso"
        />
        {error && (
          <p className="text-red-700 text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={13} /> {error}
          </p>
        )}
        <button type="submit" className="mt-5 w-full rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 transition">
          Ingresar
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className="mt-3 w-full text-sm text-stone-400 hover:text-stone-700">
            {backLabel || "‹ Volver"}
          </button>
        )}
      </form>
    </div>
  );
}
