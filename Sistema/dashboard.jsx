/* global React, ic, MOCK, Avatar, PageHead, statusBadge, demandStatusBadge, priBadge, LineChart, BarChart, Donut */
/* ============================================================
   Dashboard
   ============================================================ */
function Dashboard({ onNav }) {
  const totalApoiadores = MOCK.apoiadores.length + 1340; // visible + simulated total
  const totalLider = MOCK.liderancas.filter(l => l.ativo).length;
  const metaTotal = MOCK.regioes.reduce((s, r) => s + r.meta, 0);
  const atingidoTotal = MOCK.regioes.reduce((s, r) => s + r.atingido, 0);
  const pctMeta = atingidoTotal / metaTotal;

  const openDemand = MOCK.demandas.filter(d => d.status !== 'resolvida').length;

  // Sample evolution data
  const semanas = ['S 16', 'S 17', 'S 18', 'S 19', 'S 20', 'S 21', 'S 22', 'S 23'];
  const evolucao = [820, 980, 1140, 1280, 1380, 1495, 1582, 1672];

  const porCategoria = [12, 18, 8, 5, 7, 4];
  const catLabels = ['Infra.', 'Saúde', 'Edu.', 'Trans.', 'Seg.', 'Soc.'];

  const recentes = MOCK.apoiadores.slice(0, 5);
  const demandasUrg = MOCK.demandas.filter(d => d.prioridade === 'Alta' && d.status !== 'resolvida').slice(0, 4);

  return (
    <>
      <PageHead
        title="Visão geral da campanha"
        sub="Última atualização: hoje, 14:32 · 71 dias para o pleito"
        actions={
          <>
            <button className="btn secondary"><span style={{ width: 15, height: 15 }}>{ic.calendar}</span> Últimos 30 dias</button>
            <button className="btn secondary">{ic.download} Exportar</button>
            <button className="btn primary" onClick={() => onNav('apoiador-novo')}>{ic.plus} Novo apoiador</button>
          </>
        }
      />

      <div className="grid-4 mb-20">
        <div className="kpi brand">
          <div className="ribbon"/>
          <div className="label">{ic.users} Apoiadores</div>
          <div className="value tabular">{(totalApoiadores).toLocaleString('pt-BR')}</div>
          <div className="delta"><strong>+148</strong> nesta semana</div>
        </div>
        <div className="kpi green">
          <div className="ribbon"/>
          <div className="label">{ic.star} Lideranças ativas</div>
          <div className="value tabular">{totalLider}</div>
          <div className="delta"><strong>+2</strong> no mês</div>
        </div>
        <div className="kpi gold">
          <div className="ribbon"/>
          <div className="label">{ic.target} Meta de votos</div>
          <div className="value tabular">
            {atingidoTotal.toLocaleString('pt-BR')}<span style={{ fontSize: 16, color: 'var(--ink-500)', fontWeight: 400 }}> / {metaTotal.toLocaleString('pt-BR')}</span>
          </div>
          <div className="delta"><strong>{Math.round(pctMeta * 100)}%</strong> atingido</div>
        </div>
        <div className="kpi violet">
          <div className="ribbon"/>
          <div className="label">{ic.inbox} Demandas abertas</div>
          <div className="value tabular">{openDemand}</div>
          <div className="delta down"><strong>3</strong> vencendo essa semana</div>
        </div>
      </div>

      <div className="grid-2 mb-20" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Evolução de apoiadores</h3>
              <div className="sub">Cadastros novos por semana · últimas 8 semanas</div>
            </div>
            <div className="row">
              <span className="badge green">{ic.arrowUp} +12,4%</span>
            </div>
          </div>
          <div className="card-body">
            <LineChart data={evolucao} labels={semanas} />
            <div className="legend">
              <div className="item"><span className="swatch" style={{ background: 'var(--brand-700)' }}/> Apoiadores acumulados</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Meta da campanha</h3>
            <div className="sub">Estado de MS</div>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <Donut value={pctMeta} color="var(--gold-500)" label="da meta" />
            <div style={{ flex: 1 }}>
              <div className="text-xs muted bold" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Próximo marco</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 600, marginTop: 4 }}>
                50% — 21 mil votos
              </div>
              <div className="muted text-sm" style={{ marginTop: 2 }}>Faltam {(metaTotal/2 - atingidoTotal).toLocaleString('pt-BR')} para atingir</div>
              <hr className="divider" />
              <div className="text-sm">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="muted">Capital</span>
                  <strong className="tabular">{Math.round(MOCK.regioes[0].atingido/MOCK.regioes[0].meta*100)}%</strong>
                </div>
                <div className="bar gold" style={{ margin: '6px 0 10px' }}>
                  <span style={{ width: (MOCK.regioes[0].atingido/MOCK.regioes[0].meta*100) + '%' }}/>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="muted">Interior</span>
                  <strong className="tabular">
                    {Math.round(MOCK.regioes.slice(1).reduce((s,r)=>s+r.atingido,0) / MOCK.regioes.slice(1).reduce((s,r)=>s+r.meta,0) * 100)}%
                  </strong>
                </div>
                <div className="bar green" style={{ marginTop: 6 }}>
                  <span style={{ width: Math.round(MOCK.regioes.slice(1).reduce((s,r)=>s+r.atingido,0) / MOCK.regioes.slice(1).reduce((s,r)=>s+r.meta,0) * 100) + '%' }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-20" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Demandas por categoria</h3>
              <div className="sub">Total recebido nas últimas 4 semanas</div>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={porCategoria} labels={catLabels} color="var(--green-700)" />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Top lideranças</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav('liderancas'); }} style={{ fontSize: 12.5 }}>Ver todas</a>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Liderança</th><th>Município</th><th style={{ textAlign:'right' }}>Apoiadores</th><th style={{ textAlign:'right' }}>Meta</th></tr></thead>
              <tbody>
                {[...MOCK.liderancas].filter(l => l.ativo).sort((a,b) => b.apoiadores - a.apoiadores).slice(0, 5).map(l => (
                  <tr key={l.id} onClick={() => onNav('lider-detalhe', l.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="name-cell">
                        <Avatar name={l.nome} size={28}/>
                        <div>
                          <div className="name">{l.nome}</div>
                          <div className="meta">{l.cargo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{l.municipio}</td>
                    <td style={{ textAlign:'right' }} className="tabular bold">{l.apoiadores}</td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className="tabular text-xs muted">{Math.round(l.votos_proj/l.meta*100)}%</span>
                        <div className="bar" style={{ width: 56 }}><span style={{ width: Math.min(100, l.votos_proj/l.meta*100) + '%' }}/></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-2 mb-20" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <h3>Demandas urgentes</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav('demandas'); }} style={{ fontSize: 12.5 }}>Ver todas as demandas</a>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Demanda</th><th>Categoria</th><th>Liderança</th><th>Status</th><th>Prazo</th></tr></thead>
              <tbody>
                {demandasUrg.map(d => {
                  const lider = MOCK.liderancas.find(l => l.id === d.liderId);
                  const prazo = new Date(d.prazo).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
                  return (
                    <tr key={d.id} onClick={() => onNav('demanda-detalhe', d.id)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="name">{d.titulo}</div>
                        <div className="muted text-xs">{d.id} · {priBadge(d.prioridade)}</div>
                      </td>
                      <td className="muted">{d.categoria}</td>
                      <td className="muted">{lider?.nome.split(' ').slice(0, 2).join(' ')}</td>
                      <td>{demandStatusBadge(d.status)}</td>
                      <td className="muted tabular">{prazo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Cadastros recentes</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav('apoiadores'); }} style={{ fontSize: 12.5 }}>Todos</a>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentes.map(a => {
              const lider = MOCK.liderancas.find(l => l.id === a.liderId);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--ink-100)' }}>
                  <Avatar name={a.nome} size={36}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{a.nome}</div>
                    <div className="muted text-xs">{a.municipio} · indicado por {lider?.nome.split(' ').slice(0,2).join(' ')}</div>
                  </div>
                  {statusBadge(a.status)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

window.Dashboard = Dashboard;
