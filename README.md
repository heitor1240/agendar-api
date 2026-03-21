# BarberPro — Sistema de Agendamento para Barbearias

Sistema completo e pronto para revenda. Troque o banco de dados e o nome em minutos.

---

## Arquivos do projeto

| Arquivo | Descrição |
|---|---|
| `index.html` | Sistema completo (front-end + lógica) |
| `supabase-schema.sql` | Banco de dados Supabase completo |
| `README.md` | Este guia |

---

## Como configurar para um novo cliente

### 1. Criar projeto no Supabase (grátis)
1. Acesse https://supabase.com e crie uma conta
2. Clique em **New Project**
3. Dê um nome (ex: "barbearia-do-zeze")
4. Escolha região mais próxima (South America - São Paulo)
5. Anote a **URL** e a **anon key** (Settings → API)

### 2. Configurar o banco de dados
1. No Supabase, vá em **SQL Editor**
2. Cole todo o conteúdo do arquivo `supabase-schema.sql`
3. Clique em **Run**
4. Pronto! Tabelas e dados iniciais criados.

### 3. Personalizar o site (apenas 1 lugar!)
Abra o `index.html` e edite o bloco CONFIG no início do script:

```javascript
const CONFIG = {
  shopName: "Barbearia do Zezé",       // Nome da barbearia
  shopSlogan: "O melhor corte da cidade", // Slogan
  shopAddress: "Rua das Flores, 42",   // Endereço
  shopPhone: "(44) 99123-4567",        // WhatsApp/Tel
  shopHours: "Seg–Sex: 09h–19h",       // Horário
  supabaseUrl: "https://xxxx.supabase.co",  // ← sua URL
  supabaseKey: "eyJhbGci...",               // ← sua chave
};
```

**É só isso.** Todo o resto funciona automaticamente.

---

## Funcionalidades do sistema

### Para clientes
- Visualizar serviços e preços na landing page
- Escolher barbeiro e serviço preferido
- Ver horários disponíveis em tempo real
- Agendar sem precisar de cadastro (ou com conta)
- Cancelar agendamentos pelo perfil

### Para barbeiros (login)
- Dashboard com resumo do dia (agendamentos + faturamento)
- Agenda completa por data
- Marcar atendimentos como concluídos ou cancelar
- Editar seus serviços e preços individuais

### Para o dono (admin)
- Visão geral: todos agendamentos, faturamento total
- Gerenciar colaboradores (adicionar, editar, remover)
- Gerenciar catálogo de serviços
- Histórico completo de agendamentos

---

## Usuários de demonstração (antes de conectar Supabase)

| Tipo | E-mail | Descrição |
|---|---|---|
| Admin | admin@barberpro.com | Acesso total |
| Barbeiro | carlos@barberpro.com | Dashboard do barbeiro |
| Cliente | joao@email.com | Meus agendamentos |

> Qualquer senha funciona no modo demo.

---

## Como publicar o site

### Opção 1: Netlify (recomendado, grátis)
1. Crie conta em https://netlify.com
2. Arraste a pasta `barberpro` para o painel do Netlify
3. Pronto! URL gerada automaticamente.
4. Para domínio personalizado: Settings → Domain Management

### Opção 2: Vercel
1. Crie conta em https://vercel.com
2. Faça upload ou conecte via GitHub
3. Deploy automático

### Opção 3: Hospedagem tradicional (cPanel, etc.)
1. Faça upload do `index.html` para a pasta `public_html`
2. Acesse pelo domínio do cliente

---

## Estrutura do banco de dados

```
profiles          → dados de usuários (admin, barbeiros, clientes)
barbers           → cadastro dos barbeiros
services          → catálogo de serviços
barber_services   → preços personalizados por barbeiro
appointments      → todos os agendamentos
```

---

## Como trocar para um novo cliente

1. Crie novo projeto no Supabase (2 min)
2. Execute o `supabase-schema.sql` no novo projeto
3. Atualize o CONFIG no `index.html` com a nova URL e chave
4. Personalize nome, endereço, horários
5. Deploy

**Tempo total: ~10 minutos por cliente** ✓

---

## Suporte e personalização

O sistema foi construído em HTML+React puro (sem Node.js necessário).
Qualquer desenvolvedor consegue manter e customizar.

Personalizações comuns para clientes:
- Trocar logo por imagem real
- Adicionar galeria de fotos
- Integrar WhatsApp (link direto)
- Adicionar Google Maps embed
- Sistema de notificação por e-mail (Resend ou SendGrid)
