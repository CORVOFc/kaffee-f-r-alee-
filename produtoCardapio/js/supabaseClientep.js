// js/supabaseClient.js - Versão corrigida
(function() {
  'use strict';

  // Configuração do Supabase
  const SUPABASE_URL = 'https://sldvrltkeatmjdpbtrpe.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_5KknAcAqzEhEhvdhRfYLbg_PCC_i9rT';

  // Verifica se o Supabase foi carregado
  if (typeof supabase === 'undefined' && typeof window.supabase === 'undefined') {
      console.error('❌ Biblioteca Supabase não carregada!');
      return;
  }

  // Usa o cliente existente ou cria um novo
  const supabaseLib = window.supabase || supabase;
  
  // Só cria se não existir
  if (!window.supabaseClient) {
      try {
          window.supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          console.log('✅ Supabase Client criado com sucesso!');
      } catch (error) {
          console.error('❌ Erro ao criar Supabase Client:', error);
      }
  } else {
      console.log('✅ Supabase Client já existente!');
  }

  // Função para verificar login (já existe no carrinho.js, mas mantemos para compatibilidade)
  if (typeof window.verificarLogin === 'undefined') {
      window.verificarLogin = function() {
          try {
              const usuarioLogado = localStorage.getItem('usuarioLogado') || sessionStorage.getItem('usuarioLogado');
              return usuarioLogado ? JSON.parse(usuarioLogado) : null;
          } catch (error) {
              console.error('Erro ao verificar login:', error);
              return null;
          }
      };
  }

  console.log('✅ supabaseClient.js carregado!');
})();