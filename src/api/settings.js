import { apiClient } from './axiosConfig';

/**
* GET /configuracoes
* Retorna as preferências atuais do sistema ou valores padrão do banco.
*/
export const obterConfiguracoes = () =>
  apiClient
    .get('/configuracoes')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao obter preferências do sistema:', err);
      throw err;
    });

/**
 * PUT /configuracoes
 * Atualiza todas as opções de tema, idioma e regras de notificações.
 * @param {Object} configuracaoDTO - Dados atualizados da configuração.
 */
export const salvarConfiguracoes = (configuracaoDTO) =>
  apiClient
    .put('/configuracoes', configuracaoDTO)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao atualizar configurações do sistema:', err);
      throw err;
    });

/**
 * PATCH /configuracoes/toggle-tema
 * Alterna rapidamente o estado entre modo claro e escuro.
 */
export const alternarTemaRapido = () =>
  apiClient
    .patch('/configuracoes/toggle-tema')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao alternar tema rápido:', err);
      throw err;
    });

/**
* PATCH /configuracoes/atualizar-idioma
* Atualiza isoladamente o idioma do sistema do administrador.
* @param {string} novoIdioma - Código do idioma ('pt-BR', 'en-US', 'es-ES')
*/
export const mudarIdiomaSistema = (novoIdioma) =>
  apiClient
    .patch(`/configuracoes/atualizar-idioma?novoIdioma=${novoIdioma}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao mudar idioma do sistema:', err);
      throw err;
    });

/**
* PATCH /configuracoes/toggle-push
* Alterna rapidamente o estado das notificações push entre ligado e desligado.
*/
export const alternarPushRapido = () =>
  apiClient
    .patch('/configuracoes/toggle-push')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao alternar notificações push:', err);
      throw err;
    });

/**
 * PATCH /configuracoes/toggle-email
 * Alterna rapidamente o estado do envio de e-mails entre ligado e desligado.
 */
export const alternarEmailRapido = () =>
  apiClient
    .patch('/configuracoes/toggle-email')
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao alternar notificações por e-mail:', err);
      throw err;
    });

    /**
 * GET /configuracoes/exportar
 * Descarrega o ficheiro CSV correspondente à tabela e período selecionados.
 * Como este endpoint retorna um ficheiro (arraybuffer/blob), configuramos o responseType apropriado.
 */
export const exportarDadosBanco = (tabela, dataInicio, dataFim) => {
  let url = `/configuracoes/exportar?tabela=${tabela}`;
  if (dataInicio) url += `&dataInicio=${dataInicio}`;
  if (dataFim) url += `&dataFim=${dataFim}`;

  return apiClient
    .get(url, { responseType: 'blob' })
    .then((res) => res.data)
    .catch((err) => {
      console.error('❌ Erro ao exportar dados do banco:', err);
      throw err;
    });
};