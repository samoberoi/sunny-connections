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
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          label: string
          line1: string
          line2: string | null
          postcode: string
          user_id: string | null
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          label?: string
          line1: string
          line2?: string | null
          postcode: string
          user_id?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          label?: string
          line1?: string
          line2?: string | null
          postcode?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          address_city: string
          address_line1: string
          address_postcode: string
          bathrooms: number | null
          bedrooms: number | null
          cleaner_avatar: string | null
          cleaner_id: string | null
          cleaner_name: string | null
          created_at: string
          customer_id: string
          customer_name: string
          date: string
          duration: number
          id: string
          notes: string | null
          otp: string
          property_type: string
          rating: number | null
          recurring: Database["public"]["Enums"]["recurring_type"]
          review: string | null
          service_id: string
          service_name: string
          status: Database["public"]["Enums"]["booking_status"]
          subscription_end_date: string | null
          subscription_status: string | null
          tier: string | null
          time: string
          total_cost: number
          updated_at: string
        }
        Insert: {
          address_city?: string
          address_line1: string
          address_postcode: string
          bathrooms?: number | null
          bedrooms?: number | null
          cleaner_avatar?: string | null
          cleaner_id?: string | null
          cleaner_name?: string | null
          created_at?: string
          customer_id: string
          customer_name: string
          date: string
          duration: number
          id?: string
          notes?: string | null
          otp?: string
          property_type?: string
          rating?: number | null
          recurring?: Database["public"]["Enums"]["recurring_type"]
          review?: string | null
          service_id: string
          service_name: string
          status?: Database["public"]["Enums"]["booking_status"]
          subscription_end_date?: string | null
          subscription_status?: string | null
          tier?: string | null
          time: string
          total_cost: number
          updated_at?: string
        }
        Update: {
          address_city?: string
          address_line1?: string
          address_postcode?: string
          bathrooms?: number | null
          bedrooms?: number | null
          cleaner_avatar?: string | null
          cleaner_id?: string | null
          cleaner_name?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          otp?: string
          property_type?: string
          rating?: number | null
          recurring?: Database["public"]["Enums"]["recurring_type"]
          review?: string | null
          service_id?: string
          service_name?: string
          status?: Database["public"]["Enums"]["booking_status"]
          subscription_end_date?: string | null
          subscription_status?: string | null
          tier?: string | null
          time?: string
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_availability: {
        Row: {
          available: boolean
          cleaner_id: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
        }
        Insert: {
          available?: boolean
          cleaner_id: string
          day_of_week: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Update: {
          available?: boolean
          cleaner_id?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_availability_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_leaves: {
        Row: {
          cleaner_id: string
          created_at: string
          end_date: string
          id: string
          reason: string | null
          replacement_cleaner_id: string | null
          start_date: string
          status: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          end_date: string
          id?: string
          reason?: string | null
          replacement_cleaner_id?: string | null
          start_date: string
          status?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          end_date?: string
          id?: string
          reason?: string | null
          replacement_cleaner_id?: string | null
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_leaves_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleaner_leaves_replacement_cleaner_id_fkey"
            columns: ["replacement_cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaner_locations: {
        Row: {
          cleaner_id: string
          id: string
          latitude: number
          longitude: number
          updated_at: string | null
        }
        Insert: {
          cleaner_id: string
          id?: string
          latitude: number
          longitude: number
          updated_at?: string | null
        }
        Update: {
          cleaner_id?: string
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaner_locations_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: true
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
        ]
      }
      cleaners: {
        Row: {
          address_line1: string | null
          address_postcode: string | null
          available: boolean
          avatar: string | null
          created_at: string
          experience: number
          first_name: string | null
          id: string
          last_name: string | null
          name: string
          rating: number
          review_count: number
          specialisations: string[]
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          address_line1?: string | null
          address_postcode?: string | null
          available?: boolean
          avatar?: string | null
          created_at?: string
          experience?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          name: string
          rating?: number
          review_count?: number
          specialisations?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          address_line1?: string | null
          address_postcode?: string | null
          available?: boolean
          avatar?: string | null
          created_at?: string
          experience?: number
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string
          rating?: number
          review_count?: number
          specialisations?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string
          discount_percent: number
          expires_at: string
          id: string
          max_uses: number
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description: string
          discount_percent: number
          expires_at: string
          id?: string
          max_uses?: number
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string
          discount_percent?: number
          expires_at?: string
          id?: string
          max_uses?: number
          used_count?: number
        }
        Relationships: []
      }
      customer_streaks: {
        Row: {
          booking_count: number | null
          created_at: string | null
          customer_id: string
          free_clean_earned: boolean | null
          free_clean_redeemed: boolean | null
          id: string
          month: string
          streak_active: boolean | null
        }
        Insert: {
          booking_count?: number | null
          created_at?: string | null
          customer_id: string
          free_clean_earned?: boolean | null
          free_clean_redeemed?: boolean | null
          id?: string
          month: string
          streak_active?: boolean | null
        }
        Update: {
          booking_count?: number | null
          created_at?: string | null
          customer_id?: string
          free_clean_earned?: boolean | null
          free_clean_redeemed?: boolean | null
          id?: string
          month?: string
          streak_active?: boolean | null
        }
        Relationships: []
      }
      enrolment_applications: {
        Row: {
          agreed_terms: boolean
          availability: Json
          bank_account_number: string | null
          bank_sort_code: string | null
          dbs_consent: boolean
          dob: string
          email: string
          experience: number
          full_name: string
          id: string
          id_type: string
          notes: string | null
          phone: string
          postcode: string
          reference_contacts: Json
          right_to_work: string
          specialisations: string[]
          status: Database["public"]["Enums"]["enrolment_status"]
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agreed_terms?: boolean
          availability?: Json
          bank_account_number?: string | null
          bank_sort_code?: string | null
          dbs_consent?: boolean
          dob: string
          email: string
          experience?: number
          full_name: string
          id?: string
          id_type: string
          notes?: string | null
          phone: string
          postcode: string
          reference_contacts?: Json
          right_to_work: string
          specialisations?: string[]
          status?: Database["public"]["Enums"]["enrolment_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agreed_terms?: boolean
          availability?: Json
          bank_account_number?: string | null
          bank_sort_code?: string | null
          dbs_consent?: boolean
          dob?: string
          email?: string
          experience?: number
          full_name?: string
          id?: string
          id_type?: string
          notes?: string | null
          phone?: string
          postcode?: string
          reference_contacts?: Json
          right_to_work?: string
          specialisations?: string[]
          status?: Database["public"]["Enums"]["enrolment_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favourite_cleaners: {
        Row: {
          cleaner_id: string
          created_at: string
          customer_id: string
          id: string
        }
        Insert: {
          cleaner_id: string
          created_at?: string
          customer_id: string
          id?: string
        }
        Update: {
          cleaner_id?: string
          created_at?: string
          customer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favourite_cleaners_cleaner_id_fkey"
            columns: ["cleaner_id"]
            isOneToOne: false
            referencedRelation: "cleaners"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      offer_claims: {
        Row: {
          claimed_at: string | null
          customer_id: string
          id: string
          offer_id: string
          redeemed: boolean | null
        }
        Insert: {
          claimed_at?: string | null
          customer_id: string
          id?: string
          offer_id: string
          redeemed?: boolean | null
        }
        Update: {
          claimed_at?: string | null
          customer_id?: string
          id?: string
          offer_id?: string
          redeemed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_claims_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          active: boolean | null
          claimed_count: number | null
          code: string | null
          created_at: string | null
          description: string
          discount_percent: number
          id: string
          max_claims: number | null
          title: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          active?: boolean | null
          claimed_count?: number | null
          code?: string | null
          created_at?: string | null
          description: string
          discount_percent: number
          id?: string
          max_claims?: number | null
          title: string
          valid_from: string
          valid_until: string
        }
        Update: {
          active?: boolean | null
          claimed_count?: number | null
          code?: string | null
          created_at?: string | null
          description?: string
          discount_percent?: number
          id?: string
          max_claims?: number | null
          title?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          bathrooms: number | null
          bedrooms: number | null
          budget_preference: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          onboarding_completed: boolean | null
          pet_info: string | null
          phone: string
          preferred_day: string | null
          property_size: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_preference?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          onboarding_completed?: boolean | null
          pet_info?: string | null
          phone: string
          preferred_day?: string | null
          property_size?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          budget_preference?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean | null
          pet_info?: string | null
          phone?: string
          preferred_day?: string | null
          property_size?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string
          icon: string
          id: string
          max_duration: number
          min_duration: number
          name: string
          rate_per_hour: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description: string
          icon?: string
          id?: string
          max_duration?: number
          min_duration?: number
          name: string
          rate_per_hour: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string
          icon?: string
          id?: string
          max_duration?: number
          min_duration?: number
          name?: string
          rate_per_hour?: number
          updated_at?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          content: string[]
          created_at: string
          id: string
          level: number
          level_title: string
          module_number: number
          title: string
        }
        Insert: {
          content?: string[]
          created_at?: string
          id?: string
          level: number
          level_title: string
          module_number: number
          title: string
        }
        Update: {
          content?: string[]
          created_at?: string
          id?: string
          level?: number
          level_title?: string
          module_number?: number
          title?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          module_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      booking_status:
        | "pending"
        | "assigned"
        | "en-route"
        | "otp-verified"
        | "in-progress"
        | "completed"
        | "cancelled"
      enrolment_status:
        | "submitted"
        | "under-review"
        | "interview"
        | "training"
        | "active"
        | "rejected"
      notification_type: "booking" | "promo" | "system"
      recurring_type: "none" | "weekly" | "fortnightly" | "monthly"
      service_category: "cleaning" | "housekeeping"
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
      app_role: ["admin", "moderator", "user"],
      booking_status: [
        "pending",
        "assigned",
        "en-route",
        "otp-verified",
        "in-progress",
        "completed",
        "cancelled",
      ],
      enrolment_status: [
        "submitted",
        "under-review",
        "interview",
        "training",
        "active",
        "rejected",
      ],
      notification_type: ["booking", "promo", "system"],
      recurring_type: ["none", "weekly", "fortnightly", "monthly"],
      service_category: ["cleaning", "housekeeping"],
    },
  },
} as const
