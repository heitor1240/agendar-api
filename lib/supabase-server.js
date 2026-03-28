import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);

export const getServerData = {
  async getBarbers() {
    const { data, error } = await supabaseServer
      .from('barbers')
      .select('*')
      .eq('active', true)
      .order('id');
    if (error) throw error;
    return data || [];
  },

  async getServices() {
    const { data, error } = await supabaseServer
      .from('services')
      .select('*')
      .eq('active', true)
      .order('id');
    if (error) throw error;
    return data || [];
  },
};
