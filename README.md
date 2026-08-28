# Parrilla 170 • Sistema de Pedidos V1

Projeto responsivo para:

- Notebook / Caixa: painel em colunas (novo → preparo → pronto → entregue)
- Garçom: lançamento rápido pelo celular
- Cliente: pedido direto via QR Code / link da mesa

## Rodar localmente

```bash
npm install
npm run dev
```

## Deploy no Vercel

1. Suba a pasta no GitHub.
2. Importe o repositório no Vercel.
3. Framework: Vite.
4. Build command: `npm run build`.
5. Output: `dist`.

## Firebase (sincronização em tempo real)

Sem Firebase, a V1 abre em **modo demonstração local** usando localStorage.

Para sincronizar notebook, celular do garçom e cliente, crie um projeto Firebase e um banco Firestore. Depois adicione no Vercel as variáveis do arquivo `.env.example`.

Coleção usada: `orders`.

### Regras TEMPORÁRIAS apenas para teste

Durante o primeiro teste fechado, você pode usar regras de desenvolvimento. Antes de colocar em produção, configure autenticação e regras seguras.

## Links

- Notebook / Caixa: `https://SEU-DOMINIO/?mode=admin`
- Garçom: `https://SEU-DOMINIO/?mode=garcom`
- Cliente: `https://SEU-DOMINIO/?mode=cliente`
- QR da mesa 12: `https://SEU-DOMINIO/?mode=cliente&mesa=12`

Na próxima versão podem entrar: login/PIN, bebidas, impressão cozinha, fechamento de conta, meios de pagamento e NFC-e.
