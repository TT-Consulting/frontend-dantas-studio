# Dantas Studio - Front-End (Versao 1.0)

Desenvolvido por TT Consulting.

Este repositorio contem a interface web (UI/UX) do ecossistema Dantas Studio, focada em agendamento de servicos de estetica e gestao administrativa do salao.

## Links Rapidos

- Organizacao: https://github.com/TT-Consulting
- Aplicacao em producao: https://annikadantas.agendaspro.app.br/
- API Backend (AWS): http://18.215.117.254:8080

## Sobre o Projeto

O front-end do Dantas Studio conecta o cliente final ao estabelecimento de forma simples e rapida, alem de oferecer um painel administrativo para gerir agenda, clientes e financeiro.

### Principais Funcionalidades

- Agendamento multi-servicos com selecao de datas e horarios.
- Suporte a idiomas via LanguageContext.
- Painel administrativo com modulos de clientes, agenda, financeiro e configuracoes.
- Interface responsiva para mobile e desktop.
- Integracao REST com backend via Axios.

## Tecnologias Utilizadas

- React 18
- Vite
- Tailwind CSS v4
- Axios
- Radix UI e Lucide React
- React Hook Form

## Estrutura de Pastas (Atual)

```text
.
├── arquivados/                    # Arquivos legados/backup
├── build/                         # Saida de build de producao (Vite outDir)
├── public/                        # Arquivos publicos estaticos
├── src/
│   ├── api/                       # Camada de integracao HTTP (axios + endpoints)
│   │   ├── axiosConfig.js
│   │   ├── bookings.js
│   │   ├── clients.js
│   │   ├── dashboard.js
│   │   ├── finance.js
│   │   ├── index.js
│   │   ├── inventory.js
│   │   ├── notes.js
│   │   ├── services.js
│   │   └── settings.js
│   ├── app/
│   │   ├── App.jsx                # Componente principal da aplicacao
│   │   └── components/            # Telas e componentes de interface
│   │       ├── settings/          # Subtelas de configuracao
│   │       ├── ui/                # Biblioteca de componentes base
│   │       └── figma/             # Componentes de suporte/importados
│   ├── assets/                    # Imagens e midias
│   ├── constants/                 # Constantes globais
│   ├── context/                   # Contextos React (ex.: LanguageContext)
│   ├── styles/                    # CSS global, tema e fontes
│   └── main.jsx                   # Entry point do React
├── .env                           # Variaveis de ambiente locais
├── eslint.config.js               # Regras de lint
├── index.html                     # Template HTML base
├── package.json                   # Dependencias e scripts
├── vite.config.js                 # Configuracao do Vite
└── README.md
```

## Padroes de Codigo e Commits

### React e JavaScript

- PascalCase para componentes React (ex.: BookingScreen.jsx).
- camelCase para funcoes, hooks e variaveis.
- Context API para estados globais (ex.: idioma).

### Conventional Commits

- feat: nova funcionalidade
- fix: correcao de bug
- style: ajuste visual/CSS sem alterar logica
- refactor: melhoria estrutural sem mudar comportamento
- docs: atualizacao de documentacao

Exemplo:

```text
feat(booking): add multi-service selection in client flow
```

## Configuracao e Execucao Local

### Pre-requisitos

- Node.js 18+
- npm (ou yarn)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

Crie o arquivo .env na raiz do projeto:

```env
VITE_API_BASE_URL=http://18.215.117.254:8080
VITE_API_WITH_CREDENTIALS=false
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Por padrao, o Vite esta configurado para subir em http://localhost:3000 e abrir o navegador automaticamente.

## Build de Producao

```bash
npm run build
```

O output sera gerado na pasta build/ (conforme configuracao outDir no vite.config.js).

Para deploy via FTP/WinSCP, envie o conteudo interno da pasta build/ para a raiz da hospedagem.

## Scripts Disponiveis

- npm run dev: inicia o servidor de desenvolvimento.
- npm run build: gera a build de producao em build/.
- npm run preview: serve localmente a build gerada.
- npm run lint: executa ESLint no projeto.

## Licenca

© 2026 TT Consulting - Todos os direitos reservados.