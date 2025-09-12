# ✅ ChecklisTI

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-blue)
![HTML5](https://img.shields.io/badge/HTML5-orange)
![CSS3](https://img.shields.io/badge/CSS3-blueviolet)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow)


O **ChecklisTI** é uma aplicação web voltada para o **controle, acompanhamento e gestão do status de sistemas de TI** em empresas de qualquer porte. O sistema permite registrar checklists diários ou periódicos, monitorar a disponibilidade e o funcionamento de sistemas críticos, e gerar relatórios simples para tomada de decisão.

O projeto é dividido em **frontend** e **backend**, utilizando tecnologias modernas e uma arquitetura modular, o que facilita manutenção, expansão e implantação em ambientes locais ou servidores corporativos.

Principais objetivos:
 - **Organização e controle**: centraliza informações sobre sistemas e suas condições operacionais.
 - **Facilidade de uso**: interface simples, rápida e intuitiva para usuários técnicos e gestores.
 - **Segurança**: conexão segura com o banco de dados e uso de variáveis de ambiente para configuração sensível.
 - **Flexibilidade**: backend modular em Node.js + Express e frontend leve em HTML/CSS/JavaScript puro, permitindo fácil customização e integração com outros sistemas.

O ChecklisTI é ideal para equipes de TI que desejam padronizar checklists, reduzir erros manuais e gerar relatórios confiáveis sem depender de planilhas dispersas ou processos improvisados.

---

## 📂 Estrutura do Projeto

```
src/
 ├─ backend/                     # API Node.js + Express
 │   ├─ .env.example             # Exemplo de variáveis de ambiente (configurações sensíveis)
 │   ├─ db.js                    # Conexão com o banco de dados
 │   ├─ package.json             # Configurações do projeto e dependências
 │   ├─ package-lock.json        # Trava as versões exatas das dependências
 │   ├─ schema.sql               # Script SQL para criar banco e tabelas
 │   ├─ server.js                # Ponto de entrada do servidor Node.js
 │   ├─ routes/                  # Rotas da API
 │   │   ├─ agents.js            # Rotas relacionadas a agentes
 │   │   ├─ checklist.js         # Rotas relacionadas a checklists
 │   │   ├─ export.js            # Rotas para exportação de dados
 │   │   └─ systems.js           # Rotas relacionadas a sistemas
 │   └─ utils/                   # Funções auxiliares do backend
 │       └─ query.js             # Funções para consultas customizadas
 └─ frontend/                    # Interface do usuário (HTML/CSS/JS)
     ├─ assets/                  # Arquivos estáticos
     │   └─ logo.png             # Logotipo da aplicação
     ├─ index.html               # Página principal da interface
     ├─ script.js                # Scripts JavaScript da interface
     └─ style.css                # Estilos CSS da interface

```

---

## 🚀 Tecnologias Principais

- **Backend:** Node.js, Express, mssql  
- **Frontend:** HTML5, CSS3, JavaScript (VanillaJS)  
- **Banco:** SQL Server  
- **Outros:** dotenv para variáveis de ambiente  

---

## 🔧 Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada)  
- [SQL Server](https://www.microsoft.com/sql-server) configurado  
- Git para versionamento  

---

## ⚙️ Instalação do Backend

1. **Clone este repositório**:
   ```bash
   git clone https://github.com/itsmemaikon/ChecklisTI.git
   cd ChecklisTI/src/backend
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Arquivo .env**: Crie um arquivo `.env` em `src/backend` com as variáveis de ambiente (usar como exemplo o arquivo `.env.example`.  

4. **Criar banco e tabelas**: execute o script `schema.sql` no seu SQL Server (instruções detalhadas mais abaixo na seção *Banco de Dados*).

5. **Inicie o servidor backend**:
   ```bash
   npm start
   ```
   ou em modo desenvolvimento (com reinício automático se usar nodemon):
   ```bash
   npx nodemon server.js
   ```

---

## 🌐 Frontend

A pasta `src/frontend` contém a interface (HTML/CSS/JS).  
Para testar localmente:
- Abra o arquivo `index.html` no navegador  

---

## 🗄️ Banco de Dados

- Certifique-se de ter o SQL Server rodando e um banco criado com as tabelas necessárias.  
- Ajuste as variáveis do `.env` de acordo com seu ambiente.  
- O backend usa `mssql` e parâmetros preparados para segurança.

### ▶️ Como executar `schema.sql`
- Abra o SQL Server Management Studio (SSMS).  
- Conecte ao seu servidor.  
- Abra o arquivo `schema.sql`.  
- Execute o script (botão **Execute** ou tecla F5).

---

## 📝 Fluxo de Desenvolvimento

1. Clone o repositório.
2. Instale dependências no backend.
3. Configure o `.env`.
4. Execute `src/backend/schema.sql` para criar banco/tabelas.
5. Inicie o backend.
6. Abra o frontend.

---

## 🗂️ Licença

© 2025 ChecklisTI. Todos os direitos reservados.
