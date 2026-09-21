/* Proteção de páginas privadas.
   Uso: <body data-tipo-permitido="cliente,gestor,desenvolvedor"> */
(async function protegerAreaPrivada() {
  const tiposPermitidos = (document.body.dataset.tipoPermitido || '')
    .split(',')
    .map((tipo) => tipo.trim())
    .filter(Boolean);

  if (!window.supabaseClient) return;

  const { data: resultadoSessao } = await window.supabaseClient.auth.getSession();
  const sessao = resultadoSessao?.session;

  if (!sessao) {
    const paginaLogin = document.body.dataset.paginaLogin || '../cadastro/login.html';
    window.location.replace(paginaLogin);
    return;
  }

  if (!tiposPermitidos.length) return;

  const { data: perfil, error } = await window.supabaseClient
    .from('perfis')
    .select('tipo_usuario, nome_completo, email, avatar_url')
    .eq('usuario_auth_id', sessao.user.id)
    .maybeSingle();

  if (error) {
    console.error('Não foi possível verificar o perfil:', error);
    return;
  }

  if (!perfil || !tiposPermitidos.includes(perfil.tipo_usuario)) {
    window.location.replace('../Perfil/cliente.html');
    return;
  }

  window.perfilAutenticado = perfil;
  document.dispatchEvent(new CustomEvent('perfil-autenticado', { detail: perfil }));
})();
