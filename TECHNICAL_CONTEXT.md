# 🔧 Contexto Técnico - Askal Economy Editor

> **Arquivo de contexto para desenvolvedores e manutenção técnica**

## 📋 Resumo das Implementações

Este documento contém o contexto técnico detalhado das implementações realizadas no projeto, decisões de design e informações específicas para continuidade do desenvolvimento.

---

## 🎨 Sistema de Cores Implementado

### Arquivos Principais Afetados:
- `frontend/src/components/ItemDetailsV05.css` (linhas 380, 427, 571)
- `frontend/src/components/ItemDetailsV05_complete.js`

### Mapeamento de Cores por Componente:

#### Botões por Funcionalidade:
```css
/* Category Buttons - Verde */
.category-btn {
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
  background: linear-gradient(135deg, #10b981, #059669); /* when active */
}

/* Usage Buttons - Azul */  
.toggle-btn {
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8); /* when active */
}

/* Tags Buttons - Laranja */
.tag-btn {
  border-color: rgba(251, 146, 60, 0.3);
  color: #fdba74;
  background: linear-gradient(135deg, #f97316, #ea580c); /* when active */
}
```

#### Sliders por Parâmetro:
```css
/* QuantMax - Verde (crescimento) */
.quantmax::-webkit-slider-thumb {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

/* QuantMin - Amarelo (mínimo) */
.quantmin::-webkit-slider-thumb {
  background: linear-gradient(135deg, #f69e07ff, #d97706);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
}

/* Lifetime - Roxo (tempo de vida) */
.lifetime-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 2px 6px rgba(139, 92, 246, 0.4);
}

/* Restock - Laranja (reabastecimento) */
.restock-slider::-webkit-slider-thumb {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.4);
}
```

---

## 🏗 Layout Economy Values

### Implementação do Subbloco (ItemDetailsV05_complete.js):

```jsx
{/* Economy Values Subblock */}
<div className="economy-values-block">
  <h3>Economy Values</h3>
  
  {/* Primeira linha: 4 colunas */}
  <div className="economy-grid-4">
    <div className="input-group">
      <label>Nominal:</label>
      <input type="number" value={item.nominal || 0} />
    </div>
    <div className="input-group">
      <label>Min:</label>
      <input type="number" value={item.min || 0} />
    </div>
    <div className="input-group">
      <label>QuantMax:</label>
      <input type="range" className="quantity-slider quantmax" />
    </div>
    <div className="input-group">
      <label>QuantMin:</label>
      <input type="range" className="quantity-slider quantmin" />
    </div>
  </div>

  {/* Segunda linha: 2 colunas */}
  <div className="economy-grid-2">
    <div className="input-group">
      <label>Lifetime:</label>
      <input type="range" className="lifetime-slider" />
    </div>
    <div className="input-group">
      <label>Restock:</label>
      <input type="range" className="restock-slider" />
    </div>
  </div>
</div>
```

### CSS Grid System:
```css
.economy-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.economy-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .economy-grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .economy-grid-4,
  .economy-grid-2 { grid-template-columns: 1fr; }
}
```

---

## 🎯 Tier System

### Implementação do Tier "Unique":

**Arquivo**: `ItemDetailsV05_complete.js`
**Linha aproximada**: ~200-220

```jsx
const tierOptions = [1, 2, 3, 4, 'Unique'];

// No JSX:
<div className="tier-buttons">
  {tierOptions.map(tier => (
    <button
      key={tier}
      className={`tier-btn ${item.tier === tier ? 'active' : ''}`}
      onClick={() => handleTierChange(tier)}
    >
      Tier {tier}
    </button>
  ))}
</div>
```

---

## 📐 Collections Layout Horizontal

### Arquivo Principal: `CollectionsView_fixed.js`

```jsx
// Layout horizontal implementado com:
<div className="collections-horizontal">
  <div className="collections-tabs">
    {collections.map(collection => (
      <button
        key={collection.id}
        className={`collection-tab ${activeCollection === collection.id ? 'active' : ''}`}
        onClick={() => setActiveCollection(collection.id)}
      >
        {collection.name}
      </button>
    ))}
  </div>
</div>
```

### CSS Correspondente: `CollectionsViewCompact.css`
```css
.collections-horizontal {
  width: 100%;
  border-bottom: 2px solid rgba(148, 163, 184, 0.2);
  margin-bottom: 1rem;
}

.collections-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.collection-tab {
  padding: 0.5rem 1rem;
  border-radius: 8px 8px 0 0;
  white-space: nowrap;
  min-width: fit-content;
}
```

---

## 🗂 Arquivos Finais Ativos

### Frontend Components (APENAS estes estão ativos):

```
frontend/src/components/
├── ItemDetailsV05_complete.js  # ✅ Editor principal com Economy Values
├── ItemDetailsV05.css          # ✅ Estilos com sistema de cores
├── CollectionsView_fixed.js    # ✅ Collections horizontais
├── CollectionsViewCompact.css  # ✅ Estilos compactos
├── CategoryList.js             # ✅ Lista de categorias
├── ItemList.js                 # ✅ Lista de itens  
└── VariantList.js              # ✅ Lista de variantes
```

### Backend (APENAS estes estão ativos):
```
backend/
├── server.js         # ✅ Servidor principal (porta 3001)
├── database.js       # ✅ Configuração SQLite
├── initDatabase.js   # ✅ Inicialização do banco
├── package.json      # ✅ Dependências Node.js
└── database.db       # ✅ Banco SQLite
```

---

## 🔍 Pontos de Atenção para Desenvolvimento

### 1. **Dependências de CSS:**
- `ItemDetailsV05.css` é crítico - contém todo o sistema de cores
- Classes `.toggle-btn`, `.category-btn`, `.tag-btn` são diferenciadas por cores
- Sliders usam classes específicas: `.quantmax`, `.quantmin`, `.lifetime-slider`, `.restock-slider`

### 2. **Estado dos Componentes:**
- `ItemDetailsV05_complete.js` é o componente principal de edição
- Integração com `CollectionsView_fixed.js` para layout horizontal
- Estado de tier inclui string `'Unique'` junto com números 1-4

### 3. **API Integration:**
- Backend rodando na porta 3001
- Frontend na porta 3000
- CORS habilitado para desenvolvimento
- Endpoints principais: `/api/items`, `/api/categories`, `/api/collections`

### 4. **Responsividade:**
- Layout 4 colunas → 2 colunas → 1 coluna
- Breakpoints: 1200px e 768px
- Collections com scroll horizontal em telas pequenas

---

## 🎨 Paleta de Cores Técnica

```javascript
const colorPalette = {
  // Cores principais
  category: '#10b981',    // Verde esmeralda
  usage: '#3b82f6',       // Azul royal
  tags: '#f97316',        // Laranja vibrante
  
  // Sliders específicos  
  quantmax: '#10b981',    // Verde (crescimento)
  quantmin: '#f59e0b',    // Amarelo dourado (alerta)
  lifetime: '#8b5cf6',    // Roxo (tempo)
  restock: '#f97316',     // Laranja (ação)
  
  // Background e estrutura
  background: '#0f172a',  // Azul escuro profundo
  surface: 'rgba(15, 23, 42, 0.9)', // Superfícies
  border: 'rgba(148, 163, 184, 0.3)', // Bordas padrão
};
```

---

## 🚀 Scripts de Execução

### Para Desenvolvimento:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```

### Para Produção:
```bash
# Use o script automatizado
./start.bat
```

---

## 📝 Notas de Implementação

### Decisões de Design:
1. **Economy Values em subbloco** - Para organizar melhor os parâmetros econômicos
2. **Sistema de cores por funcionalidade** - Para UX intuitiva
3. **Layout horizontal para collections** - Para economizar espaço vertical
4. **Tier "Unique"** - Para compatibilidade completa com DayZ
5. **Tema escuro** - Para reduzir fadiga visual em uso prolongado

### Performance:
- CSS com `backdrop-filter` para efeitos modernos
- Transitions suaves (0.3s cubic-bezier)
- Grid responsivo para diferentes resoluções
- Otimização para 1000+ itens

### Compatibilidade:
- React 18.3.1+
- Node.js 16+
- Navegadores modernos (Chrome, Firefox, Edge)
- Responsivo mobile-first

---

## 🔄 Comandos de Contexto para IA

**Para retomar desenvolvimento, use este prompt:**

```
Estou trabalhando no Askal Economy Editor - um editor de economia do DayZ com React + Node.js. 

CONTEXTO ATUAL:
- Sistema de cores implementado: Category (verde), Usage (azul), Tags (laranja)
- Sliders coloridos: QuantMax (verde), QuantMin (amarelo), Lifetime (roxo), Restock (laranja)  
- Economy Values em subbloco com layout 4+2 colunas
- Collections horizontais no topo
- Tier "Unique" adicionado aos tiers 1-4
- Arquivos limpos - apenas versões V05 ativas
- README.md completo criado
- Theme escuro profissional

ARQUIVOS PRINCIPAIS:
- frontend/src/components/ItemDetailsV05_complete.js (editor principal)
- frontend/src/components/ItemDetailsV05.css (sistema de cores)
- frontend/src/components/CollectionsView_fixed.js (layout horizontal)

ESTRUTURA:
- Backend: server.js, database.js, initDatabase.js (porta 3001)
- Frontend: React app (porta 3000)
- Banco: SQLite local

O projeto está funcional e completo. Preciso de [DESCREVA SUA NECESSIDADE].
```

---

**Este arquivo deve ser usado junto com o README.md para contexto completo do projeto.**