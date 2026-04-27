/**
 * Supabase database types — hand-maintained until first generation.
 *
 * Once the Supabase project is provisioned and migrations are applied:
 *   npm run db:types
 * will overwrite this file with auto-generated types from the live schema.
 *
 * Source of truth: supabase/migrations/0001_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          country: string;
          city: string | null;
          contact_name: string | null;
          whatsapp: string | null;
          email: string | null;
          website: string | null;
          address: string | null;
          notes: string | null;
          default_lead_time_days: number | null;
          default_moq: number | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country: string;
          city?: string | null;
          contact_name?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          website?: string | null;
          address?: string | null;
          notes?: string | null;
          default_lead_time_days?: number | null;
          default_moq?: number | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
        Relationships: [];
      };
      series: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          hero_image: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          hero_image?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["series"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          sku: string | null;
          description: string | null;
          description_source: "manual" | "ai";
          category_id: string | null;
          subcategory_id: string | null;
          series_id: string | null;
          supplier_id: string | null;
          country_of_origin: string | null;
          dimensions: string | null;
          material: string | null;
          color: string | null;
          capacity: string | null;
          moq: number | null;
          lead_time_days: number | null;
          price: number | null;
          project_types: string[];
          status: "draft" | "published";
          is_featured: boolean;
          image_urls: string[];
          spec_pdf_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          sku?: string | null;
          description?: string | null;
          description_source?: "manual" | "ai";
          category_id?: string | null;
          subcategory_id?: string | null;
          series_id?: string | null;
          supplier_id?: string | null;
          country_of_origin?: string | null;
          dimensions?: string | null;
          material?: string | null;
          color?: string | null;
          capacity?: string | null;
          moq?: number | null;
          lead_time_days?: number | null;
          price?: number | null;
          project_types?: string[];
          status?: "draft" | "published";
          is_featured?: boolean;
          image_urls?: string[];
          spec_pdf_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_relations: {
        Row: {
          id: string;
          product_id: string;
          related_id: string;
          relation_type: "matching" | "similar";
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          related_id: string;
          relation_type?: "matching" | "similar";
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_relations"]["Insert"]
        >;
        Relationships: [];
      };
      enquiry_clicks: {
        Row: {
          id: string;
          product_id: string | null;
          source: "pdp" | "card" | "floating" | "hero" | "footer";
          ip_address: string | null;
          user_agent: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          source: "pdp" | "card" | "floating" | "hero" | "footer";
          ip_address?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["enquiry_clicks"]["Insert"]
        >;
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      set_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ----- Convenience aliases used throughout the app -----
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Series = Database["public"]["Tables"]["series"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductRelation =
  Database["public"]["Tables"]["product_relations"]["Row"];
export type EnquiryClick = Database["public"]["Tables"]["enquiry_clicks"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
