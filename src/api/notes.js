import { apiClient } from './axiosConfig';

export const listarNotas = () =>
  apiClient.get('/notas').then((res) => res.data);

export const criarNota = (notaData) =>
  apiClient.post('/notas', notaData).then((res) => res.data);

export const atualizarNota = (id, notaData) =>
  apiClient.put(`/notas/${id}`, notaData).then((res) => res.data);

export const toggleFixarNota = (id) =>
  apiClient.patch(`/notas/${id}/toggle-fixar`).then((res) => res.data);

export const excluirNota = (id) =>
  apiClient.delete(`/notas/${id}`).then((res) => res.data);