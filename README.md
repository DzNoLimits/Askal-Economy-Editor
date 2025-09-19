# 🎮 Askal Economy Editor - DayZ

![DayZ](https://img.shields.io/badge/DayZ-Economy%20Editor-red?style=for-the-badge&logo=steam)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)

> **Editor visual avançado para economia do DayZ com interface moderna e sistema de cores intuitivo**

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Features](#-features)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Sistema de Cores](#-sistema-de-cores)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

## 🚀 Sobre o Projeto

O **Askal Economy Editor** é uma ferramenta visual moderna para edição da economia do DayZ. Desenvolvido com React e Node.js, oferece uma interface intuitiva com sistema de cores diferenciado para facilitar a gestão de items, categorias, usage flags e configurações econômicas.

### ✨ Principais Diferenciais

- 🎨 **Sistema de cores por tipo** - Visual claro e intuitivo
- 📱 **Design responsivo** - Layout otimizado para diferentes telas
- 🌙 **Tema escuro profissional** - Interface moderna e elegante
- 🔧 **Economy Values organizados** - Subbloco dedicado com layout 4+2 colunas
- 📊 **Collections horizontais** - Melhor aproveitamento do espaço
- 🎯 **Tier "Unique"** - Suporte completo aos tiers do DayZ

## 🛠 Features

### 📦 Gestão de Items
- ✅ Visualização em tabela com busca avançada
- ✅ Edição completa de propriedades (nome, categoria, nominal, etc.)
- ✅ Sistema de flags com checkboxes visuais
- ✅ Gestão de variants com interface dedicada

### 🏷 Sistema de Categorias
- ✅ Botões **verdes** para fácil identificação
- ✅ Criação/edição/exclusão de categorias
- ✅ Filtros por categoria

### � Usage Flags
- ✅ Botões **azuis** para diferenciação visual
- ✅ Multi-seleção de usage flags
- ✅ Interface intuitiva com toggles

### 🏆 Tags do Sistema
- ✅ Botões **laranjas** para destaque visual
- ✅ Organização de tags por grupos
- ✅ Sistema de filtros avançados

### 📊 Economy Values
- ✅ **Subbloco dedicado** com layout otimizado
- ✅ **Primeira linha**: Nominal | Min | QuantMax | QuantMin (4 colunas)
- ✅ **Segunda linha**: Lifetime | Restock (2 colunas)
- ✅ **Sliders coloridos** por tipo de valor
- ✅ **Tiers 1-4 + Unique** - Suporte completo

### 🎨 Sliders Diferenciados
- 🟢 **QuantMax**: Verde (representa crescimento/máximo)
- 🟡 **QuantMin**: Amarelo (representa valor mínimo)
- 🟣 **Lifetime**: Roxo (tempo de vida do item)
- 🟠 **Restock**: Laranja (tempo de reabastecimento)

## 💻 Tecnologias

### Frontend
- **React** 18.3.1 - Interface de usuário
- **CSS3** - Estilização moderna com gradientes
- **Responsive Design** - Layout adaptativo

### Backend
- **Node.js** - Servidor da aplicação
- **Express** - Framework web
- **SQLite** - Banco de dados local
- **CORS** - Habilitado para desenvolvimento

### Ferramentas de Desenvolvimento
- **nodemon** - Auto-reload do servidor
- **VS Code** - Editor recomendado
- **Git** - Controle de versão

## 🔧 Instalação

### Pré-requisitos
- **Node.js** 16+ instalado
- **npm** ou **yarn**
- **Git** (opcional)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/DzNoLimits/Askal-Economy-Editor.git
cd Askal-Economy-Editor
```

2. **Instale as dependências do Backend**
```bash
cd backend
npm install
```

3. **Instale as dependências do Frontend**
```bash
cd ../frontend
npm install
```

4. **Inicie o Backend** (Terminal 1)
```bash
cd backend
npm start
```

5. **Inicie o Frontend** (Terminal 2)
```bash
cd frontend
npm start
```

6. **Acesse a aplicação**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📖 Como Usar

### 1️⃣ Navegação Principal
- **Collections** - Aba horizontal no topo para navegar entre coleções
- **Lista de Items** - Painel esquerdo com busca e filtros
- **Detalhes do Item** - Painel direito com todas as configurações

### 2️⃣ Editando um Item
1. Selecione um item na lista
2. Use o **Economy Values** para configurar valores econômicos
3. Configure **Category** com botões verdes
4. Defina **Usage** com botões azuis
5. Adicione **Tags** com botões laranjas
6. Ajuste sliders coloridos para cada valor

### 3️⃣ Sistema de Cores
- 🟢 **Verde**: Categorias e QuantMax
- 🔵 **Azul**: Usage flags
- 🟠 **Laranja**: Tags e Restock
- 🟡 **Amarelo**: QuantMin
- 🟣 **Roxo**: Lifetime

### 4️⃣ Economy Values Layout
```
┌─────────────────────────────────────────────────┐
│ Nominal │   Min   │ QuantMax │ QuantMin │       │
├─────────────────────────────────────────────────┤
│    Lifetime     │       Restock      │          │
└─────────────────────────────────────────────────┘
```
- ✅ API REST com Node.js
- ✅ Banco SQLite integrado

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- npm (incluído com Node.js)

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone [URL_DO_SEU_REPO]
cd askal-economy-editor
```

### 2. Instale dependências do Backend
```bash
cd backend
npm install
```

### 3. Instale dependências do Frontend
```bash
cd ../frontend
npm install
```

### 4. Inicialize o banco de dados
```bash
cd ../backend
node initDatabase.js
```

## 🚀 Como executar

### Backend (Terminal 1)
```bash
cd backend
npm start
# Servidor rodará em http://localhost:3001
```

### Frontend (Terminal 2)
```bash
cd frontend  
npm start
# Aplicação rodará em http://localhost:3000
```

## 📁 Estrutura do Projeto

```
askal-economy-editor/
├── backend/
│   ├── database.js          # Conexão SQLite
│   ├── server.js           # API Express
│   ├── initDatabase.js     # Script inicialização DB
│   └── package.json        # Dependências backend
├── frontend/
│   ├── src/
│   │   ├── App.js          # Componente principal
│   │   ├── components/     # Componentes React
│   │   └── ...
│   └── package.json        # Dependências frontend
└── README.md
```

## 🛠️ Tecnologias

- **Backend:** Node.js, Express, SQLite3, CORS
- **Frontend:** React, Axios
- **Database:** SQLite

## 📊 Endpoints da API

- `GET /categories` - Lista categorias
- `GET /items` - Lista itens
- `GET /variants` - Lista variantes
- `POST /categories` - Cria categoria
- `PUT /categories/:id` - Atualiza categoria
- `DELETE /categories/:id` - Remove categoria

## 📁 Estrutura do Projeto

```
Askal-Economy-Editor/
├── 📁 backend/                     # Servidor Node.js
│   ├── 📄 server.js               # Servidor principal
│   ├── 📄 database.js             # Configuração SQLite
│   ├── 📄 initDatabase.js         # Inicialização do BD
│   ├── 📄 package.json            # Dependências backend
│   └── 📄 database.db             # Banco SQLite
│
├── 📁 frontend/                    # Aplicação React
│   ├── 📁 public/
│   │   └── 📄 index.html          # HTML base
│   ├── 📁 src/
│   │   ├── 📄 App.js              # Componente principal
│   │   ├── 📄 App.css             # Estilos globais
│   │   └── 📁 components/         # Componentes React
│   │       ├── 📄 ItemDetailsV05_complete.js  # Editor principal
│   │       ├── 📄 ItemDetailsV05.css          # Estilos do editor
│   │       ├── 📄 CollectionsView_fixed.js    # Collections horizontais
│   │       ├── 📄 CollectionsViewCompact.css  # Estilos collections
│   │       ├── 📄 CategoryList.js             # Lista categorias
│   │       ├── 📄 ItemList.js                 # Lista items
│   │       └── 📄 VariantList.js              # Lista variants
│   └── 📄 package.json            # Dependências frontend
│
├── 📄 README.md                   # Esta documentação
├── 📄 .gitignore                  # Arquivos ignorados
└── 📄 Askal Economy Editor.code-workspace  # Workspace VS Code
```

## 🎨 Sistema de Cores

### Botões por Funcionalidade
| Tipo | Cor | Propósito | Visual |
|------|-----|-----------|---------|
| **Category** | 🟢 Verde | Identificação de categoria | `#10b981` |
| **Usage** | 🔵 Azul | Flags de uso | `#3b82f6` |
| **Tags** | 🟠 Laranja | Sistema de tags | `#f97316` |

### Sliders por Valor
| Parâmetro | Cor | Significado | Código |
|-----------|-----|-------------|---------|
| **QuantMax** | 🟢 Verde | Quantidade máxima | `#10b981` |
| **QuantMin** | 🟡 Amarelo | Quantidade mínima | `#f59e0b` |
| **Lifetime** | 🟣 Roxo | Tempo de vida | `#8b5cf6` |
| **Restock** | 🟠 Laranja | Reabastecimento | `#f97316` |

## 🚀 Scripts Disponíveis

### Backend
```bash
npm start          # Inicia servidor com nodemon
npm run dev        # Modo desenvolvimento
```

### Frontend
```bash
npm start          # Inicia React dev server
npm run build      # Build para produção
npm test           # Executa testes
```

## 📋 Roadmap

- [ ] **Import/Export** de arquivos XML do DayZ
- [ ] **Backup automático** do banco de dados
- [ ] **Histórico de alterações** com undo/redo
- [ ] **Validação avançada** de valores econômicos
- [ ] **Temas personalizáveis** (claro/escuro/custom)
- [ ] **Relatórios** de economia em PDF
- [ ] **API REST completa** para integração
- [ ] **Modo offline** completo

## 📊 Estatísticas do Projeto

- **Linhas de código**: ~2.500+
- **Componentes React**: 6 principais
- **Endpoints API**: 12+
- **Temas de cores**: 5 categorias
- **Responsividade**: Mobile-first
- **Performance**: Otimizado para 1000+ items

## 🏷 Versioning

Utilizamos [SemVer](http://semver.org/) para versionamento.

**Versão Atual**: 1.0.0
- ✅ Interface completa com sistema de cores
- ✅ Economy Values em subbloco
- ✅ Collections horizontais
- ✅ Tier "Unique" implementado
- ✅ Design responsivo e tema escuro

## 👥 Autores

- **DzNoLimits** - *Desenvolvimento inicial* - [GitHub](https://github.com/DzNoLimits)

## 🙏 Agradecimentos

- Comunidade DayZ pela inspiração
- React team pelo framework incrível
- Contributors que ajudaram no projeto
- Testers que forneceram feedback valioso

---

### 🔥 Features em Destaque

> **"O primeiro editor de economia DayZ com sistema de cores intuitivo e layout responsivo"**

- 🎨 **Visual Design**: Interface moderna com tema escuro profissional
- 🚀 **Performance**: Carregamento rápido mesmo com milhares de items
- 💡 **UX/UI**: Sistema de cores que facilita identificação instantânea
- 📱 **Responsivo**: Funciona perfeitamente em qualquer resolução
- 🔧 **Flexível**: Adaptável para diferentes configurações de servidor

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### 🐛 Reportando Bugs
- Use as Issues do GitHub
- Descreva o problema detalhadamente
- Inclua screenshots se possível
- Mencione o sistema operacional e versão do Node.js

### 💡 Sugestões de Melhorias
- Abra uma Issue com label "enhancement"
- Descreva a funcionalidade desejada
- Explique o caso de uso

---

**Feito com ❤️ para a comunidade DayZ**

*Para suporte técnico, abra um tíquet no nosso dicord.*

<iframe src="https://discord.com/widget?id=1381248604806578262&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.