// js/supabaseClient.js


const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';

if (!window.supabase ) {
    throw new Error('A biblioteca do Supabase não foi carregada.');
  }
  
  export const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );