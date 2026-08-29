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


## V1.2 - Impressão QZ Tray
- No modo Notebook / Caixa, use **Impressoras** para conectar o QZ Tray e escolher Cozinha, Bar e Caixa.
- A configuração fica salva localmente no navegador do notebook do caixa.
- Pedidos novos podem imprimir automaticamente por setor.
- O botão de impressora de cada pedido permite reimpressão manual.
- **Fechamento** gera o resumo do dia e imprime na impressora configurada como Caixa.
- Os produtos atuais do cardápio estão cadastrados como setor **cozinha**. Quando bebidas forem adicionadas, cadastre-as com `sector: 'bar'`.
- Em ambiente sem QZ Tray, a reimpressão manual e o fechamento usam a caixa de diálogo de impressão do navegador como fallback.
