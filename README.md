# 🏥 ClinicaSys

![Status](https://img.shields.io/badge/STATUS-EM_DESENVOLVIMENTO-yellow?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

> Sistema web moderno para gestão de clínicas, com interface "Clean Tech", agenda interativa e controle de acesso seguro.

---

## 🚀 Sobre o Projeto

O **ClinicaSys** é um sistema robusto focado na experiência do usuário (UX/UI) e segurança. Além do fluxo rigoroso de aprovação de contas, a versão atual conta com um **Dashboard Profissional** e uma identidade visual moderna projetada para transmitir limpeza e tecnologia.

### ✨ Novas Funcionalidades (v2.0)

* **🎨 Interface Clean Tech:** Design moderno com fundo animado ("Aurora Background") e elementos visuais focados em clareza.
* **📅 Agenda Inteligente:** Calendário interativo completo (baseado em `date-fns`) com navegação entre meses e visualização rápida de eventos.
* **📊 Dashboard Dinâmico:**
    * Resumo financeiro colorido e ações rápidas.
    * **Modal de Agenda:** Visualize a agenda completa sem sair da tela inicial.
    * **Saudação Personalizada:** Identifica o usuário logado (ex: "Olá, João!") e seu cargo automaticamente.
* **🔐 Layout Administrativo:** Estrutura de "App Shell" com Menu Lateral (Sidebar) e Topo (Header) fixos.

---

### 🛠️ Tecnologias

* **Frontend:** Next.js (App Router), React, Tailwind CSS.
* **UI/UX:** Lucide Icons, Animações CSS (Blobs), Gradientes Mesh.
* **Utils:** `date-fns` (Manipulação de datas), `clsx` (Classes condicionais).
* **Backend:** Next.js API Routes (Serverless).
* **Banco de Dados:** PostgreSQL (Hospedado no Render).
* **ORM:** Prisma (v5).
* **Autenticação:** Senhas criptografadas (Bcrypt) + Sessão Local + Controle de Primeiro Acesso.

---

## ⚙️ Pré-requisitos

Antes de começar, garanta que você possui instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 18 ou superior)
* [Git](https://git-scm.com/)

---

## 🔧 Instalação e Configuração

Siga o passo a passo abaixo para rodar o projeto localmente:

### 1. Clonar o repositório
```bash
git clone https://github.com/SiteWebClinica/SiteClinica.git
cd SiteClinica
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente (.env)
Crie um arquivo chamado `.env` na raiz do projeto.
Copie e cole as chaves abaixo, preenchendo com seus dados:

```env
# --- BANCO DE DADOS (PostgreSQL) ---
# Adicione ?sslmode=require ao final para conexões seguras (Render/Neon)
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"

# --- EMAIL (Gmail SMTP) ---
# Utilize uma "Senha de App" do Google.
EMAIL_USER="seu.email@gmail.com"
EMAIL_PASS="sua-senha-de-app-aqui"
```

### 4. Configurar o Banco de Dados
Sincronize o esquema do projeto (Prisma) com o seu banco de dados na nuvem:

```bash
# Gera os arquivos de tipagem do TypeScript
npx prisma generate

# Envia a estrutura das tabelas para o banco de dados
npx prisma db push
```

---

## ▶️ Rodando a Aplicação

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

**Dica:** Para testar o acesso via celular na mesma rede Wi-Fi, rode o comando:
```bash
npm run dev -- -H 0.0.0.0
```

📍 O sistema estará acessível em: **http://localhost:3000** (ou no IP da sua máquina).

---

## 🗺️ Guia de Telas

### 🔐 Autenticação e Segurança
* **/login:** Acesso ao sistema. Verifica credenciais e redireciona para troca de senha se for o primeiro acesso.
* **/cadastro:** Solicitação de acesso (cria usuário com status `PENDING`).
* **/recuperar:** Fluxo seguro de "Esqueci minha senha" via e-mail (bloqueia usuários pendentes).

### 🖥️ Painel Administrativo (Área Logada)
* **/dashboard:** Visão geral da clínica.
    * *Header:* Busca global, notificações e perfil do usuário (com opção de Logout).
    * *Financeiro:* Cards de Contas a Receber (Verde), A Pagar (Vermelho) e Vencidos (Amarelo).
    * *Widgets:* Agenda do dia e Aniversariantes.
* **/agenda:** Calendário full-screen para gestão completa de consultas e exames.

---

## 🎨 Identidade Visual (Paleta)

O sistema utiliza uma combinação de cores psicológicas para aliar saúde e tecnologia:

* **Teal (Ciano/Verde-Água):** Representa saúde, higiene e tranquilidade.
* **Indigo (Roxo-Azulado):** Representa tecnologia, profundidade e confiança.
* **Slate (Cinza-Azulado):** Usado em textos e fundos para reduzir o cansaço visual.

---

## 🗄️ Utilitários

### Prisma Studio
Para visualizar o banco de dados via interface gráfica:

```bash
npx prisma studio
```
_A interface abrirá em: http://localhost:5555_

---

## 📝 Licença

Este projeto foi desenvolvido para fins de estudo e gestão interna da **SiteWebClinica**.