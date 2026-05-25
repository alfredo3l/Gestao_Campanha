// Mock data — Mato Grosso do Sul, Deputado Estadual
// All names/numbers are fictional, for prototype purposes only.

window.MOCK = (() => {
  const municipios = [
    { nome: 'Campo Grande', regiao: 'Capital', eleitores: 670000 },
    { nome: 'Dourados', regiao: 'Cone Sul', eleitores: 170000 },
    { nome: 'Três Lagoas', regiao: 'Leste', eleitores: 95000 },
    { nome: 'Corumbá', regiao: 'Pantanal', eleitores: 78000 },
    { nome: 'Ponta Porã', regiao: 'Cone Sul', eleitores: 65000 },
    { nome: 'Naviraí', regiao: 'Sul', eleitores: 42000 },
    { nome: 'Aquidauana', regiao: 'Pantanal', eleitores: 38000 },
    { nome: 'Sidrolândia', regiao: 'Central', eleitores: 36000 },
    { nome: 'Maracaju', regiao: 'Central', eleitores: 32000 },
    { nome: 'Nova Andradina', regiao: 'Leste', eleitores: 41000 },
    { nome: 'Paranaíba', regiao: 'Bolsão', eleitores: 32000 },
    { nome: 'Coxim', regiao: 'Norte', eleitores: 25000 },
  ];

  const liderancas = [
    { id: 'L-001', nome: 'Antônio Rocha',        cargo: 'Coordenador Regional',  municipio: 'Campo Grande',  bairro: 'Centro',           tel: '(67) 99812-3344', meta: 4500, apoiadores: 312, votos_proj: 3820, ativo: true },
    { id: 'L-002', nome: 'Marisa Vieira',        cargo: 'Coordenadora Regional', municipio: 'Dourados',      bairro: 'Vila Progresso',   tel: '(67) 99721-1208', meta: 3000, apoiadores: 248, votos_proj: 2640, ativo: true },
    { id: 'L-003', nome: 'João Pereira Neto',    cargo: 'Líder de Bairro',       municipio: 'Três Lagoas',   bairro: 'Lapa',             tel: '(67) 99655-8472', meta: 1500, apoiadores: 134, votos_proj: 1290, ativo: true },
    { id: 'L-004', nome: 'Cleusa Fernandes',     cargo: 'Líder Comunitária',     municipio: 'Corumbá',       bairro: 'Cervejaria',       tel: '(67) 99588-3201', meta: 1200, apoiadores: 98,  votos_proj: 980,  ativo: true },
    { id: 'L-005', nome: 'Rodrigo Albuquerque',  cargo: 'Coordenador Regional',  municipio: 'Ponta Porã',    bairro: 'Centro',           tel: '(67) 99477-2255', meta: 2000, apoiadores: 156, votos_proj: 1720, ativo: true },
    { id: 'L-006', nome: 'Sebastiana Ortiz',     cargo: 'Líder Rural',           municipio: 'Aquidauana',    bairro: 'Distrito Camisão', tel: '(67) 99388-1119', meta: 600,  apoiadores: 51,  votos_proj: 540,  ativo: true },
    { id: 'L-007', nome: 'Fernando Caetano',     cargo: 'Líder de Bairro',       municipio: 'Campo Grande',  bairro: 'Coophavila II',    tel: '(67) 99244-7706', meta: 800,  apoiadores: 71,  votos_proj: 690,  ativo: true },
    { id: 'L-008', nome: 'Ivone Quintana',       cargo: 'Coordenadora de Zona',  municipio: 'Naviraí',       bairro: 'Boa Vista',        tel: '(67) 99155-3829', meta: 1100, apoiadores: 88,  votos_proj: 980,  ativo: true },
    { id: 'L-009', nome: 'Marcos Dorneles',      cargo: 'Líder Comunitário',     municipio: 'Sidrolândia',   bairro: 'Vila Pacheco',     tel: '(67) 99088-4471', meta: 700,  apoiadores: 42,  votos_proj: 520,  ativo: true },
    { id: 'L-010', nome: 'Patrícia Mendoza',     cargo: 'Líder de Bairro',       municipio: 'Campo Grande',  bairro: 'Tiradentes',       tel: '(67) 98944-2280', meta: 950,  apoiadores: 79,  votos_proj: 810,  ativo: true },
    { id: 'L-011', nome: 'Ronaldo Estigarribia', cargo: 'Líder Rural',           municipio: 'Maracaju',      bairro: 'Centro',           tel: '(67) 98877-1543', meta: 750,  apoiadores: 64,  votos_proj: 720,  ativo: false },
    { id: 'L-012', nome: 'Vanessa Couto',        cargo: 'Líder de Bairro',       municipio: 'Nova Andradina',bairro: 'Centro',           tel: '(67) 98712-9034', meta: 850,  apoiadores: 67,  votos_proj: 740,  ativo: true },
  ];

  const tags = ['confirmado', 'indeciso', 'simpatizante', 'militante', 'voluntário', 'evento-15-mar'];
  const status = ['confirmado', 'provável', 'indeciso', 'contato', 'não-vota'];

  const nomes = [
    'Ana Beatriz Silva', 'Carlos Eduardo Marques', 'Daniela Souza Lima', 'Eduardo Mendes Costa',
    'Fernanda Cardoso', 'Gilberto Almeida', 'Helena Bittencourt', 'Igor Tavares', 'Joana Prado Ribeiro',
    'Kátia Regina Borges', 'Leandro Pizzato', 'Marcela Fontes', 'Nilson Schwarz', 'Olívia Brandão',
    'Paulo Roberto Salgado', 'Quezia Pinheiro', 'Renato Galvão', 'Sandra Maciel', 'Tiago Vasconcelos',
    'Úrsula Marçal', 'Vitor Hugo Camargo', 'Wanda Lopes', 'Xênia Maranhão', 'Yuri Bezerra',
    'Zilda Nogueira', 'Adriana Espíndola', 'Bruno Casagrande', 'Cecília Drumond', 'Diego Rocha',
    'Elenice Bordin', 'Felipe Vianna', 'Gabriela Lemos', 'Hugo Sandim',
  ];

  // Generate apoiadores
  const apoiadores = [];
  let n = 1;
  for (const lider of liderancas) {
    const count = 6; // 6 visible per lider in the prototype
    for (let i = 0; i < count; i++) {
      const nome = nomes[(n + i * 7) % nomes.length];
      const st = status[(n + i) % status.length];
      apoiadores.push({
        id: 'A-' + String(1000 + n).padStart(4, '0'),
        nome,
        cpf: `${String(100 + (n*13)%900).padStart(3,'0')}.${String((n*7)%900+100).padStart(3,'0')}.${String((n*3)%900+100).padStart(3,'0')}-${String((n*9)%90+10)}`,
        titulo: `${String(100000000 + n*1023).padStart(12, '0')}`,
        zona: String(2 + (n % 70)).padStart(3, '0'),
        secao: String(10 + (n*3 % 400)).padStart(4, '0'),
        tel: `(67) 98${String(800+n%200).padStart(3,'0')}-${String(1000 + n*7 % 9000).padStart(4,'0')}`,
        nascimento: `19${60 + (n%40)}-${String(1+n%12).padStart(2,'0')}-${String(1+n%28).padStart(2,'0')}`,
        municipio: lider.municipio,
        bairro: lider.bairro,
        endereco: `Rua ${['das Acácias','Ipês','Marechal Rondon','Antônio João','do Café'][n%5]}, ${100+n*7}`,
        liderId: lider.id,
        status: st,
        tags: [tags[n%tags.length]],
        obs: '',
      });
      n++;
    }
  }

  const categorias = ['Saúde', 'Infraestrutura', 'Educação', 'Segurança', 'Transporte', 'Assistência Social'];
  const prioridades = ['Alta', 'Média', 'Baixa'];

  const demandas = [
    { id: 'D-2401', titulo: 'Posto de saúde sem médico aos sábados',         categoria: 'Saúde',           prioridade: 'Alta',  status: 'aberta',     solicitante: 'A-1003', liderId: 'L-001', prazo: '2026-06-10', criado: '2026-05-18' },
    { id: 'D-2402', titulo: 'Buraco na Rua das Acácias',                     categoria: 'Infraestrutura', prioridade: 'Média', status: 'andamento',  solicitante: 'A-1009', liderId: 'L-002', prazo: '2026-06-02', criado: '2026-05-15' },
    { id: 'D-2403', titulo: 'Falta de iluminação na praça central',          categoria: 'Infraestrutura', prioridade: 'Média', status: 'aberta',     solicitante: 'A-1012', liderId: 'L-005', prazo: '2026-06-20', criado: '2026-05-21' },
    { id: 'D-2404', titulo: 'Vaga na creche municipal',                      categoria: 'Educação',       prioridade: 'Alta',  status: 'andamento',  solicitante: 'A-1015', liderId: 'L-001', prazo: '2026-06-05', criado: '2026-05-10' },
    { id: 'D-2405', titulo: 'Linha de ônibus para o bairro Pacheco',         categoria: 'Transporte',     prioridade: 'Média', status: 'aberta',     solicitante: 'A-1051', liderId: 'L-009', prazo: '2026-07-01', criado: '2026-05-22' },
    { id: 'D-2406', titulo: 'Cesta básica para família em vulnerabilidade',  categoria: 'Assistência Social', prioridade: 'Alta', status: 'resolvida', solicitante: 'A-1024', liderId: 'L-004', prazo: '2026-05-25', criado: '2026-05-09' },
    { id: 'D-2407', titulo: 'Ronda da PM em horário escolar',                categoria: 'Segurança',      prioridade: 'Alta',  status: 'aberta',     solicitante: 'A-1031', liderId: 'L-007', prazo: '2026-06-15', criado: '2026-05-20' },
    { id: 'D-2408', titulo: 'Limpeza de bueiros antes das chuvas',           categoria: 'Infraestrutura', prioridade: 'Alta',  status: 'andamento',  solicitante: 'A-1042', liderId: 'L-010', prazo: '2026-06-12', criado: '2026-05-19' },
    { id: 'D-2409', titulo: 'Reforma da quadra esportiva',                   categoria: 'Infraestrutura', prioridade: 'Baixa', status: 'aberta',     solicitante: 'A-1018', liderId: 'L-003', prazo: '2026-08-01', criado: '2026-05-12' },
    { id: 'D-2410', titulo: 'Curso técnico para jovens',                     categoria: 'Educação',       prioridade: 'Média', status: 'resolvida', solicitante: 'A-1027', liderId: 'L-008', prazo: '2026-05-20', criado: '2026-04-30' },
    { id: 'D-2411', titulo: 'Mutirão de catarata',                           categoria: 'Saúde',          prioridade: 'Alta',  status: 'andamento',  solicitante: 'A-1058', liderId: 'L-006', prazo: '2026-06-18', criado: '2026-05-16' },
    { id: 'D-2412', titulo: 'Asfaltamento da Rua dos Ipês',                  categoria: 'Infraestrutura', prioridade: 'Média', status: 'resolvida', solicitante: 'A-1037', liderId: 'L-005', prazo: '2026-05-22', criado: '2026-04-25' },
  ];

  const movimentacoes = [
    { demandaId: 'D-2401', when: 'há 2 dias',    who: 'Antônio Rocha',  text: 'Demanda registrada via WhatsApp da liderança.', tone: 'blue' },
    { demandaId: 'D-2401', when: 'há 1 dia',     who: 'Equipe Saúde',   text: 'Encaminhada ao gabinete da secretária municipal.', tone: 'amber' },
    { demandaId: 'D-2401', when: 'há 3 horas',   who: 'Ana B. Silva',   text: 'Solicitante confirmou contato com a equipe técnica.', tone: 'amber' },
    { demandaId: 'D-2402', when: 'há 9 dias',    who: 'Marisa Vieira',  text: 'Visita técnica realizada — buraco identificado.', tone: 'blue' },
    { demandaId: 'D-2402', when: 'há 4 dias',    who: 'Prefeitura',     text: 'Inserido na fila de tapa-buracos da semana 22.', tone: 'amber' },
    { demandaId: 'D-2406', when: 'há 15 dias',   who: 'Cleusa F.',      text: 'Cadastro encaminhado ao CRAS.', tone: 'blue' },
    { demandaId: 'D-2406', when: 'há 2 dias',    who: 'Equipe Social',  text: 'Cesta entregue à família — protocolo CRAS-1248.', tone: 'green' },
  ];

  // Regional aggregates for metas
  const regioes = [
    { nome: 'Capital — Campo Grande', eleitores: 670000, meta: 18000, atingido: 14820, liderancas: 3 },
    { nome: 'Cone Sul',               eleitores: 235000, meta:  9000, atingido:  6680, liderancas: 2 },
    { nome: 'Leste',                  eleitores: 136000, meta:  4500, atingido:  3220, liderancas: 2 },
    { nome: 'Pantanal',               eleitores: 116000, meta:  3800, atingido:  3010, liderancas: 2 },
    { nome: 'Sul',                    eleitores:  42000, meta:  1500, atingido:  1180, liderancas: 1 },
    { nome: 'Central',                eleitores:  68000, meta:  2200, atingido:   930, liderancas: 1 },
    { nome: 'Norte',                  eleitores:  25000, meta:   900, atingido:   480, liderancas: 0 },
    { nome: 'Bolsão',                 eleitores:  32000, meta:  1100, atingido:   420, liderancas: 0 },
  ];

  return {
    municipios, liderancas, apoiadores, demandas, movimentacoes,
    regioes, categorias, prioridades, tags, status
  };
})();
