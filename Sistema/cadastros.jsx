/* global React, ic, MOCK, Avatar, PageHead, statusBadge */
/* ============================================================
   Apoiadores · Lideranças · Metas
   ============================================================ */

// -------------- Apoiadores: lista --------------
function ApoiadoresList({ onNav }) {
  const [q, setQ] = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [muniF, setMuniF] = React.useState('');
  const [liderF, setLiderF] = React.useState('');

  const filtered = MOCK.apoiadores.filter(a =>
    (!q || (a.nome + a.cpf + a.bairro + a.tel).toLowerCase().includes(q.toLowerCase())) &&
    (!statusF || a.status === statusF) &&
    (!muniF || a.municipio === muniF) &&
    (!liderF || a.liderId === liderF)
  );

  const munis = [...new Set(MOCK.apoiadores.map(a => a.municipio))].sort();

  return (
    <>
      <PageHead
        title="Apoiadores"
        sub={`${MOCK.apoiadores.length} cadastros visíveis · 1.412 no total`}
        actions={
          <>
            <button className="btn secondary">{ic.upload} Importar CSV</button>
            <button className="btn secondary">{ic.download} Exportar</button>
            <button className="btn primary" onClick={() => onNav('apoiador-novo')}>{ic.plus} Novo apoiador</button>
          </>
        }
      />
      <div className="card">
        <div className="card-head">
          <div className="toolbar" style={{ margin: 0, width: '100%' }}>
            <div className="filter-input">
              {React.cloneElement(ic.search, { className: 'ico' })}
              <input placeholder="Buscar por nome, CPF, telefone, bairro…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="">Todos status</option>
              {MOCK.status.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
            <select value={muniF} onChange={e => setMuniF(e.target.value)}>
              <option value="">Todos municípios</option>
              {munis.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={liderF} onChange={e => setLiderF(e.target.value)}>
              <option value="">Todas lideranças</option>
              {MOCK.liderancas.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
            <button className="btn secondary">{ic.filter} Mais filtros</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Apoiador</th>
                <th className="table-mobile-hide">CPF</th>
                <th className="table-mobile-hide">Município / Bairro</th>
                <th className="table-mobile-hide">Liderança</th>
                <th>Status</th>
                <th className="table-mobile-hide">Cadastro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 24).map(a => {
                const lider = MOCK.liderancas.find(l => l.id === a.liderId);
                return (
                  <tr key={a.id} onClick={() => onNav('apoiador-edit', a.id)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="name-cell">
                        <Avatar name={a.nome} size={32}/>
                        <div>
                          <div className="name">{a.nome}</div>
                          <div className="meta">{a.tel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="muted tabular table-mobile-hide">{a.cpf}</td>
                    <td className="table-mobile-hide">
                      <div className="bold">{a.municipio}</div>
                      <div className="muted text-xs">{a.bairro}</div>
                    </td>
                    <td className="muted table-mobile-hide">{lider?.nome}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="muted tabular text-xs table-mobile-hide">12/05/2026</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn ghost sm icon-only" onClick={e => e.stopPropagation()}>{ic.more}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length > 24 && (
            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--ink-500)', borderTop: '1px solid var(--ink-100)' }}>
              <span>Mostrando 24 de {filtered.length}</span>
              <div className="row">
                <button className="btn ghost sm">Anterior</button>
                <button className="btn secondary sm">Próximo</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// -------------- Apoiador: form (novo/editar) --------------
function ApoiadorForm({ onNav, id }) {
  const isNew = !id;
  const existing = id ? MOCK.apoiadores.find(a => a.id === id) : null;
  const [tags, setTags] = React.useState(existing?.tags || []);
  const addTag = (t) => { if (t && !tags.includes(t)) setTags([...tags, t]); };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  return (
    <>
      <PageHead
        title={isNew ? 'Novo apoiador' : existing?.nome}
        sub={isNew ? 'Preencha os dados do cadastro' : `Cadastro ${existing?.id} · atualizado em 12/05/2026`}
        actions={
          <>
            <button className="btn secondary" onClick={() => onNav('apoiadores')}>Cancelar</button>
            {!isNew && <button className="btn danger">{ic.trash} Excluir</button>}
            <button className="btn primary" onClick={() => onNav('apoiadores')}>{ic.check} {isNew ? 'Cadastrar' : 'Salvar alterações'}</button>
          </>
        }
      />
      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-head"><h3>Dados pessoais</h3></div>
          <div className="card-body">
            <div className="form-grid">
              <div className="field col-2">
                <label>Nome completo *</label>
                <input type="text" defaultValue={existing?.nome || ''} placeholder="Nome completo do apoiador" />
              </div>
              <div className="field col-1">
                <label>CPF *</label>
                <input type="text" defaultValue={existing?.cpf || ''} placeholder="000.000.000-00" />
              </div>
              <div className="field col-1">
                <label>Data de nascimento</label>
                <input type="date" defaultValue={existing?.nascimento || ''} />
              </div>
              <div className="field col-1">
                <label>Telefone / WhatsApp *</label>
                <input type="tel" defaultValue={existing?.tel || ''} placeholder="(67) 99999-9999" />
              </div>
              <div className="field col-1">
                <label>Status do voto</label>
                <select defaultValue={existing?.status || 'contato'}>
                  {MOCK.status.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <hr className="divider" />
            <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-700)' }}>Título de eleitor</h4>
            <div className="form-grid">
              <div className="field col-2">
                <label>Número do título</label>
                <input type="text" defaultValue={existing?.titulo || ''} placeholder="0000 0000 0000" />
              </div>
              <div className="field col-1">
                <label>Zona</label>
                <input type="text" defaultValue={existing?.zona || ''} placeholder="000" />
              </div>
              <div className="field col-1">
                <label>Seção</label>
                <input type="text" defaultValue={existing?.secao || ''} placeholder="0000" />
              </div>
            </div>

            <hr className="divider" />
            <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-700)' }}>Endereço</h4>
            <div className="form-grid">
              <div className="field col-2">
                <label>Logradouro, número, complemento</label>
                <input type="text" defaultValue={existing?.endereco || ''} placeholder="Rua, número" />
              </div>
              <div className="field col-1">
                <label>Bairro / Região *</label>
                <input type="text" defaultValue={existing?.bairro || ''} placeholder="Bairro" />
              </div>
              <div className="field col-1">
                <label>Município *</label>
                <select defaultValue={existing?.municipio || 'Campo Grande'}>
                  {MOCK.municipios.map(m => <option key={m.nome}>{m.nome}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>Vínculo</h3></div>
            <div className="card-body">
              <div className="field">
                <label>Liderança responsável *</label>
                <select defaultValue={existing?.liderId || 'L-001'}>
                  {MOCK.liderancas.map(l => <option key={l.id} value={l.id}>{l.nome} — {l.municipio}</option>)}
                </select>
                <div className="hint">O apoiador será contabilizado nas metas da liderança escolhida.</div>
              </div>
              <div className="field">
                <label>Indicado por (opcional)</label>
                <input type="text" placeholder="Nome do indicante" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Tags e observações</h3></div>
            <div className="card-body">
              <div className="field">
                <label>Tags</label>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                  {tags.map(t => (
                    <span key={t} className="badge outline">
                      {t}
                      <button onClick={() => removeTag(t)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, marginLeft: 2, color: 'currentColor', display: 'inline-flex' }}>{ic.x}</button>
                    </span>
                  ))}
                  <button className="btn ghost sm" onClick={() => addTag(prompt('Nova tag?') || '')}>{ic.plus} adicionar</button>
                </div>
                <div className="hint">Sugestões: {MOCK.tags.slice(0, 4).join(', ')}</div>
              </div>
              <div className="field">
                <label>Observações</label>
                <textarea defaultValue={existing?.obs || ''} placeholder="Anotações internas sobre este apoiador…" rows={4}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// -------------- Lideranças: lista --------------
function LiderancasList({ onNav }) {
  const [q, setQ] = React.useState('');
  const [view, setView] = React.useState('cards'); // cards | table
  const filtered = MOCK.liderancas.filter(l => !q || (l.nome + l.municipio + l.bairro).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHead
        title="Lideranças"
        sub={`${MOCK.liderancas.filter(l => l.ativo).length} ativas de ${MOCK.liderancas.length}`}
        actions={
          <>
            <div className="row" style={{ background: '#fff', border: '1px solid var(--ink-200)', borderRadius: 6, padding: 2 }}>
              <button className={`btn ${view==='cards' ? 'secondary' : 'ghost'} sm`} onClick={() => setView('cards')} style={{ border: 'none' }}>Cards</button>
              <button className={`btn ${view==='table' ? 'secondary' : 'ghost'} sm`} onClick={() => setView('table')} style={{ border: 'none' }}>Tabela</button>
            </div>
            <button className="btn primary" onClick={() => onNav('lider-novo')}>{ic.plus} Nova liderança</button>
          </>
        }
      />
      <div className="toolbar">
        <div className="filter-input">
          {React.cloneElement(ic.search, { className: 'ico' })}
          <input placeholder="Buscar lideranças por nome, bairro, município…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select><option>Todos cargos</option><option>Coordenador Regional</option><option>Líder de Bairro</option><option>Líder Comunitário</option></select>
        <select><option>Todos municípios</option>{MOCK.municipios.map(m => <option key={m.nome}>{m.nome}</option>)}</select>
      </div>

      {view === 'cards' ? (
        <div className="grid-3">
          {filtered.map(l => {
            const pct = Math.min(100, Math.round(l.votos_proj / l.meta * 100));
            return (
              <div key={l.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onNav('lider-detalhe', l.id)}>
                <div className="card-body">
                  <div className="row" style={{ alignItems: 'flex-start' }}>
                    <Avatar name={l.nome} size={44}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="bold" style={{ color: 'var(--ink-900)' }}>{l.nome}</div>
                      <div className="muted text-xs">{l.cargo}</div>
                    </div>
                    {!l.ativo && <span className="badge outline">Inativa</span>}
                  </div>
                  <hr className="divider" />
                  <div className="text-sm muted row" style={{ marginBottom: 4 }}>
                    {React.cloneElement(ic.map, { className: 'ico', style: { width: 13, height: 13 } })}
                    {l.municipio} · {l.bairro}
                  </div>
                  <div className="text-sm muted row">
                    {React.cloneElement(ic.phone, { className: 'ico', style: { width: 13, height: 13 } })}
                    {l.tel}
                  </div>
                  <hr className="divider" />
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div className="text-xs muted">Apoiadores</div>
                      <div className="bold tabular" style={{ fontSize: 18, color: 'var(--ink-900)' }}>{l.apoiadores}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-xs muted">Meta de votos</div>
                      <div className="bold tabular" style={{ fontSize: 18, color: 'var(--ink-900)' }}>
                        {l.votos_proj.toLocaleString('pt-BR')} <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>/ {l.meta.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: 8, gap: 8 }}>
                    <div className={`bar ${pct>=90 ? 'green' : pct>=60 ? '' : 'gold'}`} style={{ flex: 1 }}>
                      <span style={{ width: pct + '%' }}/>
                    </div>
                    <span className="text-xs bold tabular" style={{ width: 36, textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card"><div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Liderança</th><th>Cargo</th><th>Município</th><th>Apoiadores</th><th>Progresso</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => onNav('lider-detalhe', l.id)} style={{ cursor: 'pointer' }}>
                  <td><div className="name-cell"><Avatar name={l.nome} size={28}/><div className="name">{l.nome}</div></div></td>
                  <td className="muted">{l.cargo}</td>
                  <td className="muted">{l.municipio} · {l.bairro}</td>
                  <td className="tabular bold">{l.apoiadores}</td>
                  <td><div className="row" style={{ gap: 8 }}><div className="bar" style={{ width: 80 }}><span style={{ width: Math.min(100, l.votos_proj/l.meta*100) + '%' }}/></div><span className="text-xs tabular">{Math.round(l.votos_proj/l.meta*100)}%</span></div></td>
                  <td>{l.ativo ? <span className="badge green"><span className="dot"/>Ativa</span> : <span className="badge outline">Inativa</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      )}
    </>
  );
}

// -------------- Liderança: detalhe --------------
function LiderDetalhe({ onNav, id }) {
  const l = MOCK.liderancas.find(x => x.id === id) || MOCK.liderancas[0];
  const apoiadoresL = MOCK.apoiadores.filter(a => a.liderId === l.id);
  const demandasL = MOCK.demandas.filter(d => d.liderId === l.id);
  const pct = Math.min(100, Math.round(l.votos_proj / l.meta * 100));
  const [tab, setTab] = React.useState('apoiadores');

  return (
    <>
      <PageHead
        title={l.nome}
        sub={`${l.cargo} · ${l.municipio} · ${l.bairro}`}
        actions={
          <>
            <button className="btn secondary" onClick={() => onNav('liderancas')}>← Voltar</button>
            <button className="btn secondary">{ic.phone} Contatar</button>
            <button className="btn primary">{ic.pencil} Editar</button>
          </>
        }
      />

      <div className="grid-4 mb-20">
        <div className="kpi brand"><div className="ribbon"/><div className="label">Apoiadores</div><div className="value tabular">{l.apoiadores}</div><div className="delta"><strong>+8</strong> esta semana</div></div>
        <div className="kpi green"><div className="ribbon"/><div className="label">Meta de votos</div><div className="value tabular">{l.meta.toLocaleString('pt-BR')}</div><div className="delta">Projeção: {l.votos_proj.toLocaleString('pt-BR')}</div></div>
        <div className="kpi gold"><div className="ribbon"/><div className="label">% atingido</div><div className="value tabular">{pct}%</div><div className="delta">{(l.meta - l.votos_proj).toLocaleString('pt-BR')} para fechar a meta</div></div>
        <div className="kpi violet"><div className="ribbon"/><div className="label">Demandas</div><div className="value tabular">{demandasL.length}</div><div className="delta">{demandasL.filter(d=>d.status!=='resolvida').length} abertas</div></div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div className="card-head" style={{ paddingBottom: 0, borderBottom: 'none' }}>
            <div className="tab-bar" style={{ margin: 0, border: 'none' }}>
              <button className={`tab ${tab==='apoiadores' ? 'active' : ''}`} onClick={() => setTab('apoiadores')}>Apoiadores ({apoiadoresL.length})</button>
              <button className={`tab ${tab==='demandas' ? 'active' : ''}`} onClick={() => setTab('demandas')}>Demandas ({demandasL.length})</button>
              <button className={`tab ${tab==='atividade' ? 'active' : ''}`} onClick={() => setTab('atividade')}>Atividade</button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0, borderTop: '1px solid var(--ink-200)' }}>
            {tab === 'apoiadores' && (
              <table className="table">
                <thead><tr><th>Nome</th><th>Bairro</th><th>Status</th><th>Telefone</th></tr></thead>
                <tbody>
                  {apoiadoresL.map(a => (
                    <tr key={a.id} onClick={() => onNav('apoiador-edit', a.id)} style={{ cursor: 'pointer' }}>
                      <td><div className="name-cell"><Avatar name={a.nome} size={28}/><div className="name">{a.nome}</div></div></td>
                      <td className="muted">{a.bairro}</td>
                      <td>{statusBadge(a.status)}</td>
                      <td className="muted tabular">{a.tel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'demandas' && (
              <table className="table">
                <thead><tr><th>Demanda</th><th>Categoria</th><th>Prioridade</th><th>Status</th></tr></thead>
                <tbody>
                  {demandasL.map(d => (
                    <tr key={d.id} onClick={() => onNav('demanda-detalhe', d.id)} style={{ cursor: 'pointer' }}>
                      <td><div className="name">{d.titulo}</div><div className="muted text-xs">{d.id}</div></td>
                      <td className="muted">{d.categoria}</td>
                      <td>{window.priBadge(d.prioridade)}</td>
                      <td>{window.demandStatusBadge(d.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tab === 'atividade' && (
              <div style={{ padding: 22 }}>
                <div className="timeline">
                  <div className="timeline-item green">
                    <div className="time">Hoje · 10:32</div>
                    <div className="body"><strong>{l.nome}</strong> cadastrou 3 novos apoiadores em {l.bairro}.</div>
                  </div>
                  <div className="timeline-item">
                    <div className="time">Ontem · 16:14</div>
                    <div className="body">Reunião com 12 lideranças locais — registro de 4 demandas.</div>
                  </div>
                  <div className="timeline-item amber">
                    <div className="time">Há 3 dias</div>
                    <div className="body">Atualização da meta de votos: +500 (revisão pós-evento).</div>
                  </div>
                  <div className="timeline-item">
                    <div className="time">Há 1 semana</div>
                    <div className="body">Distribuição de 200 materiais de campanha.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>Dados de contato</h3></div>
            <div className="card-body">
              <div className="text-sm" style={{ display: 'grid', gap: 10 }}>
                <div className="row"><span className="muted" style={{ width: 90 }}>Telefone</span><span className="bold tabular">{l.tel}</span></div>
                <div className="row"><span className="muted" style={{ width: 90 }}>Cargo</span><span>{l.cargo}</span></div>
                <div className="row"><span className="muted" style={{ width: 90 }}>Município</span><span>{l.municipio}</span></div>
                <div className="row"><span className="muted" style={{ width: 90 }}>Bairro</span><span>{l.bairro}</span></div>
                <div className="row"><span className="muted" style={{ width: 90 }}>Status</span>{l.ativo ? <span className="badge green"><span className="dot"/>Ativa</span> : <span className="badge outline">Inativa</span>}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3>Progresso da meta</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Donut value={l.votos_proj / l.meta} color="var(--green-700)" />
              <div className="text-sm muted" style={{ textAlign: 'center' }}>
                Projeção de <strong style={{ color: 'var(--ink-900)' }}>{l.votos_proj.toLocaleString('pt-BR')}</strong> votos
                <br/>de uma meta de <strong style={{ color: 'var(--ink-900)' }}>{l.meta.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// -------------- Liderança: form --------------
function LiderForm({ onNav }) {
  return (
    <>
      <PageHead
        title="Nova liderança"
        sub="Cadastre um coordenador, líder de bairro ou liderança comunitária"
        actions={<>
          <button className="btn secondary" onClick={() => onNav('liderancas')}>Cancelar</button>
          <button className="btn primary" onClick={() => onNav('liderancas')}>{ic.check} Cadastrar liderança</button>
        </>}
      />
      <div className="card" style={{ maxWidth: 820 }}>
        <div className="card-body">
          <h3 style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-700)' }}>Dados da liderança</h3>
          <div className="form-grid">
            <div className="field col-2"><label>Nome completo *</label><input type="text" placeholder="Nome completo"/></div>
            <div className="field col-1"><label>Cargo *</label>
              <select><option>Coordenador Regional</option><option>Coordenador de Zona</option><option>Líder de Bairro</option><option>Líder Comunitário</option><option>Líder Rural</option></select>
            </div>
            <div className="field col-1"><label>Telefone *</label><input type="tel" placeholder="(67) 99999-9999"/></div>
            <div className="field col-1"><label>Município *</label><select>{MOCK.municipios.map(m=> <option key={m.nome}>{m.nome}</option>)}</select></div>
            <div className="field col-1"><label>Bairro / Região *</label><input type="text" placeholder="Bairro"/></div>
            <div className="field col-2"><label>E-mail</label><input type="email" placeholder="email@exemplo.com"/></div>
          </div>
          <hr className="divider"/>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ink-700)' }}>Meta inicial de votos</h3>
          <div className="form-grid">
            <div className="field col-1"><label>Meta de votos para esta liderança</label><input type="number" placeholder="500" defaultValue={500}/><div className="hint">Você pode ajustar a meta depois em Metas de Votos.</div></div>
            <div className="field col-1"><label>Prazo da meta</label><input type="date" defaultValue="2026-10-04"/></div>
          </div>
        </div>
      </div>
    </>
  );
}

// -------------- Metas --------------
function MetasScreen() {
  const totalMeta = MOCK.regioes.reduce((s,r)=>s+r.meta, 0);
  const totalAting = MOCK.regioes.reduce((s,r)=>s+r.atingido, 0);
  return (
    <>
      <PageHead
        title="Metas de votos"
        sub="Por região geográfica · Deputado Estadual · MS"
        actions={<>
          <button className="btn secondary">{ic.download} Exportar</button>
          <button className="btn primary">{ic.pencil} Editar metas</button>
        </>}
      />
      <div className="grid-4 mb-20">
        <div className="kpi brand"><div className="ribbon"/><div className="label">Meta total</div><div className="value tabular">{totalMeta.toLocaleString('pt-BR')}</div><div className="delta">votos</div></div>
        <div className="kpi green"><div className="ribbon"/><div className="label">Projetado</div><div className="value tabular">{totalAting.toLocaleString('pt-BR')}</div><div className="delta"><strong>+1.842</strong> nos últimos 30 dias</div></div>
        <div className="kpi gold"><div className="ribbon"/><div className="label">% atingido</div><div className="value tabular">{Math.round(totalAting/totalMeta*100)}%</div><div className="delta">71 dias restantes</div></div>
        <div className="kpi violet"><div className="ribbon"/><div className="label">Eleitores no estado</div><div className="value tabular">1,93M</div><div className="delta">aproximadamente</div></div>
      </div>

      <div className="card mb-20">
        <div className="card-head">
          <div>
            <h3>Distribuição da meta por região</h3>
            <div className="sub">Clique numa região para ver lideranças e ajustar a meta</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost sm">{ic.filter} Filtrar</button>
            <button className="btn secondary sm">Visualizar mapa</button>
          </div>
        </div>
        <div className="card-body" style={{ padding: '8px 18px' }}>
          <div className="region-row" style={{ borderBottom: '1px solid var(--ink-200)', fontWeight: 700, color: 'var(--ink-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <div>Região</div>
            <div>Eleitores · Lideranças</div>
            <div>Progresso</div>
            <div style={{ textAlign: 'right' }}>Meta</div>
          </div>
          {MOCK.regioes.map((r,i) => {
            const pct = Math.round(r.atingido / r.meta * 100);
            const cl = pct >= 90 ? 'green' : pct >= 60 ? '' : pct >= 40 ? 'gold' : 'red';
            return (
              <div className="region-row" key={i}>
                <div>
                  <div className="label">{r.nome}</div>
                  <div className="muted text-xs">{r.liderancas} lideranças vinculadas</div>
                </div>
                <div>
                  <div className="num bold">{(r.eleitores/1000).toFixed(0)}k <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>eleitores</span></div>
                  <div className="muted text-xs">{(r.atingido/r.eleitores*100).toFixed(1)}% da base local</div>
                </div>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <div className={`bar ${cl}`} style={{ flex: 1 }}><span style={{ width: pct + '%' }}/></div>
                    <span className="text-xs bold tabular" style={{ width: 38, textAlign: 'right' }}>{pct}%</span>
                  </div>
                  <div className="muted text-xs" style={{ marginTop: 4 }}>{r.atingido.toLocaleString('pt-BR')} / {r.meta.toLocaleString('pt-BR')} votos</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="bold tabular">{r.meta.toLocaleString('pt-BR')}</div>
                  <a href="#" onClick={e=>e.preventDefault()} style={{ fontSize: 12 }}>Ajustar</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <h3>Projeção mensal de votos</h3>
            <div className="sub">Acumulado por mês até o pleito</div>
          </div>
          <div className="card-body">
            <BarChart data={[8400, 12100, 16200, 21800, 28500, 34200]} labels={['Mai','Jun','Jul','Ago','Set','Out']} color="var(--brand-700)" />
            <div className="legend">
              <div className="item"><span className="swatch" style={{ background: 'var(--brand-700)' }}/> Votos projetados</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Resumo executivo</h3></div>
          <div className="card-body">
            <div className="text-sm" style={{ display: 'grid', gap: 12 }}>
              <div>
                <div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Cenário base</div>
                <div className="bold" style={{ fontSize: 16, color: 'var(--ink-900)', marginTop: 2 }}>34.200 votos</div>
                <div className="muted">≈ quociente eleitoral previsto: 28.500</div>
              </div>
              <hr className="divider" style={{ margin: 0 }}/>
              <div>
                <div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Folga vs. quociente</div>
                <div className="bold" style={{ fontSize: 16, color: 'var(--green-700)', marginTop: 2 }}>+5.700 votos (20%)</div>
              </div>
              <hr className="divider" style={{ margin: 0 }}/>
              <div>
                <div className="muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Atenção</div>
                <div style={{ marginTop: 4 }} className="text-sm">
                  Norte e Bolsão estão abaixo de 50% da meta. Avaliar reforço de lideranças nessas regiões.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.ApoiadoresList = ApoiadoresList;
window.ApoiadorForm = ApoiadorForm;
window.LiderancasList = LiderancasList;
window.LiderDetalhe = LiderDetalhe;
window.LiderForm = LiderForm;
window.MetasScreen = MetasScreen;
