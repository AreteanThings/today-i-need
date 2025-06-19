export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      invitation_emails: {
        Row: {
          accepted_at: string | null
          assignment_id: string | null
          connection_id: string | null
          email_type: string
          id: string
          opened_at: string | null
          recipient_email: string
          sender_id: string
          sent_at: string | null
          task_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          assignment_id?: string | null
          connection_id?: string | null
          email_type: string
          id?: string
          opened_at?: string | null
          recipient_email: string
          sender_id: string
          sent_at?: string | null
          task_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          assignment_id?: string | null
          connection_id?: string | null
          email_type?: string
          id?: string
          opened_at?: string | null
          recipient_email?: string
          sender_id?: string
          sent_at?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_emails_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "task_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_emails_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "user_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_emails_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_contacts: {
        Row: {
          contact_email: string
          id: string
          last_shared_at: string | null
          owner_id: string
        }
        Insert: {
          contact_email: string
          id?: string
          last_shared_at?: string | null
          owner_id: string
        }
        Update: {
          contact_email?: string
          id?: string
          last_shared_at?: string | null
          owner_id?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          accepted_at: string | null
          assignee_email: string
          assignee_user_id: string | null
          assigner_id: string
          assignment_type: string
          created_at: string | null
          id: string
          status: string | null
          task_id: string
        }
        Insert: {
          accepted_at?: string | null
          assignee_email: string
          assignee_user_id?: string | null
          assigner_id: string
          assignment_type: string
          created_at?: string | null
          id?: string
          status?: string | null
          task_id: string
        }
        Update: {
          accepted_at?: string | null
          assignee_email?: string
          assignee_user_id?: string | null
          assigner_id?: string
          assignment_type?: string
          created_at?: string | null
          id?: string
          status?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_completions: {
        Row: {
          completed_at: string
          completed_date: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_shares: {
        Row: {
          contact_email: string
          created_at: string
          id: string
          owner_id: string
          task_id: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          id?: string
          owner_id: string
          task_id: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          id?: string
          owner_id?: string
          task_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          created_at: string
          custom_rrule: string | null
          custom_rrule_text: string | null
          end_date: string | null
          id: string
          is_active: boolean
          is_shared: boolean
          repeat_value: string
          start_date: string
          subtitle: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          custom_rrule?: string | null
          custom_rrule_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          repeat_value: string
          start_date: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          custom_rrule?: string | null
          custom_rrule_text?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          is_shared?: boolean
          repeat_value?: string
          start_date?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          requester_id: string
          status: string | null
          target_email: string
          target_user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          requester_id: string
          status?: string | null
          target_email: string
          target_user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string
          status?: string | null
          target_email?: string
          target_user_id?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
