# Parrilla 170 — QZ Tray + Auto Print

## O que mudou
- QZ Tray assinado via funções serverless do Vercel.
- Chave privada nunca vai para o navegador ou GitHub.
- Impressão automática roda globalmente enquanto o site estiver aberto no notebook e o QZ Tray estiver rodando.
- Controle por setor (cozinha/bar/caixa) com prevenção de impressão duplicada por pedido/setor.
- Reimpressão manual continua disponível.

## Variáveis adicionais no Vercel
Crie em Settings > Environment Variables (Production, Preview e Development):
- QZ_CERTIFICATE = conteúdo completo de `digital-certificate.txt`
- QZ_PRIVATE_KEY = conteúdo completo de `private-key.pem`

Alternativamente, use as versões Base64:
- QZ_CERTIFICATE_B64
- QZ_PRIVATE_KEY_B64

Nunca coloque `private-key.pem` no GitHub.

## Depois do deploy
1. Feche/reabra ou atualize o site.
2. Deixe o QZ Tray aberto.
3. Abra Impressoras > Atualizar.
4. O status deve ficar `QZ Tray conectado • assinatura confiável ativa`.
5. Na primeira autorização, marque `Remember this decision` e clique `Allow`.
6. A partir daí, pedidos novos imprimem automaticamente conforme os checkboxes e impressoras salvas.
