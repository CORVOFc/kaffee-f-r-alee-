/* Configuração pública do Supabase.
   A chave anon pode ficar no frontend. Nunca coloque a service_role aqui. */
(function inicializarSupabase() {
  const URL_SUPABASE = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
  const CHAVE_ANON_PUBLICA = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';

  if (!window.supabase) {
    console.error('Carregue o SDK do Supabase antes deste arquivo.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(URL_SUPABASE, CHAVE_ANON_PUBLICA);
})();
