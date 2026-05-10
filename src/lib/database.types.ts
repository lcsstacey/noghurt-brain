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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer: Json
          id: string
          is_correct: boolean | null
          locked_at: string
          player_id: string
          points_awarded: number | null
          question_id: string
          room_id: string
        }
        Insert: {
          answer: Json
          id?: string
          is_correct?: boolean | null
          locked_at?: string
          player_id: string
          points_awarded?: number | null
          question_id: string
          room_id: string
        }
        Update: {
          answer?: Json
          id?: string
          is_correct?: boolean | null
          locked_at?: string
          player_id?: string
          points_awarded?: number | null
          question_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          color: string
          id: string
          is_host: boolean
          joined_at: string
          name: string
          room_id: string
          score: number
          streak: number
          user_id: string | null
        }
        Insert: {
          color: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name: string
          room_id: string
          score?: number
          streak?: number
          user_id?: string | null
        }
        Update: {
          color?: string
          id?: string
          is_host?: boolean
          joined_at?: string
          name?: string
          room_id?: string
          score?: number
          streak?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          current_question_idx: number
          host_id: string
          id: string
          mainframe_question_id: string | null
          phase: string
          question_started_at: string | null
          questions: Json
          settings: Json
        }
        Insert: {
          code: string
          created_at?: string
          current_question_idx?: number
          host_id: string
          id?: string
          mainframe_question_id?: string | null
          phase?: string
          question_started_at?: string | null
          questions?: Json
          settings?: Json
        }
        Update: {
          code?: string
          created_at?: string
          current_question_idx?: number
          host_id?: string
          id?: string
          mainframe_question_id?: string | null
          phase?: string
          question_started_at?: string | null
          questions?: Json
          settings?: Json
        }
        Relationships: []
      }
      wagers: {
        Row: {
          amount: number
          id: string
          locked_at: string
          pct: number
          player_id: string
          room_id: string
        }
        Insert: {
          amount: number
          id?: string
          locked_at?: string
          pct: number
          player_id: string
          room_id: string
        }
        Update: {
          amount?: number
          id?: string
          locked_at?: string
          pct?: number
          player_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wagers_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wagers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_phase: {
        Args: { p_room_id: string }
        Returns: {
          code: string
          created_at: string
          current_question_idx: number
          host_id: string
          id: string
          mainframe_question_id: string | null
          phase: string
          question_started_at: string | null
          questions: Json
          settings: Json
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      apply_grading: {
        Args: { p_grading: Json; p_room_id: string }
        Returns: undefined
      }
      find_room_by_code: {
        Args: { p_code: string }
        Returns: {
          code: string
          created_at: string
          current_question_idx: number
          host_id: string
          id: string
          mainframe_question_id: string | null
          phase: string
          question_started_at: string | null
          questions: Json
          settings: Json
        }[]
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_room_host: { Args: { p_room_id: string }; Returns: boolean }
      is_room_member: { Args: { p_room_id: string }; Returns: boolean }
      kick_player: {
        Args: { p_player_id: string; p_room_id: string }
        Returns: undefined
      }
      list_room_answers: {
        Args: { p_question_id: string; p_room_id: string }
        Returns: {
          answer: Json
          id: string
          is_correct: boolean | null
          locked_at: string
          player_id: string
          points_awarded: number | null
          question_id: string
          room_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "answers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_room_players: {
        Args: { p_room_id: string }
        Returns: {
          color: string
          id: string
          is_host: boolean
          joined_at: string
          name: string
          room_id: string
          score: number
          streak: number
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "players"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_room_wagers: {
        Args: { p_room_id: string }
        Returns: {
          amount: number
          id: string
          locked_at: string
          pct: number
          player_id: string
          room_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "wagers"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      my_player_id: { Args: { p_room_id: string }; Returns: string }
      reset_room: {
        Args: { p_room_id: string }
        Returns: {
          code: string
          created_at: string
          current_question_idx: number
          host_id: string
          id: string
          mainframe_question_id: string | null
          phase: string
          question_started_at: string | null
          questions: Json
          settings: Json
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      room_at_or_past_final_reveal: {
        Args: { p_room_id: string }
        Returns: boolean
      }
      room_past_question: { Args: { p_room_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const