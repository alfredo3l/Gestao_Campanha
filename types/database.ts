/**
 * Tipos gerados a partir do schema do Supabase (projeto Acto · qvjpnucpwdrtxfjqicsu).
 *
 * - O schema `public` foi gerado automaticamente via MCP `generate_typescript_types`
 *   (em 24/05/2026). Pertence ao app Acto — mantemos para integridade do tipo, mas
 *   o módulo Campanha não consulta essas tabelas.
 *
 * - O schema `campanha` foi escrito manualmente refletindo as migrations
 *   0001–0009. Para regenerar automaticamente, primeiro habilite "campanha"
 *   em Supabase Dashboard → Project Settings → API → Exposed schemas, depois
 *   rode novamente `generate_typescript_types` via MCP e cole o resultado aqui.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.1" };

  // ==========================================================================
  // Schema "campanha" (módulo Gestão de Campanha)
  // ==========================================================================
  campanha: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          role: Database["campanha"]["Enums"]["role_usuario"];
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          role?: Database["campanha"]["Enums"]["role_usuario"];
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          role?: Database["campanha"]["Enums"]["role_usuario"];
          ativo?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      liderancas: {
        Row: {
          id: string;
          nome: string;
          cargo: Database["campanha"]["Enums"]["cargo_lider"];
          municipio: string;
          bairro: string | null;
          tel: string | null;
          email: string | null;
          meta_votos: number;
          ativa: boolean;
          profile_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cargo: Database["campanha"]["Enums"]["cargo_lider"];
          municipio: string;
          bairro?: string | null;
          tel?: string | null;
          email?: string | null;
          meta_votos?: number;
          ativa?: boolean;
          profile_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["campanha"]["Tables"]["liderancas"]["Insert"]>;
        Relationships: [];
      };
      apoiadores: {
        Row: {
          id: string;
          nome: string;
          cpf: string;
          titulo_eleitor: string | null;
          zona: string | null;
          secao: string | null;
          tel: string | null;
          email: string | null;
          nascimento: string | null;
          endereco: string | null;
          bairro: string | null;
          municipio: string;
          cep: string | null;
          lider_id: string;
          status: Database["campanha"]["Enums"]["status_apoio"];
          indicado_por: string | null;
          observacoes: string | null;
          data_consentimento: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cpf: string;
          titulo_eleitor?: string | null;
          zona?: string | null;
          secao?: string | null;
          tel?: string | null;
          email?: string | null;
          nascimento?: string | null;
          endereco?: string | null;
          bairro?: string | null;
          municipio: string;
          cep?: string | null;
          lider_id: string;
          status?: Database["campanha"]["Enums"]["status_apoio"];
          indicado_por?: string | null;
          observacoes?: string | null;
          data_consentimento?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["campanha"]["Tables"]["apoiadores"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "apoiadores_lider_id_fkey";
            columns: ["lider_id"];
            referencedRelation: "liderancas";
            referencedColumns: ["id"];
          }
        ];
      };
      apoiador_tags: {
        Row: { apoiador_id: string; tag: string };
        Insert: { apoiador_id: string; tag: string };
        Update: { apoiador_id?: string; tag?: string };
        Relationships: [
          {
            foreignKeyName: "apoiador_tags_apoiador_id_fkey";
            columns: ["apoiador_id"];
            referencedRelation: "apoiadores";
            referencedColumns: ["id"];
          }
        ];
      };
      metas_regiao: {
        Row: {
          id: string;
          regiao: string;
          municipios: string[];
          eleitores: number;
          meta_votos: number;
          prazo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          regiao: string;
          municipios?: string[];
          eleitores?: number;
          meta_votos?: number;
          prazo?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["campanha"]["Tables"]["metas_regiao"]["Insert"]>;
        Relationships: [];
      };
      demandas: {
        Row: {
          id: string;
          codigo: string | null;
          titulo: string;
          descricao: string | null;
          categoria: string;
          prioridade: Database["campanha"]["Enums"]["prioridade"];
          status: Database["campanha"]["Enums"]["status_demanda"];
          solicitante_id: string | null;
          lider_id: string;
          prazo: string | null;
          resolvida_em: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          codigo?: string | null;
          titulo: string;
          descricao?: string | null;
          categoria: string;
          prioridade?: Database["campanha"]["Enums"]["prioridade"];
          status?: Database["campanha"]["Enums"]["status_demanda"];
          solicitante_id?: string | null;
          lider_id: string;
          prazo?: string | null;
          resolvida_em?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["campanha"]["Tables"]["demandas"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "demandas_lider_id_fkey";
            columns: ["lider_id"];
            referencedRelation: "liderancas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "demandas_solicitante_id_fkey";
            columns: ["solicitante_id"];
            referencedRelation: "apoiadores";
            referencedColumns: ["id"];
          }
        ];
      };
      demanda_movimentacoes: {
        Row: {
          id: string;
          demanda_id: string;
          autor_id: string | null;
          tipo: "comentario" | "status_change" | "anexo";
          texto: string | null;
          metadata: Json;
          criada_em: string;
        };
        Insert: {
          id?: string;
          demanda_id: string;
          autor_id?: string | null;
          tipo: "comentario" | "status_change" | "anexo";
          texto?: string | null;
          metadata?: Json;
          criada_em?: string;
        };
        Update: Partial<Database["campanha"]["Tables"]["demanda_movimentacoes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "demanda_movimentacoes_demanda_id_fkey";
            columns: ["demanda_id"];
            referencedRelation: "demandas";
            referencedColumns: ["id"];
          }
        ];
      };
      demanda_anexos: {
        Row: {
          id: string;
          demanda_id: string;
          storage_path: string;
          nome: string;
          mime: string | null;
          tamanho: number | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          demanda_id: string;
          storage_path: string;
          nome: string;
          mime?: string | null;
          tamanho?: number | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["campanha"]["Tables"]["demanda_anexos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "demanda_anexos_demanda_id_fkey";
            columns: ["demanda_id"];
            referencedRelation: "demandas";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      v_progresso_lideranca: {
        Row: {
          id: string;
          nome: string;
          cargo: Database["campanha"]["Enums"]["cargo_lider"];
          municipio: string;
          bairro: string | null;
          meta_votos: number;
          ativa: boolean;
          profile_id: string | null;
          apoiadores_total: number;
          apoiadores_confirmados: number;
          votos_projetados: number;
          pct_meta: number | null;
        };
        Relationships: [];
      };
      v_progresso_regiao: {
        Row: {
          id: string;
          regiao: string;
          municipios: string[];
          eleitores: number;
          meta_votos: number;
          prazo: string | null;
          liderancas_ativas: number;
          apoiadores_total: number;
          votos_projetados: number;
          pct_meta: number | null;
        };
        Relationships: [];
      };
      v_dashboard_kpis: {
        Row: {
          apoiadores_total: number;
          apoiadores_semana: number;
          liderancas_ativas: number;
          meta_total: number;
          votos_projetados: number;
          demandas_abertas: number;
          demandas_vencendo: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_role: { Args: never; Returns: Database["campanha"]["Enums"]["role_usuario"] | null };
      is_admin: { Args: never; Returns: boolean };
      has_role: { Args: { roles: Database["campanha"]["Enums"]["role_usuario"][] }; Returns: boolean };
      pode_ler: { Args: never; Returns: boolean };
      pode_escrever: { Args: never; Returns: boolean };
      pode_deletar: { Args: never; Returns: boolean };
      lideranca_eh_minha: { Args: { p_lider_id: string }; Returns: boolean };
    };
    Enums: {
      role_usuario: "admin" | "coordenador" | "operador" | "visualizador";
      status_apoio: "confirmado" | "provavel" | "indeciso" | "contato" | "nao_vota";
      cargo_lider:
        | "coord_regional"
        | "coord_zona"
        | "lider_bairro"
        | "lider_comunitario"
        | "lider_rural";
      status_demanda: "aberta" | "andamento" | "resolvida" | "cancelada";
      prioridade: "baixa" | "media" | "alta" | "urgente";
    };
    CompositeTypes: Record<string, never>;
  };

  // ==========================================================================
  // Schema "public" (app Acto — não tocamos, mas mantemos por integridade)
  // ==========================================================================
  public: {
    Tables: {
      parceiros: {
        Row: {
          assinatura_digital: string | null;
          cpf: string;
          created_at: string;
          data_aceite: string | null;
          data_envio: string | null;
          data_recusa: string | null;
          enviado_piiq: boolean;
          id: string;
          id_contato_salesforce: string | null;
          id_salesforce: string | null;
          nome_razao_social: string;
          recusado: boolean | null;
          telefone: string;
          termo_aceito: boolean;
          termo_aceito_foco: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["parceiros"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["parceiros"]["Row"]>;
        Relationships: [];
      };
      perfis_usuarios: {
        Row: {
          ativo: boolean;
          created_at: string;
          created_by: string | null;
          email: string;
          foto_url: string | null;
          id: string;
          motivo_desativacao: string | null;
          nome_completo: string;
          role: Database["public"]["Enums"]["user_role"];
          ultimo_acesso: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["perfis_usuarios"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["perfis_usuarios"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      admin_criar_usuario: {
        Args: {
          p_email: string;
          p_nome_completo: string;
          p_role?: Database["public"]["Enums"]["user_role"];
          p_senha: string;
        };
        Returns: string;
      };
      atualizar_foto_url: { Args: { nova_url: string }; Returns: undefined };
      is_admin: { Args: never; Returns: boolean };
      pode_editar_parceiros: { Args: never; Returns: boolean };
      registrar_ultimo_acesso: { Args: never; Returns: undefined };
    };
    Enums: {
      user_role: "admin" | "operador" | "visualizador";
    };
    CompositeTypes: Record<string, never>;
  };
};
