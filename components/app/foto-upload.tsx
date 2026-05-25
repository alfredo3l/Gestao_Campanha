"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  FOTOS_BUCKET,
  FOTO_MAX_BYTES,
  FOTO_MIME_TYPES,
  getFotoUrl,
  montarFotoPath,
} from "@/lib/utils/avatar";
import { iniciais } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface Props {
  /** Nome do cadastro — usado no fallback de iniciais e no `alt`. */
  nome: string;
  /** Onde a foto será armazenada dentro do bucket. */
  scope: "apoiadores" | "liderancas" | "profiles";
  /** ID do dono (apoiador, liderança ou user). Use "novo" para cadastros inéditos. */
  ownerId: string;
  /** Caminho atual da foto (campo `foto_path` no banco). */
  value: string | null;
  /** Callback disparado após upload bem-sucedido ou remoção (recebe o novo path). */
  onChange: (path: string | null) => void;
  /** Tamanho do avatar — afeta apenas o preview. */
  size?: "md" | "lg";
  className?: string;
}

/**
 * Componente único de upload e remoção de foto de perfil/cadastro.
 *
 * - Preview circular com fallback automático para iniciais.
 * - Upload direto ao Supabase Storage (bucket `campanha-fotos`).
 * - Valida tipo MIME e tamanho antes de enviar (espelha o limite do bucket).
 * - Ao trocar uma foto existente, faz o upload do novo arquivo primeiro e só
 *   depois remove o antigo — assim o cadastro nunca fica sem imagem em caso
 *   de erro.
 */
export function FotoUpload({
  nome,
  scope,
  ownerId,
  value,
  onChange,
  size = "lg",
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(getFotoUrl(value));
  const [uploading, startUpload] = useTransition();

  const px = size === "lg" ? "h-24 w-24" : "h-16 w-16";

  function pick() {
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo depois
    if (!file) return;

    if (!FOTO_MIME_TYPES.includes(file.type as (typeof FOTO_MIME_TYPES)[number])) {
      toast.error("Formato não suportado", {
        description: "Envie uma imagem PNG, JPG, WEBP ou GIF.",
      });
      return;
    }
    if (file.size > FOTO_MAX_BYTES) {
      toast.error("Imagem muito grande", {
        description: "O limite é 2 MB. Reduza a imagem e tente novamente.",
      });
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    startUpload(async () => {
      const supabase = createClient();
      const path = montarFotoPath(scope, ownerId, file.name);
      const { error } = await supabase.storage
        .from(FOTOS_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });

      if (error) {
        setPreview(getFotoUrl(value));
        toast.error("Não foi possível enviar a foto", { description: error.message });
        return;
      }

      // Sucesso: substitui valor lógico e remove a foto antiga (se houver).
      if (value && value !== path) {
        await supabase.storage.from(FOTOS_BUCKET).remove([value]).catch(() => undefined);
      }
      setPreview(getFotoUrl(path));
      onChange(path);
      toast.success("Foto atualizada");
    });
  }

  async function handleRemove() {
    if (!value) return;
    startUpload(async () => {
      const supabase = createClient();
      const { error } = await supabase.storage.from(FOTOS_BUCKET).remove([value]);
      if (error) {
        toast.error("Não foi possível remover a foto", { description: error.message });
        return;
      }
      setPreview(null);
      onChange(null);
      toast.success("Foto removida");
    });
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-brand-100 ring-2 ring-white shadow-sm",
          px
        )}
      >
        {preview ? (
          <Image src={preview} alt={nome || "Foto"} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-base font-semibold text-brand-800">
            {iniciais(nome || "?")}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept={FOTO_MIME_TYPES.join(",")}
          className="hidden"
          onChange={handleFile}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={pick} disabled={uploading}>
            <Camera className="h-4 w-4" />
            {value ? "Trocar foto" : "Enviar foto"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="text-status-red hover:text-status-red"
            >
              <Trash2 className="h-4 w-4" /> Remover
            </Button>
          )}
        </div>
        <p className="text-2xs text-ink-500">PNG, JPG, WEBP ou GIF · até 2 MB.</p>
      </div>
    </div>
  );
}
