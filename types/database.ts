// Tipe ini merepresentasikan hasil `supabase gen types typescript --project-id <id> > types/database.ts`
// Setelah project Supabase dibuat, jalankan perintah di atas untuk regenerasi otomatis.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          address: string;
          description: string | null;
          latitude: number;
          longitude: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          address: string;
          description?: string | null;
          latitude: number;
          longitude: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          address?: string;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];

export type LocationWithCategory = Location & {
  categories: Pick<Category, "id" | "name" | "icon" | "color"> | null;
};
