/* global React, ic */
/* ============================================================
   Login screen
   ============================================================ */
function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('coord@campanha.app');
  const [pw, setPw] = React.useState('••••••••••');
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 600);
  };

  return (
    <div className="login-page">
      <div className="hero">
        <div className="top">
          <div className="crest">CM</div>
          <div>
            <div style={{ fontWeight: 600, letterSpacing: 0.3 }}>Campanha 25</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>Gestão de Campanha · MS</div>
          </div>
        </div>
        <div>
          <h2>Coordene a campanha<br />com clareza de dados.</h2>
          <p>
            Cadastre apoiadores, organize lideranças por bairro, acompanhe metas
            de votos por região e responda demandas dos eleitores em um único lugar.
          </p>
          <div className="stats">
            <div><div className="v">12</div><div className="l">Lideranças ativas</div></div>
            <div><div className="v">1.412</div><div className="l">Apoiadores</div></div>
            <div><div className="v">41,2%</div><div className="l">Meta atingida</div></div>
          </div>
        </div>
        <div className="foot">
          © 2026 · Sistema interno de coordenação. Dados protegidos pela LGPD.
        </div>
      </div>
      <div className="form-side">
        <form className="login-card" onSubmit={submit}>
          <h3>Entrar no sistema</h3>
          <div className="lead">Acesse com seu e-mail institucional da campanha.</div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@campanha.app" />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="extra">
            <label><input type="checkbox" defaultChecked /> Manter conectado</label>
            <a href="#">Esqueci minha senha</a>
          </div>
          <button type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <div className="divider">OU</div>
          <button type="button" className="btn secondary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar com Google Workspace
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-500)', marginTop: 18 }}>
            Acesso restrito · solicite convite ao coordenador
          </div>
        </form>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
