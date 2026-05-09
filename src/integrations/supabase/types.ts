export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cidade: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome_empresa: string
          nome_responsavel: string | null
          observacoes: string | null
          qtd_computadores: number | null
          telefone: string | null
          tipo_negocio: string | null
          user_id: string
        }
        Insert: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome_empresa: string
          nome_responsavel?: string | null
          observacoes?: string | null
          qtd_computadores?: number | null
          telefone?: string | null
          tipo_negocio?: string | null
          user_id: string
        }
        Update: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome_empresa?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          qtd_computadores?: number | null
          telefone?: string | null
          tipo_negocio?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_admin: {
        Row: {
          clausula_garantia: string | null
          clausula_lgpd: string | null
          clausula_suporte: string | null
          condicoes_pagamento: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          clausula_garantia?: string | null
          clausula_lgpd?: string | null
          clausula_suporte?: string | null
          condicoes_pagamento?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          clausula_garantia?: string | null
          clausula_lgpd?: string | null
          clausula_suporte?: string | null
          condicoes_pagamento?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      dados_empresa: {
        Row: {
          cidade: string | null
          cnpj_ou_mei: string | null
          cor_marca: string | null
          created_at: string | null
          email_contato: string | null
          endereco: string | null
          estado: string | null
          id: string
          logo_url: string | null
          nome_empresa: string
          nome_responsavel: string
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cidade?: string | null
          cnpj_ou_mei?: string | null
          cor_marca?: string | null
          created_at?: string | null
          email_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa: string
          nome_responsavel: string
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cidade?: string | null
          cnpj_ou_mei?: string | null
          cor_marca?: string | null
          created_at?: string | null
          email_contato?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logo_url?: string | null
          nome_empresa?: string
          nome_responsavel?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_empresa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string | null
          role: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id: string
          nome?: string | null
          role?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          role?: string
        }
        Relationships: []
      }
      proposta_itens: {
        Row: {
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          proposta_id: string
          quantidade: number | null
          servico_catalogo_id: string | null
          unidade: string | null
          valor_total_item: number | null
          valor_unitario: number
        }
        Insert: {
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          proposta_id: string
          quantidade?: number | null
          servico_catalogo_id?: string | null
          unidade?: string | null
          valor_total_item?: number | null
          valor_unitario?: number
        }
        Update: {
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          proposta_id?: string
          quantidade?: number | null
          servico_catalogo_id?: string | null
          unidade?: string | null
          valor_total_item?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposta_itens_proposta_id_fkey"
            columns: ["proposta_id"]
            isOneToOne: false
            referencedRelation: "propostas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposta_itens_servico_catalogo_id_fkey"
            columns: ["servico_catalogo_id"]
            isOneToOne: false
            referencedRelation: "servicos_catalogo"
            referencedColumns: ["id"]
          },
        ]
      }
      propostas: {
        Row: {
          aceita_em: string | null
          aceita_nome: string | null
          clausula_garantia: string | null
          clausula_lgpd: string | null
          clausula_suporte: string | null
          cliente_id: string
          condicoes_pagamento: string | null
          created_at: string | null
          data_emissao: string | null
          id: string
          link_publico_token: string
          motivo_recusa: string | null
          numero: number
          observacoes: string | null
          prazo_execucao: string | null
          recusada_em: string | null
          status: string
          titulo: string
          updated_at: string | null
          user_id: string
          validade_dias: number | null
          valor_total: number | null
          visualizada_em: string | null
        }
        Insert: {
          aceita_em?: string | null
          aceita_nome?: string | null
          clausula_garantia?: string | null
          clausula_lgpd?: string | null
          clausula_suporte?: string | null
          cliente_id: string
          condicoes_pagamento?: string | null
          created_at?: string | null
          data_emissao?: string | null
          id?: string
          link_publico_token?: string
          motivo_recusa?: string | null
          numero: number
          observacoes?: string | null
          prazo_execucao?: string | null
          recusada_em?: string | null
          status?: string
          titulo: string
          updated_at?: string | null
          user_id: string
          validade_dias?: number | null
          valor_total?: number | null
          visualizada_em?: string | null
        }
        Update: {
          aceita_em?: string | null
          aceita_nome?: string | null
          clausula_garantia?: string | null
          clausula_lgpd?: string | null
          clausula_suporte?: string | null
          cliente_id?: string
          condicoes_pagamento?: string | null
          created_at?: string | null
          data_emissao?: string | null
          id?: string
          link_publico_token?: string
          motivo_recusa?: string | null
          numero?: number
          observacoes?: string | null
          prazo_execucao?: string | null
          recusada_em?: string | null
          status?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
          validade_dias?: number | null
          valor_total?: number | null
          visualizada_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "propostas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "propostas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos_catalogo: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao_padrao: string | null
          id: string
          inclui_lgpd: boolean | null
          nome: string
          unidade: string | null
          valor_sugerido: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao_padrao?: string | null
          id?: string
          inclui_lgpd?: boolean | null
          nome: string
          unidade?: string | null
          valor_sugerido?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao_padrao?: string | null
          id?: string
          inclui_lgpd?: boolean | null
          nome?: string
          unidade?: string | null
          valor_sugerido?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_proposta: {
        Args: { _nome: string; _token: string }
        Returns: undefined
      }
      get_proposta_publica: { Args: { _token: string }; Returns: Json }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      proximo_numero_proposta: { Args: never; Returns: number }
      recusar_proposta: {
        Args: { _motivo: string; _token: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
