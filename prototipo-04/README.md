# Iago Cassarotti — Creative Developer

Nova versão local, separada das tentativas anteriores. Direção em `../briefing/rodada-4/REVISAO-27-RECONSTRUCAO.md`.

## Executar

Dentro desta pasta:

```text
npm.cmd run dev
npm.cmd run verify
npm.cmd run build
```

Host padrão: http://127.0.0.1:4177. Outra porta: `node scripts/servidor.cjs 4180`.

`data/projects.cjs` é a fonte de conteúdo. `scripts/gerar.cjs` gera home, nove casos, encerramento e créditos; o build também executa o gerador. Não existe página independente de catálogo. `dist/` é o build estático local, sem publicação automática.

HTML/CSS/JavaScript nativos; sem dependências de runtime. Ferramentas de revisão reaproveitam Playwright, axe e Edge instalados nesta máquina, com caminhos explícitos em `scripts/verificar.cjs`. O relatório e as capturas ficam em `validacao/`. Essas ferramentas não são distribuídas no build.

As capturas são reais, preservam proporções e têm ampliação. As fontes são locais; licenças/créditos acessíveis em `creditos.html`. Movimento reduzido respeitado, rolagem nativa e conteúdo navegável sem JavaScript. Verificação automatizada não cobre Safari/iOS físico nem substitui revisão humana de acessibilidade e aprovação de Iago.
