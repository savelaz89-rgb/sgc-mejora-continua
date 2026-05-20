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
      action_plans: {
        Row: {
          action_id: string
          completion_date: string | null
          created_at: string
          due_date: string | null
          evidence_url: string | null
          id: string
          responsible: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_description: string
        }
        Insert: {
          action_id: string
          completion_date?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_description: string
        }
        Update: {
          action_id?: string
          completion_date?: string | null
          created_at?: string
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          area: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string
          detected_by: string | null
          detection_date: string
          due_date: string | null
          expected_benefit: string | null
          id: string
          parent_action_id: string | null
          priority: Database["public"]["Enums"]["action_priority"]
          process: string | null
          source: Database["public"]["Enums"]["action_source"]
          status: Database["public"]["Enums"]["action_status"]
          title: string
          type: Database["public"]["Enums"]["action_type"]
          updated_at: string
        }
        Insert: {
          area?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description: string
          detected_by?: string | null
          detection_date?: string
          due_date?: string | null
          expected_benefit?: string | null
          id?: string
          parent_action_id?: string | null
          priority?: Database["public"]["Enums"]["action_priority"]
          process?: string | null
          source: Database["public"]["Enums"]["action_source"]
          status?: Database["public"]["Enums"]["action_status"]
          title: string
          type: Database["public"]["Enums"]["action_type"]
          updated_at?: string
        }
        Update: {
          area?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string
          detected_by?: string | null
          detection_date?: string
          due_date?: string | null
          expected_benefit?: string | null
          id?: string
          parent_action_id?: string | null
          priority?: Database["public"]["Enums"]["action_priority"]
          process?: string | null
          source?: Database["public"]["Enums"]["action_source"]
          status?: Database["public"]["Enums"]["action_status"]
          title?: string
          type?: Database["public"]["Enums"]["action_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_parent_action_id_fkey"
            columns: ["parent_action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action_id: string
          activity: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          action_id: string
          activity: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action_id?: string
          activity?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      code_counters: {
        Row: {
          counter: number
          type: Database["public"]["Enums"]["action_type"]
          year: number
        }
        Insert: {
          counter?: number
          type: Database["public"]["Enums"]["action_type"]
          year: number
        }
        Update: {
          counter?: number
          type?: Database["public"]["Enums"]["action_type"]
          year?: number
        }
        Relationships: []
      }
      effectiveness_verification: {
        Row: {
          action_id: string
          close_date: string | null
          comments: string | null
          created_at: string
          id: string
          recurrence: boolean
          result: Database["public"]["Enums"]["verification_result"] | null
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          action_id: string
          close_date?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          recurrence?: boolean
          result?: Database["public"]["Enums"]["verification_result"] | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          action_id?: string
          close_date?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          recurrence?: boolean
          result?: Database["public"]["Enums"]["verification_result"] | null
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "effectiveness_verification_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: true
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          area?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      risk_matrix: {
        Row: {
          action_id: string
          created_at: string
          id: string
          impact: number
          probability: number
          risk_level: number | null
        }
        Insert: {
          action_id: string
          created_at?: string
          id?: string
          impact: number
          probability: number
          risk_level?: number | null
        }
        Update: {
          action_id?: string
          created_at?: string
          id?: string
          impact?: number
          probability?: number
          risk_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_matrix_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: true
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      root_cause_analysis: {
        Row: {
          action_id: string
          created_at: string
          eight_d: Json | null
          fishbone_categories: Json | null
          id: string
          method: Database["public"]["Enums"]["rca_method"]
          root_cause: string | null
          why1: string | null
          why2: string | null
          why3: string | null
          why4: string | null
          why5: string | null
        }
        Insert: {
          action_id: string
          created_at?: string
          eight_d?: Json | null
          fishbone_categories?: Json | null
          id?: string
          method?: Database["public"]["Enums"]["rca_method"]
          root_cause?: string | null
          why1?: string | null
          why2?: string | null
          why3?: string | null
          why4?: string | null
          why5?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string
          eight_d?: Json | null
          fishbone_categories?: Json | null
          id?: string
          method?: Database["public"]["Enums"]["rca_method"]
          root_cause?: string | null
          why1?: string | null
          why2?: string | null
          why3?: string | null
          why4?: string | null
          why5?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "root_cause_analysis_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: true
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_action_code: {
        Args: { _type: Database["public"]["Enums"]["action_type"] }
        Returns: string
      }
    }
    Enums: {
      action_priority: "alta" | "media" | "baja"
      action_source:
        | "auditoria"
        | "cliente"
        | "proceso"
        | "inspeccion"
        | "riesgo"
        | "direccion"
      action_status: "abierta" | "en_proceso" | "cerrada" | "vencida"
      action_type: "correctiva" | "preventiva" | "mejora"
      app_role: "administrador" | "responsable" | "auditor"
      rca_method: "5_porques" | "ishikawa" | "8d"
      task_status: "pendiente" | "en_proceso" | "completada"
      verification_result: "eficaz" | "no_eficaz"
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
      action_priority: ["alta", "media", "baja"],
      action_source: [
        "auditoria",
        "cliente",
        "proceso",
        "inspeccion",
        "riesgo",
        "direccion",
      ],
      action_status: ["abierta", "en_proceso", "cerrada", "vencida"],
      action_type: ["correctiva", "preventiva", "mejora"],
      app_role: ["administrador", "responsable", "auditor"],
      rca_method: ["5_porques", "ishikawa", "8d"],
      task_status: ["pendiente", "en_proceso", "completada"],
      verification_result: ["eficaz", "no_eficaz"],
    },
  },
} as const
