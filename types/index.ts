export type { Database, Json } from "./database";

/** Roles do módulo Campanha (espelha enum campanha.role_usuario). */
export type RoleUsuario = "admin" | "coordenador" | "operador" | "visualizador";

/** Helpers de UI que ainda não derivam do schema gerado. */
export interface NavItem {
  id: string;
  href: string;
  label: string;
  /** Roles que enxergam o item. `null` = todos os autenticados. */
  roles?: RoleUsuario[] | null;
}
