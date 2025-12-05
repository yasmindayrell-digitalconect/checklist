# 📌 Projeto Interno — Painel de Clientes e Mensagens

Este é um projeto **privado** desenvolvido com **Next.js + Supabase**, utilizado para gestão de clientes, contatos, mensagens e envios automáticos.

Este README foi criado para orientar **futuros desenvolvedores** que venham a trabalhar no projeto.

---

## 🚀 Tecnologias Utilizadas

- **Next.js (App Router)**
- **React**
- **TypeScript**
- **TailwindCSS**
- **Supabase** (PostgreSQL)
- **date-fns** para manipulação de datas

---

### Responsabilidades

- **app/** — páginas e rotas (App Router)
- **components/** — UI reutilizável (Filtros, tabelas, cards, histórico, mensagens)
- **lib/** — serviços (ex.: client do Supabase)
- **types/** — tipagens da aplicação
- **utils/** — funções auxiliares (regex, formatação, datas, helpers)

---

## 🗄 Banco de Dados (Supabase)

O projeto utiliza Postgres com as tabelas principais:

### **clientes**
Armazena informações da empresa.

Campos importantes:
- `id_cliente`
- `Cliente`
- `Limite`
- `data_ultima_compra`
- `ultima_interacao`
- `id_vendedor`

---

### **contatos_cliente**
Um cliente pode ter vários contatos.

- `id_contato`
- `id_cliente` (FK → clientes)
- `nome_contato`
- `telefone`
- `funcao`
- `principal` (boolean)

---

### **vendedores**
Lista de vendedores internos.

- `id`
- `nome_vendedor`

---

### **mensagens**
Mensagens enviáveis via painel.

- `id_mensagem`
- `titulo`
- `categoria`
- `texto`
- `status` (ex: "approved", "pending", "rejected")

---

### **envios**
Histórico de mensagens enviadas.

- `id`
- `id_contato` (FK → contatos_cliente)
- `id_mensagem` (FK → mensagens)
- `status_entrega`
- `data_envio`

---

#como rodar o projeto

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.