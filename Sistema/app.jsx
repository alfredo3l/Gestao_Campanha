/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle */
/* global LoginScreen, Dashboard, ApoiadoresList, ApoiadorForm, LiderancasList, LiderDetalhe, LiderForm, MetasScreen, DemandasScreen, DemandaDetalhe, Relatorios, Config */
/* global Sidebar, Topbar, MOCK, ic */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "device": "desktop",
  "demandView": "kanban"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [authed, setAuthed] = React.useState(true);
  const [route, setRoute] = React.useState('dashboard');
  const [param, setParam] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const openDemand = MOCK.demandas.filter(d => d.status !== 'resolvida').length;

  const nav = (id, p) => {
    if (id === 'menu') { setMobileMenuOpen(true); return; }
    setRoute(id);
    setParam(p || null);
    setMobileMenuOpen(false);
    // scroll the main area back to top
    setTimeout(() => {
      document.querySelectorAll('.main').forEach(el => el.scrollTop = 0);
    }, 0);
  };

  if (!authed) {
    return (
      <>
        <LoginScreen onLogin={() => setAuthed(true)}/>
        <TweaksPanel title="Tweaks">
          <TweakSection label="Layout"/>
          <TweakRadio label="Dispositivo" value={t.device} options={['desktop','mobile']} onChange={v => setTweak('device', v)}/>
        </TweaksPanel>
      </>
    );
  }

  const screen = renderScreen(route, param, nav, t);
  const isMobile = t.device === 'mobile';

  const shell = (
    <div className={`app ${isMobile ? 'mobile' : ''}`}>
      <Sidebar route={route} onNav={nav} openCount={openDemand}/>
      <Topbar route={route} onNav={nav} onLogout={() => setAuthed(false)} mobile={isMobile}/>
      <main className={`main ${isMobile ? 'compact' : ''}`}>
        {screen}
      </main>
      {isMobile && <MobileTabbar route={route} onNav={nav}/>}
      {isMobile && mobileMenuOpen && <MobileMenu route={route} onNav={nav} openCount={openDemand} onClose={() => setMobileMenuOpen(false)}/>}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div style={{ minHeight: '100vh', background: 'var(--ink-100)', display: 'grid', placeItems: 'start center', padding: '20px 0' }}>
          <div className="mobile-wrap">
            <div className="mobile-screen">
              <div className="mobile-status">
                <span>9:41</span>
                <span style={{ display: 'inline-flex', gap: 6 }}>
                  <svg width="16" height="11" viewBox="0 0 16 11"><path fill="currentColor" d="M1 7h2v3H1zm4-2h2v5H5zm4-2h2v7H9zm4-2h2v9h-2z"/></svg>
                  <svg width="14" height="11" viewBox="0 0 14 11"><path fill="currentColor" d="M7 0a8 8 0 0 1 5.66 2.34l-1.41 1.41a6 6 0 0 0-8.5 0L1.34 2.34A8 8 0 0 1 7 0zm0 4a4 4 0 0 1 2.83 1.17l-1.42 1.42a2 2 0 0 0-2.82 0L4.17 5.17A4 4 0 0 1 7 4zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
                  <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="19" height="10" rx="2" fill="none" stroke="currentColor"/><rect x="2" y="2" width="14" height="7" rx="1" fill="currentColor"/><rect x="20" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
                </span>
              </div>
              {shell}
            </div>
          </div>
        </div>
      ) : shell}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout"/>
        <TweakRadio label="Dispositivo" value={t.device} options={['desktop','mobile']} onChange={v => setTweak('device', v)}/>
        <TweakSection label="Demandas"/>
        <TweakRadio label="Visualização padrão" value={t.demandView} options={['kanban','timeline']} onChange={v => setTweak('demandView', v)}/>
      </TweaksPanel>
    </>
  );
}

function renderScreen(route, param, nav, t) {
  switch (route) {
    case 'dashboard':       return <Dashboard onNav={nav}/>;
    case 'apoiadores':      return <ApoiadoresList onNav={nav}/>;
    case 'apoiador-novo':   return <ApoiadorForm onNav={nav}/>;
    case 'apoiador-edit':   return <ApoiadorForm onNav={nav} id={param}/>;
    case 'liderancas':      return <LiderancasList onNav={nav}/>;
    case 'lider-novo':      return <LiderForm onNav={nav}/>;
    case 'lider-detalhe':   return <LiderDetalhe onNav={nav} id={param}/>;
    case 'metas':           return <MetasScreen/>;
    case 'demandas':        return <DemandasScreen onNav={nav} tweaks={t}/>;
    case 'demanda-detalhe': return <DemandaDetalhe onNav={nav} id={param}/>;
    case 'relatorios':      return <Relatorios/>;
    case 'config':          return <Config/>;
    default:                return <Dashboard onNav={nav}/>;
  }
}

// Mobile bottom tab bar
function MobileTabbar({ route, onNav }) {
  const tabs = [
    { id: 'dashboard',  label: 'Início',     icon: ic.dashboard },
    { id: 'apoiadores', label: 'Apoiadores', icon: ic.users },
    { id: 'liderancas', label: 'Lideranças', icon: ic.star },
    { id: 'demandas',   label: 'Demandas',   icon: ic.inbox },
    { id: 'metas',      label: 'Metas',      icon: ic.target },
  ];
  return (
    <div className="mobile-tabbar">
      {tabs.map(t => (
        <button key={t.id} className={route.startsWith(t.id) || (t.id === 'liderancas' && route.startsWith('lider')) || (t.id === 'apoiadores' && route.startsWith('apoiador')) || (t.id === 'demandas' && route.startsWith('demanda')) ? 'active' : ''} onClick={() => onNav(t.id)}>
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// Mobile slide-in menu (full nav)
function MobileMenu({ route, onNav, openCount, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      background: 'rgba(10,37,64,0.45)',
      display: 'flex',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 260, height: '100%' }}>
        <Sidebar route={route} onNav={(id) => { onNav(id); onClose(); }} openCount={openCount}/>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
