# Askal Economy Editor

Editor para configuração de economia do DayZ com interface web moderna.

## 🚀 Funcionalidades

- ✅ Gerenciamento de categorias de itens
- ✅ Configuração de itens do jogo
- ✅ Variantes de itens
- ✅ Interface React moderna
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

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.