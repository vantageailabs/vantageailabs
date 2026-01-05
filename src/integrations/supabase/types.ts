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
      admin_settings: {
        Row: {
          advance_booking_days: number
          appointment_duration_minutes: number
          buffer_minutes: number
          created_at: string
          default_monthly_capacity: number
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          advance_booking_days?: number
          appointment_duration_minutes?: number
          buffer_minutes?: number
          created_at?: string
          default_monthly_capacity?: number
          id?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          advance_booking_days?: number
          appointment_duration_minutes?: number
          buffer_minutes?: number
          created_at?: string
          default_monthly_capacity?: number
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          duration_minutes: number
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          zoom_join_url: string | null
          zoom_meeting_id: string | null
          zoom_password: string | null
          zoom_start_url: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          duration_minutes?: number
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_password?: string | null
          zoom_start_url?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          duration_minutes?: number
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
          zoom_password?: string | null
          zoom_start_url?: string | null
        }
        Relationships: []
      }
      assessment_responses: {
        Row: {
          answers: Json
          appointment_id: string | null
          business_type: string | null
          created_at: string
          email: string | null
          estimated_hours_saved: number
          estimated_monthly_savings: number
          id: string
          monthly_revenue: string | null
          overall_score: number
          timeline: string | null
          tool_stack: string | null
        }
        Insert: {
          answers: Json
          appointment_id?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          estimated_hours_saved: number
          estimated_monthly_savings: number
          id?: string
          monthly_revenue?: string | null
          overall_score: number
          timeline?: string | null
          tool_stack?: string | null
        }
        Update: {
          answers?: Json
          appointment_id?: string | null
          business_type?: string | null
          created_at?: string
          email?: string | null
          estimated_hours_saved?: number
          estimated_monthly_savings?: number
          id?: string
          monthly_revenue?: string | null
          overall_score?: number
          timeline?: string | null
          tool_stack?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      client_costs: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          incurred_at: string
          name: string
          notes: string | null
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          id?: string
          incurred_at?: string
          name: string
          notes?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          incurred_at?: string
          name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_costs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_services: {
        Row: {
          agreed_price: number
          client_id: string
          created_at: string
          end_date: string | null
          id: string
          service_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["service_status"]
        }
        Insert: {
          agreed_price?: number
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          service_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["service_status"]
        }
        Update: {
          agreed_price?: number
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          service_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["service_status"]
        }
        Relationships: [
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assessment_id: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          initial_appointment_id: string | null
          lead_id: string | null
          name: string
          notes: string | null
          phone: string | null
          start_month: string | null
          status: Database["public"]["Enums"]["client_status"]
          support_package_id: string | null
          total_contract_value: number
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          initial_appointment_id?: string | null
          lead_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          start_month?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          support_package_id?: string | null
          total_contract_value?: number
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          initial_appointment_id?: string | null
          lead_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          start_month?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          support_package_id?: string | null
          total_contract_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessment_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_initial_appointment_id_fkey"
            columns: ["initial_appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_support_package_id_fkey"
            columns: ["support_package_id"]
            isOneToOne: false
            referencedRelation: "support_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      lead_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      monthly_capacity: {
        Row: {
          artificial_clients: number
          created_at: string
          id: string
          max_clients: number
          notes: string | null
          updated_at: string
          year_month: string
        }
        Insert: {
          artificial_clients?: number
          created_at?: string
          id?: string
          max_clients?: number
          notes?: string | null
          updated_at?: string
          year_month: string
        }
        Update: {
          artificial_clients?: number
          created_at?: string
          id?: string
          max_clients?: number
          notes?: string | null
          updated_at?: string
          year_month?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          base_price: number
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          base_price?: number
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      support_packages: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          hours_included: number
          id: string
          is_active: boolean
          monthly_price: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          hours_included?: number
          id?: string
          is_active?: boolean
          monthly_price?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          hours_included?: number
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      working_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      client_status: "lead" | "prospect" | "active" | "completed" | "churned"
      service_status: "planned" | "in_progress" | "completed" | "cancelled"
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
      app_role: ["admin", "user"],
      client_status: ["lead", "prospect", "active", "completed", "churned"],
      service_status: ["planned", "in_progress", "completed", "cancelled"],
    },
  },
} as const
