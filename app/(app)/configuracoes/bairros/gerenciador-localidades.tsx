"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  alternarAtivoBairro,
  alternarAtivoSetor,
  atualizarBairro,
  atualizarSetor,
  criarBairro,
  criarSetor,
  definirSetorDoBairro,
  excluirBairro,
  excluirSetor,
} from "./actions";

interface SetorRow {
  id: string;
  numero: number;
  nome: string;
  municipio: string;
  cor: string | null;
  ativo: boolean;
}

interface BairroRow {
  id: string;
  nome: string;
  municipio: string;
  setor_id: string | null;
  ativo: boolean;
}

interface Props {
  setores: SetorRow[];
  bairros: BairroRow[];
  usoPorBairro: Record<string, number>;
  usoPorSetor: Record<string, number>;
  /** Municípios já existentes nas tabelas (para os pickers). */
  municipiosCadastrados: string[];
}

const MUNICIPIO_PADRAO = "Três Lagoas";
const SEM_SETOR = "__none__";

export function GerenciadorLocalidades({
  setores,
  bairros,
  usoPorBairro,
  usoPorSetor,
  municipiosCadastrados,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [municipioFiltro, setMunicipioFiltro] = useState<string>(
    municipiosCadastrados[0] ?? MUNICIPIO_PADRAO
  );
  const [buscaBairro, setBuscaBairro] = useState("");

  // Estado de criação de setor
  const [novoSetorNumero, setNovoSetorNumero] = useState<number>(
    (setores
      .filter((s) => s.municipio === municipioFiltro)
      .reduce((max, s) => Math.max(max, s.numero), 0) ?? 0) + 1
  );
  const [novoSetorNome, setNovoSetorNome] = useState("");

  // Estado de criação de bairro
  const [novoBairroNome, setNovoBairroNome] = useState("");
  const [novoBairroSetor, setNovoBairroSetor] = useState<string>(SEM_SETOR);

  // Estado de edição inline
  const [setorEditandoId, setSetorEditandoId] = useState<string | null>(null);
  const [setorEdicaoNumero, setSetorEdicaoNumero] = useState<number>(0);
  const [setorEdicaoNome, setSetorEdicaoNome] = useState("");

  const [bairroEditandoId, setBairroEditandoId] = useState<string | null>(null);
  const [bairroEdicaoNome, setBairroEdicaoNome] = useState("");

  const setoresDoMunicipio = useMemo(
    () => setores.filter((s) => s.municipio === municipioFiltro),
    [setores, municipioFiltro]
  );

  const bairrosDoMunicipio = useMemo(() => {
    const q = buscaBairro.trim().toLowerCase();
    return bairros
      .filter((b) => b.municipio === municipioFiltro)
      .filter((b) => (q ? b.nome.toLowerCase().includes(q) : true));
  }, [bairros, municipioFiltro, buscaBairro]);

  const municipiosOpcoes = useMemo(() => {
    const set = new Set(municipiosCadastrados);
    set.add(MUNICIPIO_PADRAO);
    return Array.from(set).sort();
  }, [municipiosCadastrados]);

  // ---------- Setores ----------

  function criarSetorHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!novoSetorNome.trim()) {
      toast.error("Informe o nome do setor.");
      return;
    }
    const fd = new FormData();
    fd.set("numero", String(novoSetorNumero));
    fd.set("nome", novoSetorNome);
    fd.set("municipio", municipioFiltro);

    startTransition(async () => {
      const res = await criarSetor({}, fd);
      if (res.error) {
        toast.error("Não foi possível criar o setor", { description: res.error });
        return;
      }
      toast.success("Setor criado");
      setNovoSetorNome("");
      setNovoSetorNumero(novoSetorNumero + 1);
    });
  }

  function iniciarEdicaoSetor(s: SetorRow) {
    setSetorEditandoId(s.id);
    setSetorEdicaoNumero(s.numero);
    setSetorEdicaoNome(s.nome);
  }

  function salvarEdicaoSetor(id: string) {
    if (!setorEdicaoNome.trim()) {
      toast.error("Nome do setor não pode ficar vazio.");
      return;
    }
    const fd = new FormData();
    fd.set("numero", String(setorEdicaoNumero));
    fd.set("nome", setorEdicaoNome);

    startTransition(async () => {
      const res = await atualizarSetor(id, {}, fd);
      if (res.error) {
        toast.error("Falha ao salvar", { description: res.error });
        return;
      }
      toast.success("Setor atualizado");
      setSetorEditandoId(null);
    });
  }

  function toggleSetor(s: SetorRow) {
    startTransition(async () => {
      const res = await alternarAtivoSetor(s.id, !s.ativo);
      if (res.error) {
        toast.error("Falha ao alterar status", { description: res.error });
        return;
      }
      toast.success(s.ativo ? "Setor desativado" : "Setor ativado");
    });
  }

  function excluirSetorHandler(s: SetorRow) {
    const uso = usoPorSetor[s.id] ?? 0;
    if (uso > 0) {
      toast.error(`Este setor tem ${uso} bairro(s). Realoque antes de excluir.`);
      return;
    }
    if (!window.confirm(`Excluir definitivamente o setor "${s.nome}"?`)) return;
    startTransition(async () => {
      const res = await excluirSetor(s.id);
      if (res.error) {
        toast.error("Falha ao excluir", { description: res.error });
        return;
      }
      toast.success("Setor excluído");
    });
  }

  // ---------- Bairros ----------

  function criarBairroHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!novoBairroNome.trim()) {
      toast.error("Informe o nome do bairro.");
      return;
    }
    const fd = new FormData();
    fd.set("nome", novoBairroNome);
    fd.set("municipio", municipioFiltro);
    if (novoBairroSetor !== SEM_SETOR) fd.set("setor_id", novoBairroSetor);

    startTransition(async () => {
      const res = await criarBairro({}, fd);
      if (res.error) {
        toast.error("Não foi possível criar o bairro", { description: res.error });
        return;
      }
      toast.success("Bairro criado");
      setNovoBairroNome("");
      setNovoBairroSetor(SEM_SETOR);
    });
  }

  function iniciarEdicaoBairro(b: BairroRow) {
    setBairroEditandoId(b.id);
    setBairroEdicaoNome(b.nome);
  }

  function salvarEdicaoBairro(b: BairroRow) {
    if (!bairroEdicaoNome.trim()) {
      toast.error("Nome do bairro não pode ficar vazio.");
      return;
    }
    const fd = new FormData();
    fd.set("nome", bairroEdicaoNome);
    if (b.setor_id) fd.set("setor_id", b.setor_id);

    startTransition(async () => {
      const res = await atualizarBairro(b.id, {}, fd);
      if (res.error) {
        toast.error("Falha ao salvar", { description: res.error });
        return;
      }
      toast.success("Bairro atualizado");
      setBairroEditandoId(null);
    });
  }

  function mudarSetorDoBairro(b: BairroRow, novoSetorId: string) {
    const setor_id = novoSetorId === SEM_SETOR ? null : novoSetorId;
    startTransition(async () => {
      const res = await definirSetorDoBairro(b.id, setor_id);
      if (res.error) {
        toast.error("Falha ao alterar setor", { description: res.error });
        return;
      }
      toast.success("Setor do bairro atualizado");
    });
  }

  function toggleBairro(b: BairroRow) {
    startTransition(async () => {
      const res = await alternarAtivoBairro(b.id, !b.ativo);
      if (res.error) {
        toast.error("Falha ao alterar status", { description: res.error });
        return;
      }
      toast.success(b.ativo ? "Bairro desativado" : "Bairro ativado");
    });
  }

  function excluirBairroHandler(b: BairroRow) {
    const uso = usoPorBairro[b.id] ?? 0;
    if (uso > 0) {
      toast.error(
        `Este bairro está em uso por ${uso} registro(s). Desative em vez de excluir.`
      );
      return;
    }
    if (!window.confirm(`Excluir definitivamente o bairro "${b.nome}"?`)) return;
    startTransition(async () => {
      const res = await excluirBairro(b.id);
      if (res.error) {
        toast.error("Falha ao excluir", { description: res.error });
        return;
      }
      toast.success("Bairro excluído");
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="municipio-filtro">Município</Label>
          <Select
            value={municipioFiltro}
            onValueChange={(v) => setMunicipioFiltro(v)}
          >
            <SelectTrigger id="municipio-filtro" className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {municipiosOpcoes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-2xs text-ink-500">
            Por enquanto a estrutura é usada principalmente para Três Lagoas, mas o
            mesmo cadastro suporta outras cidades.
          </p>
        </div>
      </div>

      {/* ============================== SETORES ============================== */}
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Setores · {municipioFiltro}
          </h3>
          <span className="text-2xs text-ink-500">
            {setoresDoMunicipio.length} cadastrado(s)
          </span>
        </header>

        <form
          onSubmit={criarSetorHandler}
          className="rounded-md border border-ink-200 bg-ink-50/30 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Plus className="h-4 w-4" /> Novo setor
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[110px_1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="novo-setor-numero">Número *</Label>
              <Input
                id="novo-setor-numero"
                type="number"
                min={1}
                value={novoSetorNumero}
                onChange={(e) => setNovoSetorNumero(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="novo-setor-nome">Nome *</Label>
              <Input
                id="novo-setor-nome"
                value={novoSetorNome}
                onChange={(e) => setNovoSetorNome(e.target.value)}
                placeholder="ex.: Setor 8 — Distrito"
                maxLength={80}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full md:w-auto">
                {pending ? "Salvando…" : "Adicionar"}
              </Button>
            </div>
          </div>
        </form>

        {setoresDoMunicipio.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500">
            Nenhum setor cadastrado em {municipioFiltro}.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Nº</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Bairros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setoresDoMunicipio.map((s) => {
                const emEdicao = setorEditandoId === s.id;
                const uso = usoPorSetor[s.id] ?? 0;
                return (
                  <TableRow key={s.id} className={!s.ativo ? "opacity-60" : ""}>
                    <TableCell className="font-mono-tab text-xs text-ink-700">
                      {emEdicao ? (
                        <Input
                          type="number"
                          min={1}
                          value={setorEdicaoNumero}
                          onChange={(e) =>
                            setSetorEdicaoNumero(Number(e.target.value))
                          }
                          className="h-7 w-16 text-xs"
                        />
                      ) : (
                        s.numero
                      )}
                    </TableCell>
                    <TableCell>
                      {emEdicao ? (
                        <Input
                          value={setorEdicaoNome}
                          onChange={(e) => setSetorEdicaoNome(e.target.value)}
                          maxLength={80}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-ink-900">{s.nome}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-600">
                      {uso > 0 ? `${uso} bairro${uso > 1 ? "s" : ""}` : "—"}
                    </TableCell>
                    <TableCell>
                      {s.ativo ? (
                        <Badge variant="green">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {emEdicao ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => salvarEdicaoSetor(s.id)}
                              disabled={pending}
                              aria-label="Salvar"
                            >
                              <Check className="h-4 w-4 text-status-green" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setSetorEditandoId(null)}
                              aria-label="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => iniciarEdicaoSetor(s)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSetor(s)}
                              disabled={pending}
                              aria-label={s.ativo ? "Desativar" : "Ativar"}
                            >
                              {s.ativo ? (
                                <ToggleRight className="h-4 w-4 text-status-green" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-ink-400" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => excluirSetorHandler(s)}
                              disabled={pending || uso > 0}
                              title={
                                uso > 0
                                  ? "Realoque os bairros antes de excluir"
                                  : "Excluir"
                              }
                              aria-label="Excluir"
                            >
                              <Trash2
                                className={
                                  uso > 0
                                    ? "h-4 w-4 text-ink-300"
                                    : "h-4 w-4 text-status-red"
                                }
                              />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {/* ============================== BAIRROS ============================== */}
      <section className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-2xs font-semibold uppercase tracking-wide text-ink-500">
            Bairros · {municipioFiltro}
          </h3>
          <span className="text-2xs text-ink-500">
            {bairrosDoMunicipio.length} de{" "}
            {bairros.filter((b) => b.municipio === municipioFiltro).length}{" "}
            cadastrado(s)
          </span>
        </header>

        <form
          onSubmit={criarBairroHandler}
          className="rounded-md border border-ink-200 bg-ink-50/30 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Plus className="h-4 w-4" /> Novo bairro
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="novo-bairro-nome">Nome *</Label>
              <Input
                id="novo-bairro-nome"
                value={novoBairroNome}
                onChange={(e) => setNovoBairroNome(e.target.value)}
                placeholder="ex.: Jardim Aurora"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="novo-bairro-setor">Setor</Label>
              <Select
                value={novoBairroSetor}
                onValueChange={(v) => setNovoBairroSetor(v)}
              >
                <SelectTrigger id="novo-bairro-setor">
                  <SelectValue placeholder="Sem setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
                  {setoresDoMunicipio
                    .filter((s) => s.ativo)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        Setor {s.numero} — {s.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={pending} className="w-full md:w-auto">
                {pending ? "Salvando…" : "Adicionar"}
              </Button>
            </div>
          </div>
        </form>

        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={buscaBairro}
            onChange={(e) => setBuscaBairro(e.target.value)}
            placeholder="Buscar bairro…"
            className="pl-8"
          />
        </div>

        {bairrosDoMunicipio.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-500">
            {buscaBairro
              ? `Nenhum bairro encontrado para “${buscaBairro}”.`
              : `Nenhum bairro cadastrado em ${municipioFiltro}.`}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[260px]">Setor</TableHead>
                <TableHead>Em uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bairrosDoMunicipio.map((b) => {
                const emEdicao = bairroEditandoId === b.id;
                const uso = usoPorBairro[b.id] ?? 0;
                return (
                  <TableRow key={b.id} className={!b.ativo ? "opacity-60" : ""}>
                    <TableCell>
                      {emEdicao ? (
                        <Input
                          value={bairroEdicaoNome}
                          onChange={(e) => setBairroEdicaoNome(e.target.value)}
                          maxLength={120}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-ink-900">{b.nome}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={b.setor_id ?? SEM_SETOR}
                        onValueChange={(v) => mudarSetorDoBairro(b, v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Sem setor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SEM_SETOR}>Sem setor</SelectItem>
                          {setoresDoMunicipio
                            .filter((s) => s.ativo || s.id === b.setor_id)
                            .map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                Setor {s.numero} — {s.nome}
                                {!s.ativo ? " (inativo)" : ""}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-mono-tab text-xs text-ink-600">
                      {uso > 0 ? `${uso} registro${uso > 1 ? "s" : ""}` : "—"}
                    </TableCell>
                    <TableCell>
                      {b.ativo ? (
                        <Badge variant="green">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {emEdicao ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => salvarEdicaoBairro(b)}
                              disabled={pending}
                              aria-label="Salvar"
                            >
                              <Check className="h-4 w-4 text-status-green" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setBairroEditandoId(null)}
                              aria-label="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => iniciarEdicaoBairro(b)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleBairro(b)}
                              disabled={pending}
                              aria-label={b.ativo ? "Desativar" : "Ativar"}
                            >
                              {b.ativo ? (
                                <ToggleRight className="h-4 w-4 text-status-green" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-ink-400" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => excluirBairroHandler(b)}
                              disabled={pending || uso > 0}
                              title={
                                uso > 0
                                  ? "Desative em vez de excluir (em uso)"
                                  : "Excluir"
                              }
                              aria-label="Excluir"
                            >
                              <Trash2
                                className={
                                  uso > 0
                                    ? "h-4 w-4 text-ink-300"
                                    : "h-4 w-4 text-status-red"
                                }
                              />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
