/**
 * Helpers para fotos / avatares dos cadastros do módulo Campanha.
 *
 * Convenção de bucket: `campanha-fotos` (público — ver migration 0010).
 * Convenção de caminho: `<scope>/<id>/<timestamp>-<nome>.ext`
 *   onde scope ∈ { 'apoiadores', 'liderancas', 'profiles' }.
 *
 * Como o bucket é público, montamos a URL pública diretamente a partir do
 * NEXT_PUBLIC_SUPABASE_URL — não precisamos chamar `supabase.storage.getPublicUrl`
 * em cada render (zero round-trip).
 */

export const FOTOS_BUCKET = "campanha-fotos";

/** Tipos MIME aceitos no upload de fotos. Em sincronia com a migration 0010. */
export const FOTO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

/** Limite de tamanho (em bytes) — mantenha em sincronia com o bucket no Storage. */
export const FOTO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Resolve a URL pública de uma `foto_path` salva no banco.
 * Retorna `null` se a foto não existe (placeholder de iniciais deve ser usado).
 */
export function getFotoUrl(fotoPath: string | null | undefined): string | null {
  if (!fotoPath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${FOTOS_BUCKET}/${encodePath(fotoPath)}`;
}

/** Codifica somente o `nome do arquivo` (preserva o `/` da estrutura de pastas). */
function encodePath(path: string): string {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

/**
 * Sanitiza o nome de arquivo para uso seguro no Storage.
 *  - normaliza acentos
 *  - remove caracteres ambíguos
 *  - força minúsculas
 *  - limita a 80 chars (sem contar extensão)
 */
export function sanitizeNomeArquivo(nome: string): string {
  const ponto = nome.lastIndexOf(".");
  const base = (ponto > 0 ? nome.slice(0, ponto) : nome) || "foto";
  const ext = ponto > 0 ? nome.slice(ponto + 1).toLowerCase() : "";
  const limpo = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 80) || "foto";
  return ext ? `${limpo}.${ext}` : limpo;
}

/** Monta caminho dentro do bucket para um upload. */
export function montarFotoPath(
  scope: "apoiadores" | "liderancas" | "profiles",
  ownerId: string,
  nomeOriginal: string
): string {
  const safe = sanitizeNomeArquivo(nomeOriginal);
  return `${scope}/${ownerId}/${Date.now()}-${safe}`;
}
