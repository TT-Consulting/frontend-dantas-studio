import React, { useEffect, useState } from 'react';
import { listarServicos } from '../../api';

const ListaServicosMVP = () => {
  const [servicos, setServicos] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarServicos()
      .then((res) => {
        console.log('Dados recebidos:', res.data);
        setServicos(res.data || []);
      })
      .catch((err) => {
        console.error('Erro na integração:', err);
        setErro('Não foi possível carregar os serviços. Verifique o Back-end.');
      });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Serviços do Dantas Studio</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <ul>
        {servicos.map((s) => (
          <li key={s.idServico}>
            <strong>{s.nomeServico}</strong> - R$ {s.precoBase} ({s.duracaoMinutos} min)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaServicosMVP;
