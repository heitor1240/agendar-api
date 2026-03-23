export const CONFIG = {
  shopName: "BarberPro",
  shopSlogan: "Tradição & Estilo em cada corte",
  shopAddress: "Rua das Tesouras, 123 — Centro",
  shopPhone: "(44) 99999-0000",
  shopHours: "Seg–Sáb: 09h–20h",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "https://dgczogtyzlmuvlotnvwm.supabase.co",
  supabaseKey: import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnY3pvZ3R5emxtdXZsb3RudndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDMxMDYsImV4cCI6MjA4OTY3OTEwNn0.DOfjCbnfdgJArhmBt2CK-fvv41PBu4Jr0EmUlbsQI1w",
  adminEmail: "admin@barberpro.com",
  adminPassword: "admin123",
};

export const ADMIN_USER = { id: "admin-local", email: CONFIG.adminEmail, name: "Administrador", role: "admin" };

export const MOCK_BARBERS = [
  { id: 1, name: "Carlos Silva", role: "Master Barber", bio: "15 anos de experiência. Especialista em degradê e barba.", email: "carlos@barberpro.com", active: true },
  { id: 2, name: "Rafael Costa", role: "Senior Barber", bio: "Apaixonado por estilos clássicos e modernos.", email: "rafael@barberpro.com", active: true },
  { id: 3, name: "Bruno Mendes", role: "Barber", bio: "Especialista em cortes infantis e degradê.", email: "bruno@barberpro.com", active: true },
];

export const MOCK_SERVICES = [
  { id: 1, name: "Corte Clássico", duration: 30, price: 45, description: "Corte tradicional com acabamento perfeito", active: true },
  { id: 2, name: "Corte + Barba", duration: 60, price: 75, description: "Combo completo: corte e modelagem de barba", active: true },
  { id: 3, name: "Degradê", duration: 45, price: 55, description: "Degradê moderno com máquina e tesoura", active: true },
  { id: 4, name: "Barba Completa", duration: 30, price: 35, description: "Toalha quente, navalha e hidratação", active: true },
  { id: 5, name: "Hidratação", duration: 20, price: 25, description: "Tratamento capilar premium", active: true },
  { id: 6, name: "Sobrancelha", duration: 15, price: 15, description: "Design e acabamento da sobrancelha", active: true },
];
