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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          deny_reason: string | null
          id: string
          request_message: string
          requester_email: string
          requester_name: string
          requester_organization: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          deny_reason?: string | null
          id?: string
          request_message: string
          requester_email: string
          requester_name: string
          requester_organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          deny_reason?: string | null
          id?: string
          request_message?: string
          requester_email?: string
          requester_name?: string
          requester_organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      admin_queries: {
        Row: {
          created_at: string
          execution_count: number | null
          id: string
          is_template: boolean | null
          last_executed_at: string | null
          query_name: string
          query_sql: string
          user_id: string
        }
        Insert: {
          created_at?: string
          execution_count?: number | null
          id?: string
          is_template?: boolean | null
          last_executed_at?: string | null
          query_name: string
          query_sql: string
          user_id: string
        }
        Update: {
          created_at?: string
          execution_count?: number | null
          id?: string
          is_template?: boolean | null
          last_executed_at?: string | null
          query_name?: string
          query_sql?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          integration_id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string | null
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_id: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string | null
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string | null
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_branding: {
        Row: {
          created_at: string
          header_bg_color: string | null
          id: string
          logo_custom_height: number | null
          logo_custom_width: number | null
          logo_placement: string | null
          logo_size: string | null
          logo_url: string | null
          primary_color: string | null
          show_site_name: boolean | null
          sidebar_bg_color: string | null
          site_name: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          header_bg_color?: string | null
          id?: string
          logo_custom_height?: number | null
          logo_custom_width?: number | null
          logo_placement?: string | null
          logo_size?: string | null
          logo_url?: string | null
          primary_color?: string | null
          show_site_name?: boolean | null
          sidebar_bg_color?: string | null
          site_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          header_bg_color?: string | null
          id?: string
          logo_custom_height?: number | null
          logo_custom_width?: number | null
          logo_placement?: string | null
          logo_size?: string | null
          logo_url?: string | null
          primary_color?: string | null
          show_site_name?: boolean | null
          sidebar_bg_color?: string | null
          site_name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      app_permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          permission_key: string
          permission_value: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key: string
          permission_value?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          permission_key?: string
          permission_value?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          integration_id: string | null
          ip_address: unknown | null
          request_data: Json | null
          resource_id: string | null
          resource_type: string | null
          response_status: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          integration_id?: string | null
          ip_address?: unknown | null
          request_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          response_status?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          integration_id?: string | null
          ip_address?: unknown | null
          request_data?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          response_status?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_audit_logs: {
        Row: {
          created_at: string
          email: string
          event_type: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          location: Json | null
          session_id: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_type: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          location?: Json | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          sender: string
          session_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          sender: string
          session_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          sender?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          chat_type: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_number: string | null
          device_serials: string[] | null
          id: string
          ticket_id: string | null
          title: string
          updated_at: string
          user_id: string
          webhook_id: string | null
        }
        Insert: {
          chat_type?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_number?: string | null
          device_serials?: string[] | null
          id?: string
          ticket_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
          webhook_id?: string | null
        }
        Update: {
          chat_type?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_number?: string | null
          device_serials?: string[] | null
          id?: string
          ticket_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_config"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_field_config: {
        Row: {
          created_at: string
          display_name: string
          display_order: number
          field_name: string
          field_type: string
          icon: string | null
          id: string
          is_required: boolean
          is_visible: boolean
          placeholder_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number
          field_name: string
          field_type?: string
          icon?: string | null
          id?: string
          is_required?: boolean
          is_visible?: boolean
          placeholder_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number
          field_name?: string
          field_type?: string
          icon?: string | null
          id?: string
          is_required?: boolean
          is_visible?: boolean
          placeholder_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      default_test_templates: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          execution_order: number | null
          id: string
          is_required: boolean | null
          name: string
          plan_type: string
          test_category: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_order?: number | null
          id?: string
          is_required?: boolean | null
          name: string
          plan_type: string
          test_category: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          execution_order?: number | null
          id?: string
          is_required?: boolean | null
          name?: string
          plan_type?: string
          test_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      freshdesk_category_config: {
        Row: {
          created_at: string
          display_order: number
          freshdesk_config_id: string | null
          id: string
          level: number
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          freshdesk_config_id?: string | null
          id?: string
          level?: number
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          freshdesk_config_id?: string | null
          id?: string
          level?: number
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freshdesk_category_config_freshdesk_config_id_fkey"
            columns: ["freshdesk_config_id"]
            isOneToOne: false
            referencedRelation: "freshdesk_config"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freshdesk_category_config_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "freshdesk_category_config"
            referencedColumns: ["id"]
          },
        ]
      }
      freshdesk_config: {
        Row: {
          api_key: string
          created_at: string
          default_category_id: string | null
          domain: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          default_category_id?: string | null
          domain: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          default_category_id?: string | null
          domain?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "freshdesk_config_default_category_id_fkey"
            columns: ["default_category_id"]
            isOneToOne: false
            referencedRelation: "freshdesk_category_config"
            referencedColumns: ["id"]
          },
        ]
      }
      general_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      imported_test_cases: {
        Row: {
          created_at: string
          endpoint_path: string | null
          expected_response: Json | null
          external_test_case_id: string
          id: string
          import_status: string | null
          integration_id: string
          metadata: Json | null
          method: string | null
          name: string
          request_body: string | null
          request_headers: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint_path?: string | null
          expected_response?: Json | null
          external_test_case_id: string
          id?: string
          import_status?: string | null
          integration_id: string
          metadata?: Json | null
          method?: string | null
          name: string
          request_body?: string | null
          request_headers?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint_path?: string | null
          expected_response?: Json | null
          external_test_case_id?: string
          id?: string
          import_status?: string | null
          integration_id?: string
          metadata?: Json | null
          method?: string | null
          name?: string
          request_body?: string | null
          request_headers?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_test_cases_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      merged_transactions: {
        Row: {
          "Account Number": string | null
          Amount: string | null
          "Auth. Amt.": string | null
          "Auth. Ltr.": string | null
          Customer: string | null
          Fee: string | null
          "Invoiced No": string | null
          Litres: string | null
          Merchant: string | null
          Product: string | null
          Pump: string | null
          Result: string | null
          source_customer: string | null
          "Transaction Date": string | null
          "Transaction Id": string | null
          TxnApproved: string | null
          Type: string | null
          "Voucher number": string | null
        }
        Insert: {
          "Account Number"?: string | null
          Amount?: string | null
          "Auth. Amt."?: string | null
          "Auth. Ltr."?: string | null
          Customer?: string | null
          Fee?: string | null
          "Invoiced No"?: string | null
          Litres?: string | null
          Merchant?: string | null
          Product?: string | null
          Pump?: string | null
          Result?: string | null
          source_customer?: string | null
          "Transaction Date"?: string | null
          "Transaction Id"?: string | null
          TxnApproved?: string | null
          Type?: string | null
          "Voucher number"?: string | null
        }
        Update: {
          "Account Number"?: string | null
          Amount?: string | null
          "Auth. Amt."?: string | null
          "Auth. Ltr."?: string | null
          Customer?: string | null
          Fee?: string | null
          "Invoiced No"?: string | null
          Litres?: string | null
          Merchant?: string | null
          Product?: string | null
          Pump?: string | null
          Result?: string | null
          source_customer?: string | null
          "Transaction Date"?: string | null
          "Transaction Id"?: string | null
          TxnApproved?: string | null
          Type?: string | null
          "Voucher number"?: string | null
        }
        Relationships: []
      }
      mock_rules: {
        Row: {
          body_match: Json | null
          conditions: Json | null
          created_at: string
          delay_ms: number | null
          headers_match: Json | null
          id: string
          is_active: boolean | null
          method: string
          name: string
          priority: number | null
          query_match: Json | null
          response_template: Json
          status_code: number | null
          tenant_id: string
          updated_at: string
          url_pattern: string
        }
        Insert: {
          body_match?: Json | null
          conditions?: Json | null
          created_at?: string
          delay_ms?: number | null
          headers_match?: Json | null
          id?: string
          is_active?: boolean | null
          method: string
          name: string
          priority?: number | null
          query_match?: Json | null
          response_template: Json
          status_code?: number | null
          tenant_id: string
          updated_at?: string
          url_pattern: string
        }
        Update: {
          body_match?: Json | null
          conditions?: Json | null
          created_at?: string
          delay_ms?: number | null
          headers_match?: Json | null
          id?: string
          is_active?: boolean | null
          method?: string
          name?: string
          priority?: number | null
          query_match?: Json | null
          response_template?: Json
          status_code?: number | null
          tenant_id?: string
          updated_at?: string
          url_pattern?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          can_use_debug_mode: boolean | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          mobile_mode_preference: string | null
          monitoring_mode_preference: string | null
          profile_picture_url: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          can_use_debug_mode?: boolean | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          linkedin_url?: string | null
          mobile_mode_preference?: string | null
          monitoring_mode_preference?: string | null
          profile_picture_url?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          can_use_debug_mode?: boolean | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          mobile_mode_preference?: string | null
          monitoring_mode_preference?: string | null
          profile_picture_url?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      proxyrouter_integrations: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          proxyrouter_webhook_url: string
          sync_status: string | null
          tenant_id: string
          updated_at: string
          webhook_secret: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          proxyrouter_webhook_url: string
          sync_status?: string | null
          tenant_id: string
          updated_at?: string
          webhook_secret: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          proxyrouter_webhook_url?: string
          sync_status?: string | null
          tenant_id?: string
          updated_at?: string
          webhook_secret?: string
        }
        Relationships: [
          {
            foreignKeyName: "proxyrouter_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      request_logs: {
        Row: {
          body: string | null
          headers: Json | null
          id: string
          method: string
          path: string
          query_params: Json | null
          tenant_id: string
          timestamp: string
        }
        Insert: {
          body?: string | null
          headers?: Json | null
          id?: string
          method: string
          path: string
          query_params?: Json | null
          tenant_id: string
          timestamp?: string
        }
        Update: {
          body?: string | null
          headers?: Json | null
          id?: string
          method?: string
          path?: string
          query_params?: Json | null
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      response_logs: {
        Row: {
          id: string
          mock_rule_id: string | null
          request_path: string
          response_body: string | null
          status_code: number
          tenant_id: string
          timestamp: string
        }
        Insert: {
          id?: string
          mock_rule_id?: string | null
          request_path: string
          response_body?: string | null
          status_code: number
          tenant_id: string
          timestamp?: string
        }
        Update: {
          id?: string
          mock_rule_id?: string | null
          request_path?: string
          response_body?: string | null
          status_code?: number
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_logs_mock_rule_id_fkey"
            columns: ["mock_rule_id"]
            isOneToOne: false
            referencedRelation: "mock_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_branding: {
        Row: {
          created_at: string
          id: string
          landing_background_color: string | null
          landing_page_style: string | null
          logo_background_blur: boolean | null
          logo_custom_height: number | null
          logo_custom_width: number | null
          logo_fit_style: string | null
          logo_opacity: number | null
          logo_overlay_color: string | null
          logo_placement: string | null
          logo_position: string | null
          logo_size: string | null
          logo_url: string | null
          mobile_layout_style: string | null
          mobile_logo_size: string | null
          mobile_logo_url: string | null
          show_mobile_logo_in_nav: boolean | null
          show_site_name_on_landing: boolean | null
          site_name: string | null
          updated_at: string
          updated_by: string | null
          yaadt_footer_enabled: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          landing_background_color?: string | null
          landing_page_style?: string | null
          logo_background_blur?: boolean | null
          logo_custom_height?: number | null
          logo_custom_width?: number | null
          logo_fit_style?: string | null
          logo_opacity?: number | null
          logo_overlay_color?: string | null
          logo_placement?: string | null
          logo_position?: string | null
          logo_size?: string | null
          logo_url?: string | null
          mobile_layout_style?: string | null
          mobile_logo_size?: string | null
          mobile_logo_url?: string | null
          show_mobile_logo_in_nav?: boolean | null
          show_site_name_on_landing?: boolean | null
          site_name?: string | null
          updated_at?: string
          updated_by?: string | null
          yaadt_footer_enabled?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          landing_background_color?: string | null
          landing_page_style?: string | null
          logo_background_blur?: boolean | null
          logo_custom_height?: number | null
          logo_custom_width?: number | null
          logo_fit_style?: string | null
          logo_opacity?: number | null
          logo_overlay_color?: string | null
          logo_placement?: string | null
          logo_position?: string | null
          logo_size?: string | null
          logo_url?: string | null
          mobile_layout_style?: string | null
          mobile_logo_size?: string | null
          mobile_logo_url?: string | null
          show_mobile_logo_in_nav?: boolean | null
          show_site_name_on_landing?: boolean | null
          site_name?: string | null
          updated_at?: string
          updated_by?: string | null
          yaadt_footer_enabled?: boolean | null
        }
        Relationships: []
      }
      sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          integration_id: string
          job_type: string
          max_retries: number | null
          payload: Json | null
          priority: number | null
          result: Json | null
          retry_count: number | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id: string
          job_type: string
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          integration_id?: string
          job_type?: string
          max_retries?: number | null
          payload?: Json | null
          priority?: number | null
          result?: Json | null
          retry_count?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_jobs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_metrics: {
        Row: {
          id: string
          integration_id: string
          metadata: Json | null
          metric_type: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          metadata?: Json | null
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          metadata?: Json | null
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_metrics_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_routing_config: {
        Row: {
          authentication_required: boolean | null
          base_url: string | null
          created_at: string
          id: string
          routing_mode: string | null
          tenant_id: string
          token_required: boolean | null
          updated_at: string
        }
        Insert: {
          authentication_required?: boolean | null
          base_url?: string | null
          created_at?: string
          id?: string
          routing_mode?: string | null
          tenant_id: string
          token_required?: boolean | null
          updated_at?: string
        }
        Update: {
          authentication_required?: boolean | null
          base_url?: string | null
          created_at?: string
          id?: string
          routing_mode?: string | null
          tenant_id?: string
          token_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_routing_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          assertions: Json | null
          completed_at: string | null
          created_at: string
          current_state: string | null
          description: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          is_retryable: boolean | null
          recording_session_id: string | null
          request_data: Json | null
          response_data: Json | null
          retry_count: number | null
          stack_trace: string | null
          started_at: string
          state_history: Json | null
          status: string
          tenant_id: string | null
          test_category: string
          test_data: Json | null
          test_name: string
          test_run_id: string
          timing_breakdown: Json | null
          updated_at: string
        }
        Insert: {
          assertions?: Json | null
          completed_at?: string | null
          created_at?: string
          current_state?: string | null
          description?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          is_retryable?: boolean | null
          recording_session_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          stack_trace?: string | null
          started_at?: string
          state_history?: Json | null
          status: string
          tenant_id?: string | null
          test_category: string
          test_data?: Json | null
          test_name: string
          test_run_id: string
          timing_breakdown?: Json | null
          updated_at?: string
        }
        Update: {
          assertions?: Json | null
          completed_at?: string | null
          created_at?: string
          current_state?: string | null
          description?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          is_retryable?: boolean | null
          recording_session_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          stack_trace?: string | null
          started_at?: string
          state_history?: Json | null
          status?: string
          tenant_id?: string | null
          test_category?: string
          test_data?: Json | null
          test_name?: string
          test_run_id?: string
          timing_breakdown?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_recording_session_id_fkey"
            columns: ["recording_session_id"]
            isOneToOne: false
            referencedRelation: "test_recording_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          environment?: Database["public"]["Enums"]["test_environment"]
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      test_execution_states: {
        Row: {
          can_retry: boolean
          created_at: string
          current_state: string
          id: string
          is_waiting_for_user: boolean
          retry_count: number
          state_data: Json | null
          state_duration_ms: number | null
          state_started_at: string
          test_case_id: string | null
          test_run_id: string
          updated_at: string
        }
        Insert: {
          can_retry?: boolean
          created_at?: string
          current_state?: string
          id?: string
          is_waiting_for_user?: boolean
          retry_count?: number
          state_data?: Json | null
          state_duration_ms?: number | null
          state_started_at?: string
          test_case_id?: string | null
          test_run_id: string
          updated_at?: string
        }
        Update: {
          can_retry?: boolean
          created_at?: string
          current_state?: string
          id?: string
          is_waiting_for_user?: boolean
          retry_count?: number
          state_data?: Json | null
          state_duration_ms?: number | null
          state_started_at?: string
          test_case_id?: string | null
          test_run_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_execution_states_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_execution_states_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: false
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_pack_items: {
        Row: {
          created_at: string
          description: string | null
          execution_order: number
          id: string
          is_required: boolean
          test_category: string
          test_name: string
          test_pack_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          execution_order?: number
          id?: string
          is_required?: boolean
          test_category: string
          test_name: string
          test_pack_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          execution_order?: number
          id?: string
          is_required?: boolean
          test_category?: string
          test_name?: string
          test_pack_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_pack_items_test_pack_id_fkey"
            columns: ["test_pack_id"]
            isOneToOne: false
            referencedRelation: "test_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_pack_runs: {
        Row: {
          created_at: string
          id: string
          signoff_at: string | null
          signoff_by: string | null
          signoff_comments: string | null
          signoff_status: string | null
          status: string
          test_pack_id: string
          test_run_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          signoff_at?: string | null
          signoff_by?: string | null
          signoff_comments?: string | null
          signoff_status?: string | null
          status?: string
          test_pack_id: string
          test_run_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          signoff_at?: string | null
          signoff_by?: string | null
          signoff_comments?: string | null
          signoff_status?: string | null
          status?: string
          test_pack_id?: string
          test_run_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_pack_runs_test_pack_id_fkey"
            columns: ["test_pack_id"]
            isOneToOne: false
            referencedRelation: "test_packs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_pack_runs_test_run_id_fkey"
            columns: ["test_run_id"]
            isOneToOne: true
            referencedRelation: "test_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_packs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          id: string
          is_active: boolean
          name: string
          requires_signoff: boolean
          tenant_id: string | null
          test_plan_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          id?: string
          is_active?: boolean
          name: string
          requires_signoff?: boolean
          tenant_id?: string | null
          test_plan_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          environment?: Database["public"]["Enums"]["test_environment"]
          id?: string
          is_active?: boolean
          name?: string
          requires_signoff?: boolean
          tenant_id?: string | null
          test_plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_packs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_packs_test_plan_id_fkey"
            columns: ["test_plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      test_plan_endpoints: {
        Row: {
          api_url: string
          created_at: string
          endpoint_slug: string
          id: string
          is_active: boolean
          tenant_id: string
          test_plan_id: string
          updated_at: string
        }
        Insert: {
          api_url: string
          created_at?: string
          endpoint_slug: string
          id?: string
          is_active?: boolean
          tenant_id: string
          test_plan_id: string
          updated_at?: string
        }
        Update: {
          api_url?: string
          created_at?: string
          endpoint_slug?: string
          id?: string
          is_active?: boolean
          tenant_id?: string
          test_plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_plan_endpoints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_plan_endpoints_test_plan_id_fkey"
            columns: ["test_plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      test_plans: {
        Row: {
          api_endpoint_slug: string | null
          api_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          endpoint_generated_at: string | null
          id: string
          is_active: boolean
          name: string
          plan_type: string
          tenant_id: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          api_endpoint_slug?: string | null
          api_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_generated_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          plan_type?: string
          tenant_id: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          api_endpoint_slug?: string | null
          api_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_generated_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          tenant_id?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      test_recording_sessions: {
        Row: {
          created_at: string
          destination_url: string
          id: string
          is_active: boolean
          is_recording: boolean
          recording_ended_at: string | null
          recording_started_at: string | null
          session_config: Json | null
          session_name: string
          tenant_id: string
          test_plan_id: string | null
          total_requests_recorded: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_url: string
          id?: string
          is_active?: boolean
          is_recording?: boolean
          recording_ended_at?: string | null
          recording_started_at?: string | null
          session_config?: Json | null
          session_name: string
          tenant_id: string
          test_plan_id?: string | null
          total_requests_recorded?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_url?: string
          id?: string
          is_active?: boolean
          is_recording?: boolean
          recording_ended_at?: string | null
          recording_started_at?: string | null
          session_config?: Json | null
          session_name?: string
          tenant_id?: string
          test_plan_id?: string | null
          total_requests_recorded?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_recording_sessions_test_plan_id_fkey"
            columns: ["test_plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      test_requirements: {
        Row: {
          acknowledged_at: string | null
          conditions: Json | null
          created_at: string
          endpoint_path: string | null
          id: string
          integration_id: string
          priority: number | null
          requirement_type: string
          sent_at: string | null
          status: string | null
          test_method: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          conditions?: Json | null
          created_at?: string
          endpoint_path?: string | null
          id?: string
          integration_id: string
          priority?: number | null
          requirement_type: string
          sent_at?: string | null
          status?: string | null
          test_method?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          conditions?: Json | null
          created_at?: string
          endpoint_path?: string | null
          id?: string
          integration_id?: string
          priority?: number | null
          requirement_type?: string
          sent_at?: string | null
          status?: string | null
          test_method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_requirements_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "proxyrouter_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          api_endpoint_used: string | null
          completed_at: string | null
          config_snapshot: Json | null
          created_at: string
          current_state: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          execution_time_ms: number | null
          failed_tests: number
          id: string
          is_manual_execution: boolean | null
          metadata: Json | null
          passed_tests: number
          plan_config_snapshot: Json | null
          recording_session_id: string | null
          source_plan_id: string | null
          started_at: string
          state_timestamps: Json | null
          status: string
          tenant_id: string | null
          total_tests: number
          trigger_type: string
          triggered_by: string | null
          updated_at: string
          warning_tests: number
        }
        Insert: {
          api_endpoint_used?: string | null
          completed_at?: string | null
          config_snapshot?: Json | null
          created_at?: string
          current_state?: string | null
          environment: Database["public"]["Enums"]["test_environment"]
          execution_time_ms?: number | null
          failed_tests?: number
          id?: string
          is_manual_execution?: boolean | null
          metadata?: Json | null
          passed_tests?: number
          plan_config_snapshot?: Json | null
          recording_session_id?: string | null
          source_plan_id?: string | null
          started_at?: string
          state_timestamps?: Json | null
          status?: string
          tenant_id?: string | null
          total_tests?: number
          trigger_type?: string
          triggered_by?: string | null
          updated_at?: string
          warning_tests?: number
        }
        Update: {
          api_endpoint_used?: string | null
          completed_at?: string | null
          config_snapshot?: Json | null
          created_at?: string
          current_state?: string | null
          environment?: Database["public"]["Enums"]["test_environment"]
          execution_time_ms?: number | null
          failed_tests?: number
          id?: string
          is_manual_execution?: boolean | null
          metadata?: Json | null
          passed_tests?: number
          plan_config_snapshot?: Json | null
          recording_session_id?: string | null
          source_plan_id?: string | null
          started_at?: string
          state_timestamps?: Json | null
          status?: string
          tenant_id?: string | null
          total_tests?: number
          trigger_type?: string
          triggered_by?: string | null
          updated_at?: string
          warning_tests?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_recording_session_id_fkey"
            columns: ["recording_session_id"]
            isOneToOne: false
            referencedRelation: "test_recording_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_runs_source_plan_id_fkey"
            columns: ["source_plan_id"]
            isOneToOne: false
            referencedRelation: "test_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_runs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      test_sets: {
        Row: {
          created_at: string
          depends_on: string[] | null
          description: string | null
          execution_order: number | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          test_pack_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          depends_on?: string[] | null
          description?: string | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          test_pack_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          depends_on?: string[] | null
          description?: string | null
          execution_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          test_pack_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_sets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sets_test_pack_id_fkey"
            columns: ["test_pack_id"]
            isOneToOne: false
            referencedRelation: "test_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      test_tasks: {
        Row: {
          config: Json
          created_at: string
          execution_order: number | null
          id: string
          is_required: boolean | null
          name: string
          task_type: string
          test_set_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          execution_order?: number | null
          id?: string
          is_required?: boolean | null
          name: string
          task_type: string
          test_set_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          execution_order?: number | null
          id?: string
          is_required?: boolean | null
          name?: string
          task_type?: string
          test_set_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_tasks_test_set_id_fkey"
            columns: ["test_set_id"]
            isOneToOne: false
            referencedRelation: "test_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          granted: boolean
          granted_at: string
          granted_by: string | null
          id: string
          permission_name: string
          user_id: string
        }
        Insert: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_name: string
          user_id: string
        }
        Update: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_name_fkey"
            columns: ["permission_name"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["name"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_config: {
        Row: {
          allow_guest_access: boolean
          chat_type: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          allow_guest_access?: boolean
          chat_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          allow_guest_access?: boolean
          chat_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_endpoint_slug: {
        Args: { plan_name: string; plan_type: string }
        Returns: string
      }
      has_permission: {
        Args: { _permission_name: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      test_alert_type: "email" | "slack" | "webhook"
      test_environment: "development" | "staging" | "production"
      test_trigger_condition: "failure" | "success" | "warning"
      user_role: "admin" | "user"
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
      test_alert_type: ["email", "slack", "webhook"],
      test_environment: ["development", "staging", "production"],
      test_trigger_condition: ["failure", "success", "warning"],
      user_role: ["admin", "user"],
    },
  },
} as const
