import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../src/config';

const supabaseUrl = CONFIG.supabaseUrl;
const supabaseKey = CONFIG.supabaseKey;

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
  }
};
