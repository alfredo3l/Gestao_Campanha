/* global React, ic, MOCK, Avatar, PageHead, priBadge, demandStatusBadge, BarChart, LineChart */
/* ============================================================
   Demandas (kanban + timeline) · Detalhe · Relatórios · Config
   ============================================================ */

// -------------- Demanda card (kanban) --------------
function DemandCard({ d, onNav }) {
  const lider = MOCK.liderancas.find(l => l.id === d.liderId);
  const sol = MOCK.apoiadores.find(a => a.id === d.solicitante);
  const prazo = new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const isLate = new Date(d.prazo) < new Date() && d.status !== 'resolvida';
  return (
    <div className="demand-card" onClick={() => onNav('demanda-detalhe', d.id)}>
      <div className="top">
        <span className="id">{d.id} · {d.categoria}</span>
        {priBadge(d.prioridade)}
      </div>
      <div className="title">{d.titulo}</div>
      <div className="meta">
        <span className="who">
          <Avatar name={lider?.nome || '?'} size={20} />
          <span className="muted">{lider?.nome.split(' ').slice(0,2).join(' ')}</span>
        </span>
        <span className="spacer"/>
        <span className={isLate ? 'badge red' : 'muted text-xs'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {React.cloneElement(ic.calendar, { className: 'ico', style: { width: 12, height: 12 } })}
          {prazo}
        </span>
      </div>
    </div>
  );
}

// -------------- Demandas: lista (kanban / timeline) --------------
function DemandasScreen({ onNav, tweaks }) {
  const [view, setView] = React.useState(tweaks.demandView || 'kanban');
  React.useEffect(() => setView(tweaks.demandView || 'kanban'), [tweaks.demandView]);

  const [q, setQ] = React.useState('');
  const [catF, setCatF] = React.useState('');
  const [priF, setPriF] = React.useState('');

  const filtered = MOCK.demandas.filter(d =>
    (!q || (d.titulo + d.id + d.categoria).toLowerCase().includes(q.toLowerCase())) &&
    (!catF || d.categoria === catF) &&
    (!priF || d.prioridade === priF)
  );

  const abertas = filtered.filter(d => d.status === 'aberta');
  const andamento = filtered.filter(d => d.status === 'andamento');
  const resolvidas = filtered.filter(d => d.status === 'resolvida');

  return (
    <>
      <PageHead
        title="Demandas"
        sub={`${filtered.length} demandas · ${abertas.length} abertas · ${andamento.length} em andamento`}
        actions={
          <>
            <div className="row" style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 6, padding: 2 }}>
              <button className={`btn ${view==='kanban' ? 'secondary' : 'ghost'} sm`} onClick={() => setView('kanban')} style={{ border: 'none' }}>Kanban</button>
              <button className={`btn ${view==='timeline' ? 'secondary' : 'ghost'} sm`} onClick={() => setView('timeline')} style={{ border: 'none' }}>Timeline</button>
            </div>
            <button className="btn primary" onClick={() => onNav('demanda-detalhe', 'NEW')}>{ic.plus} Nova demanda</button>
          </>
        }
      />

      <div className="toolbar">
        <div className="filter-input">
          {React.cloneElement(ic.search, { className: 'ico' })}
          <input placeholder="Buscar por título, ID, categoria…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select value={catF} onChange={e => setCatF(e.target.value)}>
          <option value="">Todas categorias</option>
          {MOCK.categorias.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={priF} onChange={e => setPriF(e.target.value)}>
          <option value="">Todas prioridades</option>
          {MOCK.prioridades.map(p => <option key={p}>{p}</option>)}
        </select>
        <select><option>Todas lideranças</option></select>
      </div>

      {view === 'kanban' && (
        <div className="kanban">
          <div className="kanban-col aberta">
            <div className="col-head">
              <h4><span className="badge blue" style={{ padding: '1px 6px' }}><span className="dot"/></span> Aberta</h4>
              <span className="count">{abertas.length}</span>
            </div>
            <div className="col-body">
              {abertas.map(d => <DemandCard key={d.id} d={d} onNav={onNav}/>)}
              <button className="btn ghost sm" style={{ justifyContent: 'center', marginTop: 4 }}>{ic.plus} Adicionar</button>
            </div>
          </div>
          <div className="kanban-col andamento">
            <div className="col-head">
              <h4><span className="badge amber" style={{ padding: '1px 6px' }}><span className="dot"/></span> Em andamento</h4>
              <span className="count">{andamento.length}</span>
            </div>
            <div className="col-body">
              {andamento.map(d => <DemandCard key={d.id} d={d} onNav={onNav}/>)}
            </div>
          </div>
          <div className="kanban-col resolvida">
            <div className="col-head">
              <h4><span className="badge green" style={{ padding: '1px 6px' }}><span className="dot"/></span> Resolvida</h4>
              <span className="count">{resolvidas.length}</span>
            </div>
            <div className="col-body">
              {resolvidas.map(d => <DemandCard key={d.id} d={d} onNav={onNav}/>)}
            </div>
          </div>
        </div>
      )}

      {view === 'timeline' && (
        <div className="card">
          <div className="card-body" style={{ padding: 24 }}>
            <DemandTimeline items={filtered} onNav={onNav} />
          </div>
        </div>
      )}
    </>
  );
}

// -------------- Timeline view (groups by week) --------------
function DemandTimeline({ items, onNav }) {
  // group by week label (last week, this week, etc.)
  const groups = [
    { label: 'Esta semana',          when: 'criado nos últimos 7 dias', filter: (d) => daysAgo(d.criado) <= 7 },
    { label: 'Semana passada',        when: '8 a 14 dias atrás',          filter: (d) => daysAgo(d.criado) > 7 && daysAgo(d.criado) <= 14 },
    { label: 'Há 2 semanas',          when: '15 a 21 dias atrás',         filter: (d) => daysAgo(d.criado) > 14 && daysAgo(d.criado) <= 21 },
    { label: 'Mais de 3 semanas',     when: 'há mais tempo',              filter: (d) => daysAgo(d.criado) > 21 },
  ].map(g => ({ ...g, items: items.filter(g.filter) })).filter(g => g.items.length);

  function daysAgo(s) {
    return Math.floor((new Date('2026-05-24') - new Date(s)) / 86400000);
  }

  return (
    <div className="timeline">
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          <div className="timeline-item">
            <div className="time" style={{ fontSize: 13, color: 'var(--brand-800)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {g.label}
            </div>
            <div className="body muted text-xs">{g.when} · {g.items.length} demanda{g.items.length > 1 ? 's' : ''}</div>
          </div>
          {g.items.map(d => {
            const lider = MOCK.liderancas.find(l => l.id === d.liderId);
            const tone = d.status === 'resolvida' ? 'green' : d.status === 'andamento' ? 'amber' : '';
            return (
              <div className={`timeline-item ${tone}`} key={d.id} style={{ paddingBottom: 14 }}>
                <div className="time">{new Date(d.criado).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {d.id}</div>
                <div className="body" onClick={() => onNav('demanda-detalhe', d.id)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="bold" style={{ color: 'var(--ink-900)' }}>{d.titulo}</span>
                    {demandStatusBadge(d.status)}
                    {priBadge(d.prioridade)}
                  </div>
                  <div className="muted text-xs" style={{ marginTop: 4 }}>
                    {d.categoria} · {lider?.nome.split(' ').slice(0,2).join(' ')} · prazo {new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

// -------------- Demanda: detalhe --------------
function DemandaDetalhe({ onNav, id }) {
  const isNew = id === 'NEW';
  const d = !isNew ? (MOCK.demandas.find(x => x.id === id) || MOCK.demandas[0]) : null;
  const sol = d ? MOCK.apoiadores.find(a => a.id === d.solicitante) : null;
  const lider = d ? MOCK.liderancas.find(l => l.id === d.liderId) : null;
  const movs = d ? MOCK.movimentacoes.filter(m => m.demandaId === d.id) : [];

  return (
    <>
      <PageHead
        title={isNew ? 'Nova demanda' : d.titulo}
        sub={isNew ? 'Registre uma nova solicitação' : `${d.id} · criada em ${new Date(d.criado).toLocaleDateString('pt-BR')}`}
        actions={
          <>
            <button className="btn secondary" onClick={() => onNav('demandas')}>← Voltar</button>
            {!isNew && <button className="btn secondary">{ic.download} Imprimir</button>}
            <button className="btn primary" onClick={() => onNav('demandas')}>{ic.check} {isNew ? 'Registrar demanda' : 'Salvar alterações'}</button>
          </>
        }
      />
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>Informações da demanda</h3></div>
            <div className="card-body">
              <div className="form-grid">
                <div className="field col-2"><label>Título *</label><input type="text" defaultValue={d?.titulo || ''} placeholder="Resumo curto da solicitação"/></div>
                <div className="field col-1"><label>Categoria *</label><select defaultValue={d?.categoria || 'Saúde'}>{MOCK.categorias.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="field col-1"><label>Prioridade *</label><select defaultValue={d?.prioridade || 'Média'}>{MOCK.prioridades.map(p => <option key={p}>{p}</option>)}</select></div>
                <div className="field col-1"><label>Solicitante (apoiador)</label><select defaultValue={d?.solicitante || ''}>{MOCK.apoiadores.slice(0,30).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></div>
                <div className="field col-1"><label>Liderança responsável *</label><select defaultValue={d?.liderId || ''}>{MOCK.liderancas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</select></div>
                <div className="field col-1"><label>Prazo</label><input type="date" defaultValue={d?.prazo || ''}/></div>
                <div className="field col-1"><label>Status</label><select defaultValue={d?.status || 'aberta'}><option value="aberta">Aberta</option><option value="andamento">Em andamento</option><option value="resolvida">Resolvida</option></select></div>
                <div className="field col-2"><label>Descrição</label><textarea rows={5} defaultValue={d ? `Solicitante relata que ${d.titulo.toLowerCase()}. Necessária verificação no local e encaminhamento ao órgão competente.` : ''} placeholder="Detalhe a demanda com o máximo de informações relevantes…"/></div>
              </div>

              <hr className="divider"/>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Anexos</label>
                <div style={{ border: '1.5px dashed var(--ink-200)', borderRadius: 8, padding: 22, textAlign: 'center', background: 'var(--ink-50)' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    {React.cloneElement(ic.paperclip, { className: 'ico', style: { width: 24, height: 24, color: 'var(--ink-400)' } })}
                    <div className="text-sm muted">Arraste arquivos ou <a href="#" onClick={e=>e.preventDefault()}>selecione do computador</a></div>
                    <div className="text-xs muted">PDF, JPG, PNG até 10 MB</div>
                  </div>
                </div>
                {!isNew && (
                  <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <div className="row" style={{ padding: '6px 10px', border: '1px solid var(--ink-200)', borderRadius: 6, background: 'var(--white)', fontSize: 12.5 }}>
                      {React.cloneElement(ic.paperclip, { className: 'ico', style: { width: 13, height: 13, color: 'var(--ink-500)' } })}
                      foto-buraco-rua-acacias.jpg · 1.2 MB
                    </div>
                    <div className="row" style={{ padding: '6px 10px', border: '1px solid var(--ink-200)', borderRadius: 6, background: 'var(--white)', fontSize: 12.5 }}>
                      {React.cloneElement(ic.paperclip, { className: 'ico', style: { width: 13, height: 13, color: 'var(--ink-500)' } })}
                      oficio-prefeitura-2403.pdf · 480 KB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isNew && (
            <div className="card">
              <div className="card-head"><h3>Histórico e comentários</h3></div>
              <div className="card-body">
                <div className="timeline">
                  {movs.map((m, i) => (
                    <div key={i} className={`timeline-item ${m.tone}`}>
                      <div className="time">{m.when} · <strong style={{ color: 'var(--ink-700)' }}>{m.who}</strong></div>
                      <div className="body">{m.text}</div>
                    </div>
                  ))}
                  <div className="timeline-item">
                    <div className="time">há 10 dias · <strong style={{ color: 'var(--ink-700)' }}>{sol?.nome}</strong></div>
                    <div className="body">Demanda registrada inicialmente pelo solicitante.</div>
                  </div>
                </div>
                <hr className="divider"/>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Avatar name="Coord Regional" size={36}/>
                  <div style={{ flex: 1 }}>
                    <textarea rows={3} placeholder="Adicione um comentário ou atualização…" style={{ width: '100%', resize: 'vertical' }}/>
                    <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                      <button className="btn ghost sm">{ic.paperclip} Anexar</button>
                      <button className="btn primary sm">Publicar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col" style={{ gap: 18 }}>
          {!isNew && (
            <>
              <div className="card">
                <div className="card-head"><h3>Resumo</h3></div>
                <div className="card-body">
                  <div className="text-sm" style={{ display: 'grid', gap: 11 }}>
                    <div><div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Status</div><div style={{ marginTop: 4 }}>{demandStatusBadge(d.status)}</div></div>
                    <div><div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Prioridade</div><div style={{ marginTop: 4 }}>{priBadge(d.prioridade)}</div></div>
                    <div><div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Categoria</div><div style={{ marginTop: 4 }}>{d.categoria}</div></div>
                    <div><div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Prazo</div><div style={{ marginTop: 4 }} className="tabular">{new Date(d.prazo).toLocaleDateString('pt-BR')}</div></div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3>Solicitante</h3></div>
                <div className="card-body">
                  <div className="row" style={{ gap: 12 }}>
                    <Avatar name={sol?.nome || '?'} size={40}/>
                    <div>
                      <div className="bold" style={{ color: 'var(--ink-900)' }}>{sol?.nome}</div>
                      <div className="muted text-xs">{sol?.bairro} · {sol?.municipio}</div>
                      <div className="muted text-xs tabular">{sol?.tel}</div>
                    </div>
                  </div>
                  <hr className="divider"/>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn secondary sm" style={{ flex: 1, justifyContent: 'center' }}>{ic.phone} Ligar</button>
                    <button className="btn secondary sm" style={{ flex: 1, justifyContent: 'center' }}>{ic.mail} E-mail</button>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><h3>Liderança responsável</h3></div>
                <div className="card-body">
                  <div className="row" style={{ gap: 12 }}>
                    <Avatar name={lider?.nome || '?'} size={40}/>
                    <div>
                      <div className="bold" style={{ color: 'var(--ink-900)' }}>{lider?.nome}</div>
                      <div className="muted text-xs">{lider?.cargo}</div>
                      <div className="muted text-xs tabular">{lider?.tel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// -------------- Relatórios --------------
function Relatorios() {
  const reports = [
    { t: 'Apoiadores por região', d: 'Distribuição total por município e bairro', icon: ic.users, cl: 'brand' },
    { t: 'Conversão por liderança', d: 'Apoiadores cadastrados × votos projetados', icon: ic.star, cl: 'green' },
    { t: 'Progresso de metas', d: 'Comparativo mensal por região',           icon: ic.target, cl: 'gold' },
    { t: 'Demandas resolvidas',  d: 'Taxa de atendimento por categoria',     icon: ic.inbox, cl: 'violet' },
    { t: 'Cobertura geográfica',  d: 'Mapeamento de bairros sem liderança',   icon: ic.map, cl: 'brand' },
    { t: 'Atividade da equipe',   d: 'Cadastros e atualizações por usuário', icon: ic.user, cl: 'green' },
  ];
  return (
    <>
      <PageHead
        title="Relatórios"
        sub="Visões consolidadas e exportação de dados"
        actions={<button className="btn primary">{ic.plus} Novo relatório</button>}
      />

      <div className="card mb-20">
        <div className="card-head">
          <div>
            <h3>Performance da campanha · últimos 90 dias</h3>
            <div className="sub">Apoiadores cadastrados vs. demandas atendidas</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <select><option>Últimos 90 dias</option><option>Últimos 30 dias</option><option>Personalizado</option></select>
            <button className="btn secondary">{ic.download} CSV</button>
          </div>
        </div>
        <div className="card-body">
          <LineChart data={[120, 180, 240, 290, 340, 420, 500, 560, 640, 720, 810, 890]} labels={['S12','S13','S14','S15','S16','S17','S18','S19','S20','S21','S22','S23']} height={240}/>
          <div className="legend">
            <div className="item"><span className="swatch" style={{ background: 'var(--brand-700)' }}/> Novos apoiadores acumulados</div>
          </div>
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 12 }}>Relatórios disponíveis</h3>
      <div className="grid-3">
        {reports.map((r,i) => (
          <div key={i} className="card" style={{ cursor: 'pointer' }}>
            <div className="card-body">
              <div className="row" style={{ alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8,
                  background: r.cl === 'brand' ? 'var(--brand-100)' : r.cl === 'green' ? 'var(--green-100)' : r.cl === 'gold' ? 'var(--gold-100)' : 'var(--status-violet-100)',
                  color: r.cl === 'brand' ? 'var(--brand-700)' : r.cl === 'green' ? 'var(--green-700)' : r.cl === 'gold' ? 'var(--gold-600)' : 'var(--status-violet)',
                  display: 'grid', placeItems: 'center'
                }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="bold" style={{ color: 'var(--ink-900)' }}>{r.t}</div>
                  <div className="muted text-xs" style={{ marginTop: 2 }}>{r.d}</div>
                </div>
              </div>
              <hr className="divider"/>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="muted text-xs">Atualizado hoje</span>
                <a href="#" onClick={e=>e.preventDefault()} style={{ fontSize: 12.5 }}>Abrir →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// -------------- Configurações --------------
function Config() {
  const usuarios = [
    { nome: 'Coord. Regional',  email: 'coord@campanha.app',    role: 'Administrador',  ativo: true },
    { nome: 'Antônio Rocha',    email: 'antonio@campanha.app',  role: 'Coordenador',    ativo: true },
    { nome: 'Marisa Vieira',    email: 'marisa@campanha.app',   role: 'Coordenador',    ativo: true },
    { nome: 'Equipe Atendimento', email: 'atendimento@campanha.app', role: 'Operador',  ativo: true },
    { nome: 'Voluntário · João', email: 'joao.vol@campanha.app', role: 'Visualizador',  ativo: false },
  ];

  return (
    <>
      <PageHead title="Configurações" sub="Gestão de usuários, permissões e integrações" />
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <nav className="card" style={{ height: 'fit-content' }}>
          <div className="card-body" style={{ padding: 6 }}>
            {[
              ['Usuários do sistema', true],
              ['Permissões e papéis', false],
              ['Categorias de demandas', false],
              ['Status do apoiador', false],
              ['Integração com Supabase', false],
              ['LGPD e privacidade', false],
              ['Backup de dados', false],
              ['Histórico de auditoria', false],
            ].map(([t, a], i) => (
              <button key={i} className={`nav-item ${a ? 'active' : ''}`} style={{
                background: a ? 'var(--brand-100)' : 'transparent',
                color: a ? 'var(--brand-800)' : 'var(--ink-700)',
                fontWeight: a ? 600 : 500,
                boxShadow: a ? 'inset 2px 0 0 var(--brand-700)' : 'none',
                padding: '9px 12px',
                borderRadius: 6,
                width: '100%',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 2,
                fontSize: 13,
              }}>{t}</button>
            ))}
          </div>
        </nav>

        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Usuários do sistema</h3>
                <div className="sub">{usuarios.filter(u => u.ativo).length} usuários ativos</div>
              </div>
              <button className="btn primary sm">{ic.plus} Convidar usuário</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead><tr><th>Usuário</th><th>E-mail</th><th>Papel</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {usuarios.map((u, i) => (
                    <tr key={i}>
                      <td><div className="name-cell"><Avatar name={u.nome} size={28}/><div className="name">{u.nome}</div></div></td>
                      <td className="muted">{u.email}</td>
                      <td><span className={`badge ${u.role === 'Administrador' ? 'blue' : u.role === 'Coordenador' ? 'green' : u.role === 'Operador' ? 'gold' : 'outline'}`}>{u.role}</span></td>
                      <td>{u.ativo ? <span className="badge green"><span className="dot"/>Ativo</span> : <span className="badge outline">Inativo</span>}</td>
                      <td><button className="btn ghost sm icon-only">{ic.more}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Integração com Supabase</h3></div>
            <div className="card-body">
              <div className="row" style={{ padding: 12, background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: 8, gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--green-700)' }}/>
                <div style={{ flex: 1 }}>
                  <div className="bold" style={{ color: 'var(--green-900)' }}>Banco de dados conectado</div>
                  <div className="text-xs muted">Projeto: <span className="mono">gestao-campanha-prod</span> · região São Paulo · última sincronização há 2 min</div>
                </div>
                <button className="btn secondary sm">Detalhes</button>
              </div>
              <div className="form-grid" style={{ marginTop: 16 }}>
                <div className="field col-1"><label>URL do projeto</label><input type="text" defaultValue="https://xxxxxxxxxxxxx.supabase.co"/></div>
                <div className="field col-1"><label>Chave anon (public)</label><input type="text" defaultValue="eyJhbGciOiJIUzI1NiIs••••••••••"/></div>
                <div className="field col-2"><label>Service role key</label><input type="password" defaultValue="••••••••••••••••••••••"/><div className="hint">Mantenha esta chave em segredo. Usada apenas pelo servidor.</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.DemandasScreen = DemandasScreen;
window.DemandaDetalhe = DemandaDetalhe;
window.Relatorios = Relatorios;
window.Config = Config;
