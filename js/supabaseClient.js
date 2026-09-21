// js/supabaseClient.js - Versão tradicional (sem import/export)

// Configuração do Supabase
const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';

// Cria o cliente Supabase se não existir
if (!window.supabase) {
    throw new Error('A biblioteca do Supabase precisa ser carregada antes de supabaseClient.js.');
}

if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

console.log('✅ Supabase Client inicializado com sucesso!');