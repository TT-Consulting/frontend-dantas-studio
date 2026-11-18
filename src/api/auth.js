import { apiClient } from './axiosConfig';

/**
 * POST /usuarios/login (ou /auth/login dependendo do seu SecurityConfig)
 * Autentica o usuário no sistema.
 */
export const realizarLogin = (credenciais) =>
  apiClient
    .post('/usuarios/login', credenciais)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao realizar login:', err);
      throw err;
    });

/**
 * POST /usuarios
 * Cadastra um novo usuário/colaborador no sistema.
 */
export const registrarUsuario = (usuarioDTO) =>
  apiClient
    .post('/usuarios', usuarioDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao registrar usuário:', err);
      throw err;
    });