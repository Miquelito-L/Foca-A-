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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic: {
        Row: {
          created_at: string
          doc_name: string
          file_url: string | null
          id: string
          summary: string | null
          tags: Database["public"]["Enums"]["academic_tag"]
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_name: string
          file_url?: string | null
          id?: string
          summary?: string | null
          tags?: Database["public"]["Enums"]["academic_tag"]
          user_id: string
        }
        Update: {
          created_at?: string
          doc_name?: string
          file_url?: string | null
          id?: string
          summary?: string | null
          tags?: Database["public"]["Enums"]["academic_tag"]
          user_id?: string
        }
        Relationships: []
      }
      access_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      agendamento: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          google_event_id: string | null
          id: string
          lembrete_1h_enviado: boolean | null
          start_time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          lembrete_1h_enviado?: boolean | null
          start_time: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          lembrete_1h_enviado?: boolean | null
          start_time?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["finance_category"]
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          type: Database["public"]["Enums"]["finance_type"]
          user_id: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type: Database["public"]["Enums"]["finance_type"]
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["finance_category"]
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: Database["public"]["Enums"]["finance_type"]
          user_id?: string
        }
        Relationships: []
      }
      health: {
        Row: {
          calendario: string
          category: Database["public"]["Enums"]["health_category"]
          created_at: string
          id: string
          item: string | null
          user_id: string
          value: number
        }
        Insert: {
          calendario?: string
          category: Database["public"]["Enums"]["health_category"]
          created_at?: string
          id?: string
          item?: string | null
          user_id: string
          value: number
        }
        Update: {
          calendario?: string
          category?: Database["public"]["Enums"]["health_category"]
          created_at?: string
          id?: string
          item?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      academic_tag: "prova" | "trabalho" | "leitura" | "estudo"
      finance_category:
        | "Lazer"
        | "Alimentação"
        | "Despesa fixa"
        | "Despesa variável"
        | "Transporte"
        | "Saúde"
        | "Educação"
        | "Investimento"
        | "Outros"
      finance_type: "income" | "expense"
      health_category: "Agua" | "Treino" | "Sono" | "Peso"
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
    Enums: {
      academic_tag: ["prova", "trabalho", "leitura", "estudo"],
      finance_category: [
        "Lazer",
        "Alimentação",
        "Despesa fixa",
        "Despesa variável",
        "Transporte",
        "Saúde",
        "Educação",
        "Investimento",
        "Outros",
      ],
      finance_type: ["income", "expense"],
      health_category: ["Agua", "Treino", "Sono", "Peso"],
    },
  },
} as const
