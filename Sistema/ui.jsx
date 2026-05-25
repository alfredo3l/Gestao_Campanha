/* global React */
/* ============================================================
   Shared UI: icons, sidebar, topbar, helpers
   ============================================================ */

// ===== Icons (stroke style, 1.6) =====
const ic = {
  dashboard: <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  users:     <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  user:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  star:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 9 12 2"/></svg>,
  target:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  inbox:     <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  bar:       <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:  <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  bell:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  help:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  plus:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  filter:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  download:  <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  upload:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  pencil:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>,
  trash:     <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  phone:     <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  map:       <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  calendar:  <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  paperclip: <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  chev:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  x:         <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  check:     <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  more:      <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
  logout:    <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  arrowUp:   <svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  arrowDown:<svg className="icon ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

// ===== Avatar (deterministic color from name) =====
function Avatar({ name, size = 28, className = '' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const cl = 'av-c' + ((h % 8) + 1);
  return (
    <span className={`av ${cl} ${className}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

// ===== Sidebar =====
function Sidebar({ route, onNav, openCount }) {
  const items = [
    { section: 'PRINCIPAL' },
    { id: 'dashboard',  label: 'Dashboard',     icon: ic.dashboard },
    { id: 'apoiadores', label: 'Apoiadores',    icon: ic.users },
    { id: 'liderancas', label: 'Lideranças',    icon: ic.star },
    { id: 'metas',      label: 'Metas de Votos',icon: ic.target },
    { id: 'demandas',   label: 'Demandas',      icon: ic.inbox, badge: openCount },
    { section: 'ANÁLISE' },
    { id: 'relatorios', label: 'Relatórios',    icon: ic.bar },
    { section: 'ADMIN' },
    { id: 'config',     label: 'Configurações', icon: ic.settings },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="crest">CM</div>
        <div>
          <div className="name">Campanha 25</div>
          <div className="sub">Dep. Estadual · MS</div>
        </div>
      </div>
      <nav className="nav">
        {items.map((it, i) => it.section ? (
          <div className="nav-section" key={'s' + i}>{it.section}</div>
        ) : (
          <button
            key={it.id}
            className={`nav-item ${route === it.id ? 'active' : ''}`}
            onClick={() => onNav(it.id)}
          >
            {it.icon}
            <span>{it.label}</span>
            {it.badge ? <span className="badge">{it.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div className="footer-card">
        <div className="row">
          <div className="avatar">CR</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 12.5 }}>Coord. Regional</div>
            <div style={{ fontSize: 11 }}>coord@campanha.app</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ===== Topbar =====
function Topbar({ route, onNav, onLogout, mobile }) {
  const titles = {
    dashboard:  ['Visão geral',           'Dashboard'],
    apoiadores: ['Cadastros',             'Apoiadores'],
    'apoiador-novo': ['Apoiadores',       'Novo apoiador'],
    'apoiador-edit': ['Apoiadores',       'Editar apoiador'],
    liderancas: ['Cadastros',             'Lideranças'],
    'lider-novo':  ['Lideranças',         'Nova liderança'],
    'lider-detalhe': ['Lideranças',       'Detalhe da liderança'],
    metas:      ['Planejamento',          'Metas de votos'],
    demandas:   ['Atendimento',           'Demandas'],
    'demanda-detalhe': ['Demandas',       'Demanda'],
    relatorios: ['Análise',               'Relatórios'],
    config:     ['Sistema',               'Configurações'],
  };
  const [prefix, current] = titles[route] || ['', ''];
  return (
    <header className="topbar">
      {mobile && (
        <button className="icon-btn" onClick={() => onNav('menu')} aria-label="menu" style={{ marginRight: 4 }}>
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      )}
      <div className="crumb">
        {!mobile && <><span className="crumb-prefix">{prefix}</span>
        <span>›</span></>}
        <span className="current">{current}</span>
      </div>
      {!mobile && (
        <div className="search">
          {React.cloneElement(ic.search, { className: 'ico' })}
          <input type="text" placeholder="Buscar apoiadores, demandas, lideranças…" />
        </div>
      )}
      <div className="actions">
        <button className="icon-btn" aria-label="ajuda">{ic.help}</button>
        <button className="icon-btn" aria-label="notificações">{ic.bell}<span className="dot" /></button>
        <div className="user" onClick={onLogout} title="Sair">
          <div className="avatar">CR</div>
          {!mobile && (
            <div className="who">
              <div className="name">Coord. Regional</div>
              <div className="role">Administrador</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ===== Page head =====
function PageHead({ title, sub, actions }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

// ===== Badge helpers =====
const statusBadge = (st) => {
  const map = {
    confirmado: { cl: 'green', label: 'Confirmado' },
    'provável': { cl: 'blue',  label: 'Provável'   },
    indeciso:   { cl: 'amber', label: 'Indeciso'   },
    contato:    { cl: 'violet',label: 'Em contato' },
    'não-vota': { cl: 'red',   label: 'Não vota'   },
  };
  const x = map[st] || { cl: '', label: st };
  return <span className={`badge ${x.cl}`}><span className="dot"/>{x.label}</span>;
};
const priBadge = (p) => {
  const cl = p === 'Alta' ? 'red' : p === 'Média' ? 'amber' : 'outline';
  return <span className={`badge ${cl}`}>{p}</span>;
};
const demandStatusBadge = (st) => {
  const map = {
    aberta:    { cl: 'blue',  label: 'Aberta' },
    andamento: { cl: 'amber', label: 'Em andamento' },
    resolvida: { cl: 'green', label: 'Resolvida' },
  };
  const x = map[st] || { cl: '', label: st };
  return <span className={`badge ${x.cl}`}><span className="dot"/>{x.label}</span>;
};

// ===== Tiny SVG charts (no deps) =====
function LineChart({ data, color = 'var(--brand-700)', fill = 'rgba(38,131,191,0.10)', height = 180, labels = [] }) {
  const w = 560, h = height, pad = 28;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (v - min) / range)]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaPath = path + ` L ${pts[pts.length - 1][0].toFixed(1)},${h - pad} L ${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="chart-area" style={{ height }}>
      {/* gridlines */}
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + (h - pad * 2) * i / 3} y2={pad + (h - pad * 2) * i / 3}
              stroke="#ecf0f5" strokeWidth="1"/>
      ))}
      <path d={areaPath} fill={fill} />
      <path d={path} fill="none" stroke={color} strokeWidth="2"/>
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color}/>)}
      {labels.map((l, i) => (
        <text key={i} x={pts[i][0]} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#6a7689">{l}</text>
      ))}
    </svg>
  );
}

function BarChart({ data, height = 180, labels = [], color = 'var(--brand-700)' }) {
  const w = 560, h = height, pad = 28;
  const max = Math.max(...data, 1);
  const bw = (w - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="chart-area" style={{ height }}>
      {[0, 1, 2, 3].map(i => (
        <line key={i} x1={pad} x2={w - pad} y1={pad + (h - pad * 2) * i / 3} y2={pad + (h - pad * 2) * i / 3}
              stroke="#ecf0f5" strokeWidth="1"/>
      ))}
      {data.map((v, i) => {
        const bh = ((h - pad * 2) * v) / max;
        const x = pad + i * bw + bw * 0.18;
        const y = h - pad - bh;
        return <rect key={i} x={x} y={y} width={bw * 0.64} height={bh} rx="3" fill={color}/>;
      })}
      {labels.map((l, i) => (
        <text key={i} x={pad + i * bw + bw / 2} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#6a7689">{l}</text>
      ))}
    </svg>
  );
}

function Donut({ value = 0.6, color = 'var(--brand-700)', size = 120, thick = 14, label }) {
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#ecf0f5" strokeWidth={thick} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={thick} fill="none"
                strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink-900)' }}>
            {Math.round(value * 100)}%
          </div>
          {label && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{label}</div>}
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  ic, Avatar, Sidebar, Topbar, PageHead,
  statusBadge, priBadge, demandStatusBadge,
  LineChart, BarChart, Donut,
});
