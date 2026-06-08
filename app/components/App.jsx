import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  serverTimestamp, query, orderBy
} from "firebase/firestore";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDH4GvbdtPqJwUlnRDqtOUoofkL4PTXiew",
  authDomain: "vehigest-ar.firebaseapp.com",
  projectId: "vehigest-ar",
  storageBucket: "vehigest-ar.firebasestorage.app",
  messagingSenderId: "150404378851",
  appId: "1:150404378851:web:940ba835e20c4edeb215d6"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0D0F14; --surface: #161A22; --surface2: #1E2430; --border: #2A3040;
    --accent: #E8A020; --accent2: #3B82F6; --danger: #EF4444; --warn: #F59E0B;
    --ok: #22C55E; --text: #F0F2F5; --muted: #7A8499;
    --font-head: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif;
  }
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font-body); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp .35s ease both; }
  .fade-in { animation: fadeIn .25s ease both; }

  /* LOGIN */
  .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:radial-gradient(ellipse 80% 60% at 50% 0%,#1a2235 0%,#0D0F14 70%); padding:24px; }
  .login-card { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:48px 40px; width:100%; max-width:420px; box-shadow:0 32px 80px rgba(0,0,0,.6); animation:fadeUp .45s ease both; }
  .login-logo { display:flex; align-items:center; gap:12px; margin-bottom:36px; }
  .login-logo-icon { width:44px; height:44px; background:var(--accent); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:22px; }
  .login-logo-text { font-family:var(--font-head); font-size:22px; font-weight:800; letter-spacing:-.5px; }
  .login-logo-text span { color:var(--accent); }
  .login-title { font-family:var(--font-head); font-size:28px; font-weight:800; margin-bottom:6px; }
  .login-sub { color:var(--muted); font-size:14px; margin-bottom:32px; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:7px; }
  .field input, .field select { width:100%; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 14px; color:var(--text); font-family:var(--font-body); font-size:15px; outline:none; transition:border-color .2s; }
  .field input:focus, .field select:focus { border-color:var(--accent); }
  .field input::placeholder { color:var(--muted); }
  .field select { appearance:none; }
  .btn-primary { width:100%; padding:13px; background:var(--accent); color:#000; border:none; border-radius:10px; font-family:var(--font-head); font-size:15px; font-weight:700; cursor:pointer; transition:opacity .2s,transform .1s; margin-top:8px; }
  .btn-primary:hover { opacity:.9; }
  .btn-primary:active { transform:scale(.98); }
  .btn-primary:disabled { opacity:.5; cursor:default; }
  .login-hint { text-align:center; font-size:12px; color:var(--muted); margin-top:20px; }
  .login-hint span { color:var(--accent); cursor:pointer; }

  /* LAYOUT */
  .layout { display:flex; min-height:100vh; }
  .sidebar { width:230px; min-width:230px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:24px 16px; gap:4px; position:sticky; top:0; height:100vh; }
  .sidebar-logo { display:flex; align-items:center; gap:10px; padding:4px 8px 24px; }
  .sidebar-logo-icon { width:34px; height:34px; background:var(--accent); border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:17px; }
  .sidebar-logo-text { font-family:var(--font-head); font-size:17px; font-weight:800; }
  .sidebar-logo-text span { color:var(--accent); }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; font-size:14px; font-weight:500; color:var(--muted); cursor:pointer; transition:background .15s,color .15s; user-select:none; }
  .nav-item:hover { background:var(--surface2); color:var(--text); }
  .nav-item.active { background:rgba(232,160,32,.12); color:var(--accent); font-weight:600; }
  .nav-item .nav-icon { font-size:17px; width:22px; text-align:center; }
  .nav-badge { margin-left:auto; background:var(--danger); color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:99px; }
  .sidebar-section { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:1px; padding:12px 12px 4px; margin-top:8px; }
  .sidebar-bottom { margin-top:auto; padding-top:16px; border-top:1px solid var(--border); }
  .user-chip { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:10px; cursor:pointer; }
  .user-chip:hover { background:var(--surface2); }
  .avatar { width:32px; height:32px; border-radius:50%; background:var(--accent2); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff; flex-shrink:0; }
  .user-name { font-size:13px; font-weight:600; }
  .user-role { font-size:11px; color:var(--muted); }
  .main { flex:1; overflow-y:auto; background:var(--bg); }
  .topbar { display:flex; align-items:center; justify-content:space-between; padding:20px 32px; border-bottom:1px solid var(--border); background:var(--bg); position:sticky; top:0; z-index:10; }
  .topbar-title { font-family:var(--font-head); font-size:20px; font-weight:800; }
  .topbar-right { display:flex; align-items:center; gap:12px; }
  .icon-btn { width:36px; height:36px; border-radius:9px; background:var(--surface); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:background .15s; position:relative; }
  .icon-btn:hover { background:var(--surface2); }
  .icon-btn .dot { position:absolute; top:6px; right:6px; width:7px; height:7px; background:var(--danger); border-radius:50%; border:2px solid var(--bg); }
  .page { padding:28px 32px; animation:fadeUp .3s ease both; }

  /* KPI */
  .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .kpi-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px; display:flex; flex-direction:column; gap:8px; transition:border-color .2s; }
  .kpi-card:hover { border-color:var(--accent); }
  .kpi-top { display:flex; align-items:center; justify-content:space-between; }
  .kpi-icon { font-size:22px; }
  .kpi-badge { font-size:11px; font-weight:600; padding:3px 8px; border-radius:99px; }
  .kpi-badge.ok { background:rgba(34,197,94,.15); color:var(--ok); }
  .kpi-badge.warn { background:rgba(245,158,11,.15); color:var(--warn); }
  .kpi-badge.bad { background:rgba(239,68,68,.15); color:var(--danger); }
  .kpi-value { font-family:var(--font-head); font-size:32px; font-weight:800; line-height:1; }
  .kpi-label { font-size:12px; color:var(--muted); font-weight:500; }

  /* BUTTONS */
  .sec-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .sec-title { font-family:var(--font-head); font-size:15px; font-weight:700; }
  .btn-sm { display:flex; align-items:center; gap:6px; padding:7px 14px; background:var(--surface); border:1px solid var(--border); border-radius:8px; font-size:13px; font-weight:600; color:var(--text); cursor:pointer; transition:background .15s; }
  .btn-sm:hover { background:var(--surface2); }
  .btn-sm.accent { background:var(--accent); color:#000; border-color:var(--accent); }
  .btn-sm.accent:hover { opacity:.85; }

  /* VEHICLES */
  .vehicle-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; margin-bottom:32px; }
  .vehicle-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; cursor:pointer; transition:border-color .2s,transform .2s; position:relative; overflow:hidden; }
  .vehicle-card:hover { border-color:var(--accent); transform:translateY(-2px); }
  .vehicle-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--accent),transparent); opacity:0; transition:opacity .2s; }
  .vehicle-card:hover::before { opacity:1; }
  .vc-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .vc-icon { font-size:28px; }
  .status-pill { font-size:11px; font-weight:700; padding:4px 10px; border-radius:99px; text-transform:uppercase; letter-spacing:.5px; }
  .status-ok { background:rgba(34,197,94,.12); color:var(--ok); }
  .status-warn { background:rgba(245,158,11,.12); color:var(--warn); }
  .status-bad { background:rgba(239,68,68,.12); color:var(--danger); }
  .vc-brand { font-size:11px; color:var(--muted); font-weight:500; margin-bottom:2px; }
  .vc-model { font-family:var(--font-head); font-size:18px; font-weight:700; margin-bottom:10px; }
  .vc-plate { display:inline-block; background:var(--surface2); border:1px solid var(--border); border-radius:6px; padding:3px 10px; font-size:13px; font-weight:700; font-family:monospace; letter-spacing:2px; margin-bottom:14px; }
  .vc-divider { border:none; border-top:1px solid var(--border); margin-bottom:14px; }
  .vc-stats { display:flex; gap:16px; }
  .vc-stat-val { font-size:14px; font-weight:700; }
  .vc-stat-lbl { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
  .vc-alerts { display:flex; gap:6px; margin-top:12px; flex-wrap:wrap; }
  .alert-tag { font-size:10px; font-weight:600; padding:3px 8px; border-radius:5px; }
  .alert-tag.warn { background:rgba(245,158,11,.18); color:var(--warn); }
  .alert-tag.bad { background:rgba(239,68,68,.18); color:var(--danger); }

  /* ALERTS */
  .alerts-list { display:flex; flex-direction:column; gap:10px; }
  .alert-row { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 18px; display:flex; align-items:center; gap:14px; transition:border-color .15s; }
  .alert-row.critical { border-left:3px solid var(--danger); }
  .alert-row.warning { border-left:3px solid var(--warn); }
  .alert-row.ok { border-left:3px solid var(--ok); }
  .alert-icon { font-size:22px; width:36px; text-align:center; flex-shrink:0; }
  .alert-info { flex:1; }
  .alert-title { font-size:14px; font-weight:600; margin-bottom:2px; }
  .alert-sub { font-size:12px; color:var(--muted); }
  .alert-days { text-align:right; flex-shrink:0; }
  .alert-days-num { font-family:var(--font-head); font-size:22px; font-weight:800; line-height:1; }
  .alert-days-lbl { font-size:10px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }

  /* DETAIL */
  .detail-header { display:flex; align-items:flex-start; gap:20px; margin-bottom:28px; padding:24px; background:var(--surface); border:1px solid var(--border); border-radius:16px; }
  .detail-img { font-size:52px; line-height:1; }
  .detail-info { flex:1; }
  .detail-make { font-size:12px; color:var(--muted); font-weight:500; margin-bottom:2px; }
  .detail-model { font-family:var(--font-head); font-size:28px; font-weight:800; margin-bottom:6px; }
  .detail-plate { display:inline-block; background:var(--surface2); border:1px solid var(--border); border-radius:8px; padding:5px 14px; font-size:16px; font-weight:700; font-family:monospace; letter-spacing:3px; margin-bottom:14px; }
  .detail-meta { display:flex; gap:20px; flex-wrap:wrap; }
  .detail-meta-item { font-size:13px; color:var(--muted); }
  .detail-meta-item strong { color:var(--text); }
  .detail-actions { display:flex; flex-direction:column; gap:8px; }
  .tabs { display:flex; gap:4px; margin-bottom:20px; background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:4px; width:fit-content; }
  .tab { padding:8px 18px; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer; color:var(--muted); transition:background .15s,color .15s; }
  .tab.active { background:var(--accent); color:#000; }
  .tab:hover:not(.active) { color:var(--text); background:var(--surface2); }
  .timeline { display:flex; flex-direction:column; gap:0; position:relative; }
  .timeline::before { content:''; position:absolute; left:20px; top:0; bottom:0; width:2px; background:var(--border); z-index:0; }
  .tl-item { display:flex; gap:16px; padding-bottom:20px; position:relative; z-index:1; }
  .tl-dot { width:40px; height:40px; border-radius:50%; background:var(--surface2); border:2px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; z-index:1; }
  .tl-dot.done { border-color:var(--ok); background:rgba(34,197,94,.1); }
  .tl-dot.next { border-color:var(--accent); background:rgba(232,160,32,.1); }
  .tl-content { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 16px; flex:1; }
  .tl-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
  .tl-name { font-size:14px; font-weight:600; }
  .tl-date { font-size:12px; color:var(--muted); }
  .tl-details { display:flex; gap:16px; font-size:12px; color:var(--muted); flex-wrap:wrap; }
  .tl-details strong { color:var(--text); }
  .docs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
  .doc-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; }
  .doc-card.expired { border-color:rgba(239,68,68,.4); }
  .doc-card.warning { border-color:rgba(245,158,11,.4); }
  .doc-icon { font-size:26px; margin-bottom:10px; }
  .doc-name { font-size:13px; font-weight:700; margin-bottom:4px; }
  .doc-issuer { font-size:11px; color:var(--muted); margin-bottom:10px; }
  .doc-days { font-size:11px; font-weight:700; padding:3px 8px; border-radius:99px; display:inline-block; margin-top:6px; }

  /* MODAL */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:32px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; animation:fadeUp .25s ease; }
  .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .modal-title { font-family:var(--font-head); font-size:20px; font-weight:800; }
  .modal-close { width:32px; height:32px; border-radius:8px; background:var(--surface2); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; }
  .modal-close:hover { background:var(--border); }
  .field-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .modal-footer { display:flex; gap:10px; margin-top:24px; }
  .btn-cancel { flex:1; padding:12px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:var(--font-head); font-size:14px; font-weight:600; cursor:pointer; }
  .btn-cancel:hover { background:var(--border); }
  .btn-save { flex:2; padding:12px; background:var(--accent); border:none; border-radius:10px; color:#000; font-family:var(--font-head); font-size:14px; font-weight:700; cursor:pointer; }
  .btn-save:hover { opacity:.9; }
  .btn-save:disabled { opacity:.5; cursor:default; }

  /* TOAST */
  .toast { position:fixed; bottom:28px; right:28px; z-index:200; background:var(--surface); border:1px solid var(--ok); border-radius:12px; padding:14px 18px; display:flex; align-items:center; gap:10px; animation:slideIn .3s ease; font-size:14px; font-weight:500; box-shadow:0 8px 32px rgba(0,0,0,.4); }

  /* LOADING */
  .loading-wrap { display:flex; align-items:center; justify-content:center; height:200px; }
  .spinner { width:32px; height:32px; border:3px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .7s linear infinite; }

  /* EMPTY */
  .empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .empty-icon { font-size:48px; margin-bottom:14px; opacity:.5; }
  .empty-msg { font-size:15px; margin-bottom:8px; font-weight:600; color:var(--text); }
  .empty-sub { font-size:13px; }

  @media (max-width:900px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } .sidebar { display:none; } }
  @media (max-width:600px) { .kpi-grid { grid-template-columns:1fr 1fr; } .page { padding:16px; } .topbar { padding:16px; } }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SERVICE_CATALOG = ["Cambio de aceite","Filtro de aire","Filtro de combustible","Frenos delanteros","Frenos traseros","Cubiertas","Alineación y balanceo","Correa de distribución","Bujías","Amortiguadores","Revisión GNC anual","Cambio de cubiertas","Servicio mayor","Servicio menor","Otro"];

function daysColor(d) {
  if (d === null || d === undefined) return "var(--muted)";
  if (d < 0) return "var(--danger)";
  if (d <= 30) return "var(--warn)";
  return "var(--ok)";
}
function daysLabel(d) {
  if (d === null || d === undefined) return "Sin carga";
  if (d < 0) return `Vencido hace ${Math.abs(d)}d`;
  if (d === 0) return "Vence hoy";
  return `${d} días`;
}
function fmtNum(n) { return n?.toLocaleString("es-AR") ?? "-"; }
function fmtARS(n) { return n ? `$${n.toLocaleString("es-AR")}` : "-"; }
function calcDaysLeft(expiry) {
  if (!expiry) return null;
  return Math.round((new Date(expiry) - new Date()) / 86400000);
}
function calcVehicleStatus(docs) {
  const days = docs.map(d => d.daysLeft).filter(d => d !== null);
  if (days.some(d => d < 0)) return "bad";
  if (days.some(d => d <= 30)) return "warn";
  return "ok";
}
function buildAlerts(vehicles) {
  const alerts = [];
  vehicles.forEach(v => {
    v.docs.forEach(d => {
      if (d.daysLeft === null) return;
      let level = "ok";
      if (d.daysLeft < 0) level = "critical";
      else if (d.daysLeft <= 30) level = "warning";
      else if (d.daysLeft <= 60) level = "ok";
      else return;
      const icon = d.type.includes("VTV") ? "🔍" : d.type.includes("Seguro") ? "🛡️" : d.type.includes("GNC") ? "⚡" : "📋";
      const msg = d.daysLeft < 0
        ? `${d.type} VENCIDA hace ${Math.abs(d.daysLeft)} días`
        : `${d.type} vence en ${d.daysLeft} días`;
      alerts.push({ id: `${v.id}-${d.id}`, vehicleId: v.id, vehicle: `${v.brand} ${v.model}`, plate: v.plate, type: d.type, level, icon, msg, daysLeft: d.daysLeft });
    });
  });
  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

// ─── FIREBASE HOOKS ───────────────────────────────────────────────────────────
function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const vList = await Promise.all(snap.docs.map(async (vDoc) => {
        const v = { id: vDoc.id, ...vDoc.data() };
        const docsSnap = await new Promise(res => {
          const unsub2 = onSnapshot(collection(db, "vehicles", vDoc.id, "docs"), s => { unsub2(); res(s); });
        });
        const svcSnap = await new Promise(res => {
          const unsub3 = onSnapshot(query(collection(db, "vehicles", vDoc.id, "services"), orderBy("performedAt", "desc")), s => { unsub3(); res(s); });
        });
        const docs = docsSnap.docs.map(d => ({ id: d.id, ...d.data(), daysLeft: calcDaysLeft(d.data().expiry) }));
        const services = svcSnap.docs.map(s => ({ id: s.id, ...s.data() }));
        return { ...v, docs, services, status: calcVehicleStatus(docs) };
      }));
      setVehicles(vList);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { vehicles, loading };
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className="toast">✅ {msg}</div>;
}

function Loading() {
  return <div className="loading-wrap"><div className="spinner" /></div>;
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  function handle() {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  }
  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🚗</div>
          <div className="login-logo-text">Vehi<span>Gest</span> AR</div>
        </div>
        <div className="login-title">Bienvenido</div>
        <div className="login-sub">Ingresá a tu cuenta para gestionar tu flota</div>
        <div className="field"><label>Email</label><input type="email" defaultValue="admin@flota.com.ar" placeholder="tu@correo.com" /></div>
        <div className="field"><label>Contraseña</label><input type="password" defaultValue="password" placeholder="••••••••" /></div>
        <button className="btn-primary" onClick={handle} disabled={loading}>{loading ? "Ingresando..." : "Ingresar →"}</button>
        <div className="login-hint">¿Olvidaste tu contraseña? <span>Recuperar acceso</span></div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, alertCount }) {
  const nav = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "vehicles", icon: "🚗", label: "Vehículos" },
    { id: "alerts", icon: "🔔", label: "Alertas", badge: alertCount },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚗</div>
        <div className="sidebar-logo-text">Vehi<span>Gest</span></div>
      </div>
      <div className="sidebar-section">Principal</div>
      {nav.map(n => (
        <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
          <span className="nav-icon">{n.icon}</span>{n.label}
          {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
        </div>
      ))}
      <div className="sidebar-section">Cuenta</div>
      <div className="nav-item"><span className="nav-icon">⚙️</span>Configuración</div>
      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="avatar">MA</div>
          <div><div className="user-name">Miguel A.</div><div className="user-role">Administrador</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ vehicles, alerts, loading, setPage, setSelectedVehicle }) {
  if (loading) return <div className="page"><Loading /></div>;
  const topAlerts = alerts.filter(a => a.level !== "ok").slice(0, 5);
  return (
    <div className="page fade-up">
      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-icon">🚗</span><span className="kpi-badge ok">Flota</span></div><div className="kpi-value">{vehicles.length}</div><div className="kpi-label">Vehículos totales</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-icon">✅</span><span className="kpi-badge ok">OK</span></div><div className="kpi-value" style={{color:"var(--ok)"}}>{vehicles.filter(v=>v.status==="ok").length}</div><div className="kpi-label">Al día</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-icon">⚠️</span><span className="kpi-badge warn">Atención</span></div><div className="kpi-value" style={{color:"var(--warn)"}}>{vehicles.filter(v=>v.status==="warn").length}</div><div className="kpi-label">Por vencer pronto</div></div>
        <div className="kpi-card"><div className="kpi-top"><span className="kpi-icon">🚨</span><span className="kpi-badge bad">Crítico</span></div><div className="kpi-value" style={{color:"var(--danger)"}}>{vehicles.filter(v=>v.status==="bad").length}</div><div className="kpi-label">Requieren acción</div></div>
      </div>
      {vehicles.length === 0 ? (
        <div className="empty"><div className="empty-icon">🚗</div><div className="empty-msg">No hay vehículos cargados</div><div className="empty-sub">Agregá tu primer vehículo desde la sección Vehículos</div></div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <div className="sec-header"><span className="sec-title">Flota</span><button className="btn-sm" onClick={()=>setPage("vehicles")}>Ver todo →</button></div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {vehicles.slice(0,3).map(v=>(
                <div key={v.id} className="vehicle-card" style={{padding:"14px 16px"}} onClick={()=>{setSelectedVehicle(v.id);setPage("vehicle-detail");}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:24}}>{v.icon||"🚗"}</span>
                    <div style={{flex:1}}><div style={{fontSize:11,color:"var(--muted)"}}>{v.brand}</div><div style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:15}}>{v.model}</div></div>
                    <div className={`status-pill status-${v.status}`}>{v.status==="ok"?"Al día":v.status==="warn"?"Atención":"Crítico"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sec-header"><span className="sec-title">Alertas urgentes</span><button className="btn-sm" onClick={()=>setPage("alerts")}>Ver todas →</button></div>
            {topAlerts.length === 0 ? <div style={{fontSize:13,color:"var(--muted)",padding:"20px 0"}}>✅ Todo al día</div> : (
              <div className="alerts-list">
                {topAlerts.map(a=>(
                  <div key={a.id} className={`alert-row ${a.level}`}>
                    <span className="alert-icon">{a.icon}</span>
                    <div className="alert-info"><div className="alert-title">{a.type} — {a.vehicle}</div><div className="alert-sub" style={{fontFamily:"monospace",fontSize:11,letterSpacing:1}}>{a.plate}</div></div>
                    <div className="alert-days"><div className="alert-days-num" style={{color:daysColor(a.daysLeft)}}>{Math.abs(a.daysLeft)}</div><div className="alert-days-lbl">{a.daysLeft<0?"días exp":"días"}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VEHICLES LIST ────────────────────────────────────────────────────────────
function VehiclesList({ vehicles, loading, setSelectedVehicle, setPage, onAdd }) {
  if (loading) return <div className="page"><Loading /></div>;
  return (
    <div className="page fade-up">
      <div className="sec-header" style={{marginBottom:20}}>
        <span className="sec-title" style={{fontSize:17}}>Todos los vehículos</span>
        <button className="btn-sm accent" onClick={onAdd}>＋ Agregar vehículo</button>
      </div>
      <div className="vehicle-grid">
        {vehicles.map(v=>(
          <div key={v.id} className="vehicle-card" onClick={()=>{setSelectedVehicle(v.id);setPage("vehicle-detail");}}>
            <div className="vc-top"><span className="vc-icon">{v.icon||"🚗"}</span><div className={`status-pill status-${v.status}`}>{v.status==="ok"?"Al día":v.status==="warn"?"Atención":"Crítico"}</div></div>
            <div className="vc-brand">{v.brand} {v.year}</div>
            <div className="vc-model">{v.model}</div>
            <div className="vc-plate">{v.plate}</div>
            <hr className="vc-divider" />
            <div className="vc-stats">
              <div><div className="vc-stat-val">{fmtNum(v.km)} km</div><div className="vc-stat-lbl">Kilometraje</div></div>
              <div><div className="vc-stat-val">{v.fuel}{v.gnc?" + GNC":""}</div><div className="vc-stat-lbl">Combustible</div></div>
            </div>
            {v.docs.some(d=>d.daysLeft!==null&&d.daysLeft<30)&&(
              <div className="vc-alerts">
                {v.docs.filter(d=>d.daysLeft!==null&&d.daysLeft<30).map(d=>(
                  <span key={d.id} className={`alert-tag ${d.daysLeft<0?"bad":"warn"}`}>{d.type} {daysLabel(d.daysLeft)}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="vehicle-card" onClick={onAdd} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:220,border:"2px dashed var(--border)"}}>
          <span style={{fontSize:36,marginBottom:10,opacity:.4}}>＋</span>
          <span style={{fontSize:14,color:"var(--muted)",fontWeight:600}}>Agregar vehículo</span>
        </div>
      </div>
    </div>
  );
}

// ─── VEHICLE DETAIL ───────────────────────────────────────────────────────────
function VehicleDetail({ vehicle, onBack, onAddService, onAddDoc }) {
  const [tab, setTab] = useState("docs");
  if (!vehicle) return null;
  const totalCost = vehicle.services.filter(s=>s.done).reduce((a,s)=>a+(s.cost||0),0);
  return (
    <div className="page fade-up">
      <div style={{marginBottom:16}}><button className="btn-sm" onClick={onBack}>← Volver</button></div>
      <div className="detail-header">
        <span className="detail-img">{vehicle.icon||"🚗"}</span>
        <div className="detail-info">
          <div className="detail-make">{vehicle.brand} · {vehicle.year}</div>
          <div className="detail-model">{vehicle.model}</div>
          <div className="detail-plate">{vehicle.plate}</div>
          <div className="detail-meta">
            <div className="detail-meta-item">Combustible: <strong>{vehicle.fuel}{vehicle.gnc?" + GNC":""}</strong></div>
            <div className="detail-meta-item">Kilometraje: <strong>{fmtNum(vehicle.km)} km</strong></div>
            <div className="detail-meta-item">Color: <strong>{vehicle.color}</strong></div>
          </div>
        </div>
        <div className="detail-actions">
          <div className={`status-pill status-${vehicle.status}`} style={{fontSize:13,padding:"6px 14px"}}>{vehicle.status==="ok"?"✅ Al día":vehicle.status==="warn"?"⚠️ Atención":"🚨 Crítico"}</div>
          <button className="btn-sm" style={{marginTop:8}} onClick={onAddDoc}>＋ Documento</button>
          <button className="btn-sm accent" onClick={onAddService}>＋ Service</button>
        </div>
      </div>
      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:24}}>
        <div className="kpi-card"><div className="kpi-icon">🔧</div><div className="kpi-value" style={{fontSize:24}}>{vehicle.services.filter(s=>s.done).length}</div><div className="kpi-label">Services realizados</div></div>
        <div className="kpi-card"><div className="kpi-icon">💰</div><div className="kpi-value" style={{fontSize:22}}>{fmtARS(totalCost)}</div><div className="kpi-label">Gasto total</div></div>
        <div className="kpi-card"><div className="kpi-icon">📋</div><div className="kpi-value" style={{fontSize:24,color:vehicle.docs.some(d=>d.daysLeft<0)?"var(--danger)":vehicle.docs.some(d=>d.daysLeft!==null&&d.daysLeft<30)?"var(--warn)":"var(--ok)"}}>{vehicle.docs.filter(d=>d.daysLeft!==null&&d.daysLeft<0).length>0?"⚠":"✓"}</div><div className="kpi-label">Estado documentación</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${tab==="docs"?"active":""}`} onClick={()=>setTab("docs")}>📋 Documentos</div>
        <div className={`tab ${tab==="services"?"active":""}`} onClick={()=>setTab("services")}>🔧 Historial de service</div>
      </div>
      {tab==="docs"&&(
        <div className="docs-grid fade-in">
          {vehicle.docs.length===0&&<div className="empty"><div className="empty-icon">📋</div><div className="empty-msg">Sin documentos</div><div className="empty-sub">Cargá el primero con el botón de arriba</div></div>}
          {vehicle.docs.map(d=>{
            const cls=d.daysLeft===null?"":d.daysLeft<0?"expired":d.daysLeft<30?"warning":"";
            return(
              <div key={d.id} className={`doc-card ${cls}`}>
                <div className="doc-icon">{d.type.includes("VTV")?"🔍":d.type.includes("Seguro")?"🛡️":d.type.includes("GNC")?"⚡":d.type.includes("Patente")?"📋":"📄"}</div>
                <div className="doc-name">{d.type}</div>
                <div className="doc-issuer">{d.issuer||"—"}</div>
                {d.policy&&<div style={{fontSize:11,color:"var(--muted)",marginBottom:8,fontFamily:"monospace"}}>{d.policy}</div>}
                {d.expiry?(<div><div style={{fontSize:10,color:"var(--muted)",marginBottom:2}}>VENCE</div><div style={{fontWeight:700,fontSize:14}}>{d.expiry}</div><div className="doc-days" style={{background:d.daysLeft<0?"rgba(239,68,68,.15)":d.daysLeft<30?"rgba(245,158,11,.15)":"rgba(34,197,94,.15)",color:daysColor(d.daysLeft)}}>{daysLabel(d.daysLeft)}</div></div>):(<div style={{fontSize:12,color:"var(--muted)",fontStyle:"italic"}}>Sin datos cargados</div>)}
                {d.paid>0&&<div style={{fontSize:11,color:"var(--muted)",marginTop:8}}>Pagado: <strong style={{color:"var(--text)"}}>{fmtARS(d.paid)}</strong></div>}
              </div>
            );
          })}
        </div>
      )}
      {tab==="services"&&(
        <div className="timeline fade-in">
          {vehicle.services.length===0&&<div className="empty"><div className="empty-icon">🔧</div><div className="empty-msg">Sin services</div><div className="empty-sub">Registrá el primero con el botón de arriba</div></div>}
          {vehicle.services.map(s=>(
            <div key={s.id} className="tl-item">
              <div className={`tl-dot ${s.done?"done":"next"}`}>{s.done?"✓":"→"}</div>
              <div className="tl-content">
                <div className="tl-top"><span className="tl-name">{s.type}</span><span className="tl-date">{s.done?s.performedAt:<span style={{color:"var(--accent)",fontWeight:600}}>Próximo</span>}</span></div>
                <div className="tl-details">
                  {s.km&&<span>Km: <strong>{fmtNum(s.km)}</strong></span>}
                  {s.nextKm&&<span>Próximo: <strong>{fmtNum(s.nextKm)} km</strong></span>}
                  {s.workshop&&<span>Taller: <strong>{s.workshop}</strong></span>}
                  {s.cost>0&&<span>Costo: <strong style={{color:"var(--accent)"}}>{fmtARS(s.cost)}</strong></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ALERTS PAGE ──────────────────────────────────────────────────────────────
function AlertsPage({ alerts, loading, setSelectedVehicle, setPage }) {
  if (loading) return <div className="page"><Loading /></div>;
  const critical = alerts.filter(a=>a.level==="critical");
  const warning = alerts.filter(a=>a.level==="warning");
  const ok = alerts.filter(a=>a.level==="ok");
  function Section({ title, color, items }) {
    if (!items.length) return null;
    return (<>
      <div style={{fontSize:13,fontWeight:700,color,textTransform:"uppercase",letterSpacing:1,marginBottom:10,marginTop:20}}>{title}</div>
      <div className="alerts-list">
        {items.map(a=>(
          <div key={a.id} className={`alert-row ${a.level}`} style={{cursor:"pointer"}} onClick={()=>{setSelectedVehicle(a.vehicleId);setPage("vehicle-detail");}}>
            <span className="alert-icon">{a.icon}</span>
            <div className="alert-info"><div className="alert-title">{a.msg}</div><div className="alert-sub"><span style={{fontFamily:"monospace",fontSize:11,letterSpacing:1}}>{a.plate}</span><span style={{margin:"0 8px",opacity:.4}}>·</span><span>{a.vehicle}</span></div></div>
            <div className="alert-days"><div className="alert-days-num" style={{color:daysColor(a.daysLeft)}}>{a.daysLeft!==null?Math.abs(a.daysLeft):"—"}</div><div className="alert-days-lbl">{a.daysLeft<0?"días exp.":"días rest."}</div></div>
          </div>
        ))}
      </div>
    </>);
  }
  return (
    <div className="page fade-up">
      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"20px 24px",marginBottom:24,display:"flex",gap:24}}>
        <div style={{textAlign:"center"}}><div style={{fontFamily:"var(--font-head)",fontSize:32,fontWeight:800,color:"var(--danger)"}}>{critical.length}</div><div style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.5}}>Críticas</div></div>
        <div style={{width:1,background:"var(--border)"}}/>
        <div style={{textAlign:"center"}}><div style={{fontFamily:"var(--font-head)",fontSize:32,fontWeight:800,color:"var(--warn)"}}>{warning.length}</div><div style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.5}}>Advertencias</div></div>
        <div style={{width:1,background:"var(--border)"}}/>
        <div style={{textAlign:"center"}}><div style={{fontFamily:"var(--font-head)",fontSize:32,fontWeight:800,color:"var(--ok)"}}>{ok.length}</div><div style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:.5}}>Al día</div></div>
        <div style={{marginLeft:"auto",alignSelf:"center"}}><div style={{fontSize:12,color:"var(--muted)"}}>Tocá una alerta para ver el vehículo</div></div>
      </div>
      {alerts.length===0&&<div className="empty"><div className="empty-icon">🔔</div><div className="empty-msg">Sin alertas por ahora</div><div className="empty-sub">Cargá documentos con vencimiento para que aparezcan acá</div></div>}
      <Section title="🚨 Requieren acción inmediata" color="var(--danger)" items={critical}/>
      <Section title="⚠️ Próximos a vencer" color="var(--warn)" items={warning}/>
      <Section title="✅ En orden" color="var(--ok)" items={ok}/>
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function AddVehicleModal({ onClose, onSave }) {
  const [form, setForm] = useState({brand:"",model:"",year:"2024",plate:"",fuel:"Diesel",gnc:"no",km:"0",color:""});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function save() {
    if (!form.brand||!form.model||!form.plate) return;
    setSaving(true);
    await addDoc(collection(db,"vehicles"),{
      brand:form.brand,model:form.model,year:parseInt(form.year),plate:form.plate.toUpperCase(),
      fuel:form.fuel,gnc:form.gnc==="si",km:parseInt(form.km)||0,color:form.color,
      icon:"🚗",createdAt:serverTimestamp()
    });
    setSaving(false);
    onSave(`${form.brand} ${form.model} agregado`);
  }
  return (
    <Modal title="🚗 Agregar vehículo" onClose={onClose} footer={<><button className="btn-cancel" onClick={onClose}>Cancelar</button><button className="btn-save" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar vehículo"}</button></>}>
      <div className="field-row">
        <div className="field"><label>Marca *</label><input placeholder="Toyota" value={form.brand} onChange={e=>set("brand",e.target.value)}/></div>
        <div className="field"><label>Modelo *</label><input placeholder="Hilux" value={form.model} onChange={e=>set("model",e.target.value)}/></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Año</label><input type="number" value={form.year} onChange={e=>set("year",e.target.value)}/></div>
        <div className="field"><label>Patente *</label><input placeholder="AB999CD" value={form.plate} onChange={e=>set("plate",e.target.value.toUpperCase())} style={{fontFamily:"monospace",letterSpacing:2}}/></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Combustible</label><select value={form.fuel} onChange={e=>set("fuel",e.target.value)}><option>Nafta</option><option>Diesel</option><option>GNC</option><option>Eléctrico</option><option>Híbrido</option></select></div>
        <div className="field"><label>Kilometraje</label><input type="number" value={form.km} onChange={e=>set("km",e.target.value)}/></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Color</label><input placeholder="Blanco" value={form.color} onChange={e=>set("color",e.target.value)}/></div>
        <div className="field"><label>¿Tiene GNC?</label><select value={form.gnc} onChange={e=>set("gnc",e.target.value)}><option value="no">No</option><option value="si">Sí</option></select></div>
      </div>
    </Modal>
  );
}

function AddServiceModal({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({type:"Cambio de aceite",performedAt:"",km:"",nextKm:"",workshop:"",cost:""});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function save() {
    if (!form.performedAt||!form.km) return;
    setSaving(true);
    await addDoc(collection(db,"vehicles",vehicle.id,"services"),{
      type:form.type,performedAt:form.performedAt,km:parseInt(form.km)||0,
      nextKm:form.nextKm?parseInt(form.nextKm):null,workshop:form.workshop,
      cost:parseInt(form.cost)||0,done:true,createdAt:serverTimestamp()
    });
    setSaving(false);
    onSave("Service registrado");
  }
  return (
    <Modal title="🔧 Registrar service" onClose={onClose} footer={<><button className="btn-cancel" onClick={onClose}>Cancelar</button><button className="btn-save" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar service"}</button></>}>
      <div style={{fontSize:13,color:"var(--muted)",marginBottom:16,fontFamily:"monospace"}}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</div>
      <div className="field"><label>Tipo de service *</label><select value={form.type} onChange={e=>set("type",e.target.value)}>{SERVICE_CATALOG.map(s=><option key={s}>{s}</option>)}</select></div>
      <div className="field-row">
        <div className="field"><label>Fecha *</label><input type="date" value={form.performedAt} onChange={e=>set("performedAt",e.target.value)}/></div>
        <div className="field"><label>Km al momento *</label><input type="number" placeholder="87000" value={form.km} onChange={e=>set("km",e.target.value)}/></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Próximo service (km)</label><input type="number" placeholder="92000" value={form.nextKm} onChange={e=>set("nextKm",e.target.value)}/></div>
        <div className="field"><label>Costo total (ARS)</label><input type="number" placeholder="28000" value={form.cost} onChange={e=>set("cost",e.target.value)}/></div>
      </div>
      <div className="field"><label>Taller / Concesionaria</label><input placeholder="Nombre del taller" value={form.workshop} onChange={e=>set("workshop",e.target.value)}/></div>
    </Modal>
  );
}

function AddDocModal({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState({type:"VTV",issuer:"",policy:"",expiry:"",amount:""});
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  async function save() {
    if (!form.expiry) return;
    setSaving(true);
    await addDoc(collection(db,"vehicles",vehicle.id,"docs"),{
      type:form.type,issuer:form.issuer,policy:form.policy,
      expiry:form.expiry,paid:parseInt(form.amount)||0,createdAt:serverTimestamp()
    });
    setSaving(false);
    onSave("Documento cargado");
  }
  return (
    <Modal title="📋 Cargar documento" onClose={onClose} footer={<><button className="btn-cancel" onClick={onClose}>Cancelar</button><button className="btn-save" onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar documento"}</button></>}>
      <div style={{fontSize:13,color:"var(--muted)",marginBottom:16,fontFamily:"monospace"}}>{vehicle.brand} {vehicle.model} · {vehicle.plate}</div>
      <div className="field"><label>Tipo de documento *</label><select value={form.type} onChange={e=>set("type",e.target.value)}><option>VTV</option><option>Seguro</option><option>Patente 1°</option><option>Patente 2°</option><option>Oblea GNC</option><option>Licencia</option><option>Cédula verde</option></select></div>
      <div className="field-row">
        <div className="field"><label>Emisor / Compañía</label><input placeholder="La Caja, ARBA..." value={form.issuer} onChange={e=>set("issuer",e.target.value)}/></div>
        <div className="field"><label>N° de póliza / referencia</label><input placeholder="POL-2024-0001" value={form.policy} onChange={e=>set("policy",e.target.value)}/></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Fecha de vencimiento *</label><input type="date" value={form.expiry} onChange={e=>set("expiry",e.target.value)}/></div>
        <div className="field"><label>Monto pagado (ARS)</label><input type="number" placeholder="65000" value={form.amount} onChange={e=>set("amount",e.target.value)}/></div>
      </div>
    </Modal>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  const { vehicles, loading } = useVehicles();
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const alerts = buildAlerts(vehicles);
  const alertCount = alerts.filter(a => a.level !== "ok").length;

  function showToast(msg) { setToast(msg); }

  function pageTitle() {
    if (page==="dashboard") return "Dashboard";
    if (page==="vehicles") return "Vehículos";
    if (page==="vehicle-detail") return selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Detalle";
    if (page==="alerts") return "Alertas";
    return "";
  }

  if (!loggedIn) return (<><style>{css}</style><Login onLogin={()=>setLoggedIn(true)}/></>);

  return (
    <>
      <style>{css}</style>
      <div className="layout">
        <Sidebar page={page} setPage={p=>{setPage(p);}} alertCount={alertCount}/>
        <div className="main">
          <div className="topbar">
            <span className="topbar-title">{pageTitle()}</span>
            <div className="topbar-right">
              <div className="icon-btn" onClick={()=>setPage("alerts")}>🔔{alertCount>0&&<span className="dot"/>}</div>
              <div className="avatar" style={{cursor:"pointer"}}>MA</div>
            </div>
          </div>
          {page==="dashboard"&&<Dashboard vehicles={vehicles} alerts={alerts} loading={loading} setPage={setPage} setSelectedVehicle={setSelectedVehicleId}/>}
          {page==="vehicles"&&<VehiclesList vehicles={vehicles} loading={loading} setPage={setPage} setSelectedVehicle={setSelectedVehicleId} onAdd={()=>setModal("add-vehicle")}/>}
          {page==="vehicle-detail"&&selectedVehicle&&<VehicleDetail vehicle={selectedVehicle} onBack={()=>setPage("vehicles")} onAddService={()=>setModal("add-service")} onAddDoc={()=>setModal("add-doc")}/>}
          {page==="alerts"&&<AlertsPage alerts={alerts} loading={loading} setSelectedVehicle={setSelectedVehicleId} setPage={setPage}/>}
        </div>
      </div>
      {modal==="add-vehicle"&&<AddVehicleModal onClose={()=>setModal(null)} onSave={msg=>{setModal(null);showToast(msg);}}/>}
      {modal==="add-service"&&selectedVehicle&&<AddServiceModal vehicle={selectedVehicle} onClose={()=>setModal(null)} onSave={msg=>{setModal(null);showToast(msg);}}/>}
      {modal==="add-doc"&&selectedVehicle&&<AddDocModal vehicle={selectedVehicle} onClose={()=>setModal(null)} onSave={msg=>{setModal(null);showToast(msg);}}/>}
      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
    </>
  );
}
