export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          name: string | null
          sku: string | null
          description: string | null
          category: string | null
          image_url: string | null
          is_active: boolean | null
          updated_at: string
          model: string | null
          order_code: string | null
          invoice_concept: string | null
          generic_description: string | null
          new_alg_description: string | null
          measurements: string | null
          alg_description: string | null
          sale_price: string | number | null
          base_hospital_price: string | number | null
          line: string | null
          type: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name?: string | null
          sku?: string | null
          description?: string | null
          category?: string | null
          image_url?: string | null
          is_active?: boolean | null
          updated_at?: string
          model?: string | null
          order_code?: string | null
          invoice_concept?: string | null
          generic_description?: string | null
          new_alg_description?: string | null
          measurements?: string | null
          alg_description?: string | null
          sale_price?: string | number | null
          base_hospital_price?: string | number | null
          line?: string | null
          type?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string | null
          sku?: string | null
          description?: string | null
          category?: string | null
          image_url?: string | null
          is_active?: boolean | null
          updated_at?: string
          model?: string | null
          order_code?: string | null
          invoice_concept?: string | null
          generic_description?: string | null
          new_alg_description?: string | null
          measurements?: string | null
          alg_description?: string | null
          sale_price?: string | number | null
          base_hospital_price?: string | number | null
          line?: string | null
          type?: string | null
        }
      }
      product_prices: {
        Row: {
          id: string
          product_id: string
          client_id: string | null
          price: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          client_id?: string | null
          price: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          client_id?: string | null
          price?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      hospitals: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hospital_prices: {
        Row: {
          id: string
          hospital_id: string
          product_id: string
          price: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hospital_id: string
          product_id: string
          price: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hospital_id?: string
          product_id?: string
          price?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          hospital_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency: string
          notes: string | null
          shipping_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          hospital_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount: number
          currency?: string
          notes?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          hospital_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          total_amount?: number
          currency?: string
          notes?: string | null
          shipping_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
