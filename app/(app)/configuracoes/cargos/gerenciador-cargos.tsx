"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2, X, Check } from "lucide-react";

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
  alternarAtivoCargoLider,
  atualizarCargoLider,
  criarCargoLider,
  excluirCargoLider,
} from "./actions";

interface CargoRow {
  id: string;
  value: string;
  label: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  cargos: CargoRow[];
  usoPorCargo: Record<string, number>;
}

export function GerenciadorCargos({ cargos, usoPorCargo }: Props) {
  const [pending, startTransition] = useTransition();
  const [novoLabel, setNovoLabel] = useState("");
  const [novoValue, setNovoValue] = useState("");
  const [novoOrdem, setNovoOrdem] = useState<number>(
    cargos.length === 0 ? 10 : Math.max(...cargos.map((c) => c.ordem)) + 10
  );
  const [showAvancado, setShowAvancado] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicaoLabel, setEdicaoLabel] = useState("");
  const [edicaoOrdem, setEdicaoOrdem] = useState<number>(0);

  function resetNovo() {
    setNovoLabel("");
    setNovoValue("");
    setShowAvancado(false);
    setNovoOrdem(
      cargos.length === 0 ? 10 : Math.max(...cargos.map((c) => c.ordem)) + 10
    );
  }

  function handleCriar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!novoLabel.trim()) {
      toast.error("Informe o nome do cargo.");
      return;
    }
    const fd = new FormData();
    fd.set("label", novoLabel);
    fd.set("value", novoValue);
    fd.set("ordem", String(novoOrdem));

    startTransition(async () => {
      const res = await criarCargoLider({}, fd);
      if (res.error) {
        toast.error("Não foi possível criar o cargo", { description: res.error });
        return;
      }
      toast.success("Cargo criado");
      resetNovo();
    });
  }

  function iniciarEdicao(c: CargoRow) {
    setEditandoId(c.id);
    setEdicaoLabel(c.label);
    setEdicaoOrdem(c.ordem);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setEdicaoLabel("");
    setEdicaoOrdem(0);
  }

  function salvarEdicao(id: string) {
    if (!edicaoLabel.trim()) {
      toast.error("O nome não pode ficar vazio.");
      return;
    }
    const fd = new FormData();
    fd.set("label", edicaoLabel);
    fd.set("ordem", String(edicaoOrdem));

    startTransition(async () => {
      const res = await atualizarCargoLider(id, {}, fd);
      if (res.error) {
        toast.error("Falha ao salvar", { description: res.error });
        return;
      }
      toast.success("Cargo atualizado");
      cancelarEdicao();
    });
  }

  function alternarAtivo(c: CargoRow) {
    startTransition(async () => {
      const res = await alternarAtivoCargoLider(c.id, !c.ativo);
      if (res.error) {
        toast.error("Falha ao alterar status", { description: res.error });
        return;
      }
      toast.success(c.ativo ? "Cargo desativado" : "Cargo ativado");
    });
  }

  function excluir(c: CargoRow) {
    const uso = usoPorCargo[c.value] ?? 0;
    if (uso > 0) {
      toast.error(
        `Este cargo está em uso por ${uso} liderança(s). Desative em vez de excluir.`
      );
      return;
    }
    const confirma = window.confirm(`Excluir definitivamente o cargo "${c.label}"?`);
    if (!confirma) return;

    startTransition(async () => {
      const res = await excluirCargoLider(c.id);
      if (res.error) {
        toast.error("Falha ao excluir", { description: res.error });
        return;
      }
      toast.success("Cargo excluído");
    });
  }

  return (
    <div className="space-y-6">
      {/* Formulário de criação */}
      <form
        onSubmit={handleCriar}
        className="rounded-md border border-ink-200 bg-ink-50/30 p-4"
      >
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Plus className="h-4 w-4" /> Novo cargo
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="novo-label">Nome exibido *</Label>
            <Input
              id="novo-label"
              value={novoLabel}
              onChange={(e) => setNovoLabel(e.target.value)}
              placeholder="ex.: Líder de Juventude"
              maxLength={80}
            />
            <p className="text-2xs text-ink-500">
              {showAvancado ? null : (
                <button
                  type="button"
                  onClick={() => setShowAvancado(true)}
                  className="text-brand-700 hover:underline"
                >
                  Definir identificador técnico manualmente
                </button>
              )}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="novo-ordem">Ordem</Label>
            <Input
              id="novo-ordem"
              type="number"
              min={0}
              step={10}
              value={novoOrdem}
              onChange={(e) => setNovoOrdem(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={pending} className="w-full md:w-auto">
              {pending ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </div>

        {showAvancado && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="novo-value">Identificador técnico (slug)</Label>
              <Input
                id="novo-value"
                value={novoValue}
                onChange={(e) =>
                  setNovoValue(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, "")
                      .slice(0, 50)
                  )
                }
                placeholder="auto a partir do nome"
                maxLength={50}
              />
              <p className="text-2xs text-ink-500">
                Apenas letras minúsculas, números e <code>_</code>. Imutável após criação.
              </p>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAvancado(false);
                  setNovoValue("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Tabela */}
      {cargos.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-500">
          Nenhum cargo cadastrado. Crie o primeiro usando o formulário acima.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ordem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Identificador</TableHead>
              <TableHead>Em uso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.map((c) => {
              const uso = usoPorCargo[c.value] ?? 0;
              const emEdicao = editandoId === c.id;
              return (
                <TableRow key={c.id} className={!c.ativo ? "opacity-60" : ""}>
                  <TableCell className="font-mono-tab text-xs text-ink-700">
                    {emEdicao ? (
                      <Input
                        type="number"
                        min={0}
                        step={10}
                        value={edicaoOrdem}
                        onChange={(e) => setEdicaoOrdem(Number(e.target.value))}
                        className="h-7 w-16 text-xs"
                      />
                    ) : (
                      c.ordem
                    )}
                  </TableCell>
                  <TableCell>
                    {emEdicao ? (
                      <Input
                        value={edicaoLabel}
                        onChange={(e) => setEdicaoLabel(e.target.value)}
                        maxLength={80}
                        className="h-7 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-ink-900">{c.label}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 text-2xs text-ink-700">
                      {c.value}
                    </code>
                  </TableCell>
                  <TableCell className="font-mono-tab text-xs text-ink-600">
                    {uso > 0 ? `${uso} liderança${uso > 1 ? "s" : ""}` : "—"}
                  </TableCell>
                  <TableCell>
                    {c.ativo ? (
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
                            onClick={() => salvarEdicao(c.id)}
                            disabled={pending}
                            aria-label="Salvar"
                          >
                            <Check className="h-4 w-4 text-status-green" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={cancelarEdicao}
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
                            onClick={() => iniciarEdicao(c)}
                            aria-label="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => alternarAtivo(c)}
                            disabled={pending}
                            aria-label={c.ativo ? "Desativar" : "Ativar"}
                          >
                            {c.ativo ? (
                              <ToggleRight className="h-4 w-4 text-status-green" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-ink-400" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => excluir(c)}
                            disabled={pending || uso > 0}
                            title={uso > 0 ? "Desative em vez de excluir (em uso)" : "Excluir"}
                            aria-label="Excluir"
                          >
                            <Trash2
                              className={
                                uso > 0 ? "h-4 w-4 text-ink-300" : "h-4 w-4 text-status-red"
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
    </div>
  );
}
