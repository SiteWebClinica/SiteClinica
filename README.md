# 🏥 ClinicaSys - Sistema de Gestão para Clínicas

Sistema web moderno para gestão de clínicas, desenvolvido com **Next.js 14**, focado em segurança e controle de acesso. O sistema conta com um fluxo de cadastro com aprovação administrativa via e-mail e painéis exclusivos por nível de acesso.

## 🚀 Tecnologias Utilizadas

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons.
- **Backend:** Next.js API Routes (Serverless).
- **Banco de Dados:** PostgreSQL (Hospedado no Render).
- **ORM:** Prisma (v5).
- **Segurança:** Senhas criptografadas (Bcrypt) e Sessão local.
- **E-mail:** Nodemailer (Integração com Gmail).
- **Validação:** Zod & React Hook Form.

---

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado:
- [Node.js](https://nodejs.org/) (Versão 18 ou superior)
- [Git](https://git-scm.com/)

---

## 🔧 Instalação e Configuração

### 1. Clonar o repositório
```bash
git clone [https://github.com/SiteWebClinica/SiteClinica.git](https://github.com/SiteWebClinica/SiteClinica.git)
cd SiteClinica

### 2. Instalar dependências
Bash

npm install

### 3. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto (ele não é enviado para o GitHub por segurança). Adicione as seguintes chaves:

Snippet de código

# URL do Banco de Dados (Exemplo Render/PostgreSQL)
# Adicione ?sslmode=require no final para conexões seguras no Render
DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"

# Configurações de E-mail (Para envio de senhas e alertas ao Admin)
# Utilize uma "Senha de App" do Google, não sua senha pessoal.
EMAIL_USER="seu.email@gmail.com"
EMAIL_PASS="sua-senha-de-app-gerada"

### 4. Configurar o Banco de Dados
Sincronize o esquema do projeto com o seu banco de dados:

Bash

# Gera os arquivos de tipagem do Prisma
npx prisma generate

# Envia a estrutura das tabelas para o banco
npx prisma db push
▶️ Rodando o Projeto
Para iniciar o servidor de desenvolvimento:

Bash

npm run dev
O sistema estará acessível em: http://localhost:3000

🛠️ Funcionalidades e Fluxo de Uso
1. Cadastro de Usuário (Paciente/Funcionário)
O usuário acessa /cadastro.

Preenche Nome e E-mail.

O sistema cria o registro como PENDING (Pendente).

Alerta: O Administrador recebe um e-mail avisando da nova solicitação.

2. Aprovação (Painel Administrativo)
O Admin acessa /usuarios (ou clica no atalho no Dashboard).

Visualiza a lista de solicitações pendentes.

Clica em Aprovar e define uma senha temporária.

Ação: O sistema ativa o usuário (ACTIVE), criptografa a senha e envia um e-mail para o usuário com os dados de acesso.

3. Login e Dashboard
O usuário acessa /login.

O sistema valida e-mail, senha e se o status é ACTIVE.

Dashboard (/dashboard):

Perfil ADMIN: Visualiza o card vermelho "Aprovar Usuários".

Perfil USER: Visualiza apenas seus dados e opções de segurança.

Possui botão de Logout e atalhos rápidos.

🗄️ Comandos Úteis
Visualizar o Banco de Dados (Prisma Studio)
Para ver e editar dados diretamente pelo navegador:

Bash

npx prisma studio
Acesse em: http://localhost:5555