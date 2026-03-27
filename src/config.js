export const CONFIG = {
  shopName: "BarberPro",
  shopSlogan: "Tradição & Estilo em cada corte",
  shopAddress: "Rua das Tesouras, 123 — Centro",
  shopPhone: "(44) 99999-0000",
  shopHours: "Seg–Sáb: 09h–20h",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgczogtyzlmuvlotnvwm.supabase.co",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3pvZ3R5emxtdXZsb3RudndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDMxMDYsImV4cCI6MjA4OTY3OTEwNn0.DOfjCbnfdgJArhmBt2CK-fvv41PBu4Jr0EmUlbsQI1w",
  adminEmail: "admin@barberpro.com",
  adminPassword: "admin123",
};

export const ADMIN_USER = { id: "admin-local", email: CONFIG.adminEmail, name: "Administrador", role: "admin" };


