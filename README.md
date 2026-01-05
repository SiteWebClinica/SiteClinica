# 🏥 ClinicaSys

![Status](https://img.shields.io/badge/STATUS-EM_DESENVOLVIMENTO-yellow?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=for-the-badge&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

> Sistema web moderno para gestão de clínicas, focado em segurança, controle de acesso e fluxo de aprovação administrativa.

---

## 🚀 Sobre o Projeto

O **ClinicaSys** foi desenvolvido para resolver o problema de gestão de acessos em ambientes clínicos. Diferente de sistemas comuns, ele implementa um fluxo de **"Solicitação de Acesso"**, onde o usuário se cadastra, mas só acessa o sistema após aprovação e geração de credenciais pelo administrador via e-mail.

### 🛠️ Tecnologias

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons.
* **Backend:** Next.js API Routes (Serverless).
* **Banco de Dados:** PostgreSQL (Hospedado no Render).
* **ORM:** Prisma (v5).
* **Autenticação:** Senhas criptografadas (Bcrypt) + Sessão Local.
* **E-mail:** Nodemailer (Gmail SMTP).
* **Validação:** Zod + React Hook Form.

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
git clone [https://github.com/SiteWebClinica/SiteClinica.git](https://github.com/SiteWebClinica/SiteClinica.git)
cd SiteClinica
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente (.env)
Crie um arquivo chamado `.env` na raiz do projeto (este arquivo não é versionado por segurança).
Copie e cole as chaves abaixo, preenchendo com seus dados:

```env
# --- BANCO DE DADOS (PostgreSQL) ---
# Adicione ?sslmode=require ao final para conexões seguras (Render/Neon)
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"

# --- EMAIL (Gmail SMTP) ---
# Utilize uma "Senha de App" do Google, não sua senha pessoal de login.
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

📍 O sistema estará acessível em: **http://localhost:3000**

---

## 🗺️ Fluxo de Uso (Funcionalidades)

### 1️⃣ Cadastro (Solicitação de Acesso)
1.  O usuário acessa a rota `/cadastro`.
2.  Preenche **Nome Completo** e **E-mail Corporativo**.
3.  O sistema cria o registro com status `PENDING` (Pendente).
4.  🔔 **Alerta:** O Administrador recebe um e-mail imediato avisando da nova solicitação.

### 2️⃣ Aprovação (Painel Administrativo)
1.  O Admin acessa `/usuarios` (ou usa o atalho no Dashboard).
2.  Visualiza a lista de usuários pendentes.
3.  Clica em **Aprovar** e define uma **Senha Temporária**.
4.  📧 **Ação:** O sistema ativa o usuário (`ACTIVE`), criptografa a senha e envia um e-mail de boas-vindas para o usuário contendo as credenciais.

### 3️⃣ Acesso e Dashboard
* **Login:** O sistema valida e-mail, senha e se o status é `ACTIVE`.
* **Dashboard Admin:** Visualiza cartões de gestão e o alerta vermelho "Aprovar Usuários".
* **Dashboard Paciente:** Visualiza apenas seus dados pessoais e opções de segurança (Troca de senha).

---

## 🗄️ Utilitários do Banco de Dados

### Prisma Studio
Para visualizar, editar e deletar registros do banco de dados através de uma interface gráfica no navegador:

```bash
npx prisma studio
```
_A interface abrirá em: http://localhost:5555_

---

## 📝 Licença

Este projeto foi desenvolvido para fins de estudo e gestão interna da **SiteWebClinica**.