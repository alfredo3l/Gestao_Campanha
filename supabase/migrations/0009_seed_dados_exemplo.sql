-- ============================================================================
-- 0009 — Seed de dados de exemplo
-- ----------------------------------------------------------------------------
-- Replica os mocks de Sistema/data.js para que dashboard, listas e RLS possam
-- ser testados imediatamente. Todos os dados são fictícios (LGPD ok).
--
-- Idempotente: usa ON CONFLICT DO NOTHING nos campos UNIQUE (regiao, cpf).
-- Inserts seguem ordem de dependência: regiões → lideranças → apoiadores → demandas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Regiões / metas
-- ----------------------------------------------------------------------------
INSERT INTO campanha.metas_regiao (regiao, municipios, eleitores, meta_votos, prazo)
VALUES
  ('Capital — Campo Grande', ARRAY['Campo Grande'],                                            670000, 18000, '2026-10-04'),
  ('Cone Sul',               ARRAY['Dourados','Ponta Porã'],                                    235000,  9000, '2026-10-04'),
  ('Leste',                  ARRAY['Três Lagoas','Nova Andradina'],                             136000,  4500, '2026-10-04'),
  ('Pantanal',               ARRAY['Corumbá','Aquidauana'],                                     116000,  3800, '2026-10-04'),
  ('Sul',                    ARRAY['Naviraí'],                                                   42000,  1500, '2026-10-04'),
  ('Central',                ARRAY['Sidrolândia','Maracaju'],                                    68000,  2200, '2026-10-04'),
  ('Norte',                  ARRAY['Coxim'],                                                     25000,   900, '2026-10-04'),
  ('Bolsão',                 ARRAY['Paranaíba'],                                                 32000,  1100, '2026-10-04')
ON CONFLICT (regiao) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Lideranças (12)
-- ----------------------------------------------------------------------------
INSERT INTO campanha.liderancas (nome, cargo, municipio, bairro, tel, meta_votos, ativa)
VALUES
  ('Antônio Rocha',         'coord_regional',    'Campo Grande',   'Centro',           '(67) 99812-3344', 4500, true),
  ('Marisa Vieira',         'coord_regional',    'Dourados',       'Vila Progresso',   '(67) 99721-1208', 3000, true),
  ('João Pereira Neto',     'lider_bairro',      'Três Lagoas',    'Lapa',             '(67) 99655-8472', 1500, true),
  ('Cleusa Fernandes',      'lider_comunitario', 'Corumbá',        'Cervejaria',       '(67) 99588-3201', 1200, true),
  ('Rodrigo Albuquerque',   'coord_regional',    'Ponta Porã',     'Centro',           '(67) 99477-2255', 2000, true),
  ('Sebastiana Ortiz',      'lider_rural',       'Aquidauana',     'Distrito Camisão', '(67) 99388-1119',  600, true),
  ('Fernando Caetano',      'lider_bairro',      'Campo Grande',   'Coophavila II',    '(67) 99244-7706',  800, true),
  ('Ivone Quintana',        'coord_zona',        'Naviraí',        'Boa Vista',        '(67) 99155-3829', 1100, true),
  ('Marcos Dorneles',       'lider_comunitario', 'Sidrolândia',    'Vila Pacheco',     '(67) 99088-4471',  700, true),
  ('Patrícia Mendoza',      'lider_bairro',      'Campo Grande',   'Tiradentes',       '(67) 98944-2280',  950, true),
  ('Ronaldo Estigarribia',  'lider_rural',       'Maracaju',       'Centro',           '(67) 98877-1543',  750, false),
  ('Vanessa Couto',         'lider_bairro',      'Nova Andradina', 'Centro',           '(67) 98712-9034',  850, true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Apoiadores (~6 por liderança = 72) e demandas, num único bloco usando
--    CTEs e lookups por (nome, municipio) das lideranças.
-- ----------------------------------------------------------------------------
WITH ap_data(nome, cpf, lider_nome, lider_mun, municipio, bairro, status) AS (
  VALUES
    -- L-001 Antônio Rocha — Campo Grande / Centro
    ('Ana Beatriz Silva',         '11122233301', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'confirmado'::campanha.status_apoio),
    ('Carlos Eduardo Marques',    '11122233302', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'provavel'),
    ('Daniela Souza Lima',        '11122233303', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'indeciso'),
    ('Eduardo Mendes Costa',      '11122233304', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'contato'),
    ('Fernanda Cardoso',          '11122233305', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'confirmado'),
    ('Gilberto Almeida',          '11122233306', 'Antônio Rocha',        'Campo Grande',   'Campo Grande',   'Centro',           'provavel'),
    -- L-002 Marisa Vieira — Dourados / Vila Progresso
    ('Helena Bittencourt',        '11122233307', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'confirmado'),
    ('Igor Tavares',              '11122233308', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'provavel'),
    ('Joana Prado Ribeiro',       '11122233309', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'indeciso'),
    ('Kátia Regina Borges',       '11122233310', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'confirmado'),
    ('Leandro Pizzato',           '11122233311', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'contato'),
    ('Marcela Fontes',            '11122233312', 'Marisa Vieira',        'Dourados',       'Dourados',       'Vila Progresso',   'provavel'),
    -- L-003 João Pereira Neto — Três Lagoas / Lapa
    ('Nilson Schwarz',            '11122233313', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'confirmado'),
    ('Olívia Brandão',            '11122233314', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'provavel'),
    ('Paulo Roberto Salgado',     '11122233315', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'indeciso'),
    ('Quezia Pinheiro',           '11122233316', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'contato'),
    ('Renato Galvão',             '11122233317', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'confirmado'),
    ('Sandra Maciel',             '11122233318', 'João Pereira Neto',    'Três Lagoas',    'Três Lagoas',    'Lapa',             'provavel'),
    -- L-004 Cleusa Fernandes — Corumbá / Cervejaria
    ('Tiago Vasconcelos',         '11122233319', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'confirmado'),
    ('Úrsula Marçal',             '11122233320', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'provavel'),
    ('Vitor Hugo Camargo',        '11122233321', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'indeciso'),
    ('Wanda Lopes',               '11122233322', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'contato'),
    ('Xênia Maranhão',            '11122233323', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'confirmado'),
    ('Yuri Bezerra',              '11122233324', 'Cleusa Fernandes',     'Corumbá',        'Corumbá',        'Cervejaria',       'provavel'),
    -- L-005 Rodrigo Albuquerque — Ponta Porã / Centro
    ('Zilda Nogueira',            '11122233325', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'confirmado'),
    ('Adriana Espíndola',         '11122233326', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'provavel'),
    ('Bruno Casagrande',          '11122233327', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'indeciso'),
    ('Cecília Drumond',           '11122233328', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'contato'),
    ('Diego Rocha',               '11122233329', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'confirmado'),
    ('Elenice Bordin',            '11122233330', 'Rodrigo Albuquerque',  'Ponta Porã',     'Ponta Porã',     'Centro',           'provavel'),
    -- L-006 Sebastiana Ortiz — Aquidauana / Distrito Camisão
    ('Felipe Vianna',             '11122233331', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'confirmado'),
    ('Gabriela Lemos',            '11122233332', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'provavel'),
    ('Hugo Sandim',               '11122233333', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'indeciso'),
    ('Ana Beatriz Souza',         '11122233334', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'contato'),
    ('Carlos Mendonça',           '11122233335', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'confirmado'),
    ('Daniela Prates',            '11122233336', 'Sebastiana Ortiz',     'Aquidauana',     'Aquidauana',     'Distrito Camisão', 'provavel'),
    -- L-007 Fernando Caetano — Campo Grande / Coophavila II
    ('Eduardo Sampaio',           '11122233337', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'confirmado'),
    ('Fernanda Bittencourt',      '11122233338', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'provavel'),
    ('Gilberto Tavares',          '11122233339', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'indeciso'),
    ('Helena Prado',              '11122233340', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'contato'),
    ('Igor Borges',               '11122233341', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'confirmado'),
    ('Joana Pizzato',             '11122233342', 'Fernando Caetano',     'Campo Grande',   'Campo Grande',   'Coophavila II',    'provavel'),
    -- L-008 Ivone Quintana — Naviraí / Boa Vista
    ('Kátia Fontes',              '11122233343', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'confirmado'),
    ('Leandro Schwarz',           '11122233344', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'provavel'),
    ('Marcela Brandão',           '11122233345', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'indeciso'),
    ('Nilson Salgado',            '11122233346', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'contato'),
    ('Olívia Pinheiro',           '11122233347', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'confirmado'),
    ('Paulo Galvão',              '11122233348', 'Ivone Quintana',       'Naviraí',        'Naviraí',        'Boa Vista',        'provavel'),
    -- L-009 Marcos Dorneles — Sidrolândia / Vila Pacheco
    ('Quezia Maciel',             '11122233349', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'confirmado'),
    ('Renato Vasconcelos',        '11122233350', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'provavel'),
    ('Sandra Marçal',             '11122233351', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'indeciso'),
    ('Tiago Camargo',             '11122233352', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'contato'),
    ('Úrsula Lopes',              '11122233353', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'confirmado'),
    ('Vitor Maranhão',            '11122233354', 'Marcos Dorneles',      'Sidrolândia',    'Sidrolândia',    'Vila Pacheco',     'provavel'),
    -- L-010 Patrícia Mendoza — Campo Grande / Tiradentes
    ('Wanda Bezerra',             '11122233355', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'confirmado'),
    ('Xênia Nogueira',            '11122233356', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'provavel'),
    ('Yuri Espíndola',            '11122233357', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'indeciso'),
    ('Zilda Casagrande',          '11122233358', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'contato'),
    ('Adriana Drumond',           '11122233359', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'confirmado'),
    ('Bruno Bordin',              '11122233360', 'Patrícia Mendoza',     'Campo Grande',   'Campo Grande',   'Tiradentes',       'provavel'),
    -- L-011 Ronaldo Estigarribia — Maracaju / Centro
    ('Cecília Vianna',            '11122233361', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'confirmado'),
    ('Diego Lemos',               '11122233362', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'provavel'),
    ('Elenice Sandim',            '11122233363', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'indeciso'),
    ('Felipe Souza',              '11122233364', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'contato'),
    ('Gabriela Mendonça',         '11122233365', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'confirmado'),
    ('Hugo Prates',               '11122233366', 'Ronaldo Estigarribia', 'Maracaju',       'Maracaju',       'Centro',           'provavel'),
    -- L-012 Vanessa Couto — Nova Andradina / Centro
    ('Ana Beatriz Sampaio',       '11122233367', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'confirmado'),
    ('Carlos Bittencourt',        '11122233368', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'provavel'),
    ('Daniela Tavares',           '11122233369', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'indeciso'),
    ('Eduardo Prado',             '11122233370', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'contato'),
    ('Fernanda Borges',           '11122233371', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'confirmado'),
    ('Gilberto Pizzato',          '11122233372', 'Vanessa Couto',        'Nova Andradina', 'Nova Andradina', 'Centro',           'provavel')
)
INSERT INTO campanha.apoiadores (nome, cpf, municipio, bairro, lider_id, status, data_consentimento)
SELECT
  d.nome,
  d.cpf,
  d.municipio,
  d.bairro,
  (SELECT id FROM campanha.liderancas l WHERE l.nome = d.lider_nome AND l.municipio = d.lider_mun LIMIT 1),
  d.status,
  now()
FROM ap_data d
ON CONFLICT (cpf) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. Demandas (12) — referenciam liderança por (nome, municipio) e
--    solicitante por CPF (alguns sem solicitante).
-- ----------------------------------------------------------------------------
WITH dem_data(titulo, categoria, prioridade, status, lider_nome, lider_mun, solicitante_cpf, prazo) AS (
  VALUES
    ('Posto de saúde sem médico aos sábados',         'Saúde',               'alta'::campanha.prioridade,    'aberta'::campanha.status_demanda,    'Antônio Rocha',        'Campo Grande',   '11122233301', '2026-06-10'::date),
    ('Buraco na Rua das Acácias',                     'Infraestrutura',      'media',                         'andamento',                          'Marisa Vieira',        'Dourados',       '11122233307', '2026-06-02'::date),
    ('Falta de iluminação na praça central',          'Infraestrutura',      'media',                         'aberta',                             'Rodrigo Albuquerque',  'Ponta Porã',     '11122233325', '2026-06-20'::date),
    ('Vaga na creche municipal',                      'Educação',            'alta',                          'andamento',                          'Antônio Rocha',        'Campo Grande',   '11122233304', '2026-06-05'::date),
    ('Linha de ônibus para o bairro Pacheco',         'Transporte',          'media',                         'aberta',                             'Marcos Dorneles',      'Sidrolândia',    '11122233350', '2026-07-01'::date),
    ('Cesta básica para família em vulnerabilidade',  'Assistência Social',  'alta',                          'resolvida',                          'Cleusa Fernandes',     'Corumbá',        '11122233320', '2026-05-25'::date),
    ('Ronda da PM em horário escolar',                'Segurança',           'alta',                          'aberta',                             'Fernando Caetano',     'Campo Grande',   '11122233340', '2026-06-15'::date),
    ('Limpeza de bueiros antes das chuvas',           'Infraestrutura',      'alta',                          'andamento',                          'Patrícia Mendoza',     'Campo Grande',   '11122233356', '2026-06-12'::date),
    ('Reforma da quadra esportiva',                   'Infraestrutura',      'baixa',                         'aberta',                             'João Pereira Neto',    'Três Lagoas',    '11122233313', '2026-08-01'::date),
    ('Curso técnico para jovens',                     'Educação',            'media',                         'resolvida',                          'Ivone Quintana',       'Naviraí',        '11122233344', '2026-05-20'::date),
    ('Mutirão de catarata',                           'Saúde',               'alta',                          'andamento',                          'Sebastiana Ortiz',     'Aquidauana',     '11122233332', '2026-06-18'::date),
    ('Asfaltamento da Rua dos Ipês',                  'Infraestrutura',      'media',                         'resolvida',                          'Rodrigo Albuquerque',  'Ponta Porã',     '11122233328', '2026-05-22'::date)
)
INSERT INTO campanha.demandas (titulo, categoria, prioridade, status, lider_id, solicitante_id, prazo)
SELECT
  d.titulo,
  d.categoria,
  d.prioridade,
  d.status,
  (SELECT id FROM campanha.liderancas l WHERE l.nome = d.lider_nome AND l.municipio = d.lider_mun LIMIT 1),
  (SELECT id FROM campanha.apoiadores a WHERE a.cpf = d.solicitante_cpf LIMIT 1),
  d.prazo
FROM dem_data d
WHERE NOT EXISTS (SELECT 1 FROM campanha.demandas x WHERE x.titulo = d.titulo);

-- ----------------------------------------------------------------------------
-- 5. Tags exemplo para os 5 primeiros apoiadores confirmados
-- ----------------------------------------------------------------------------
INSERT INTO campanha.apoiador_tags (apoiador_id, tag)
SELECT a.id, t.tag
FROM (
  SELECT id FROM campanha.apoiadores WHERE status = 'confirmado' ORDER BY nome LIMIT 5
) a
CROSS JOIN (VALUES ('militante'), ('voluntário')) AS t(tag)
ON CONFLICT DO NOTHING;
