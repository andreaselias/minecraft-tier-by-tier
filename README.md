# Bellacera — Survival & City Builder

Planejamento de longo prazo para um mundo **Minecraft Java**, desenvolvido em React 19, TypeScript e Vite, para desktop e celular (PWA).

A cidade é inspirada na orla de Lugano e em um vale de cerejeiras. O objetivo é crescer organicamente: cada farm abastece construções com finalidade própria; explorações do Nether e do End ampliam a cidade.

**Seed de referência:** `8888892703877335828`. Coordenadas de estruturas podem mudar entre Java e Bedrock mesmo quando o terreno se parece.

## O que a versão Bellacera traz

- **Sete capítulos livres:** Fundação, Autossuficiência, Primeiro bairro, Nether, Concreto, End e Expansão.
- **Checklist:** marcos principais e opcionais, dicas e dependências recomendadas, sem travas artificiais.
- **Produção:** farms/coletas com prioridade, recursos gerados e edifícios temáticos.
- **Cidade:** catálogo de construções e status (planejado, em obra, pronto).
- **Materiais:** calculadora de concreto, por receitas de 8 pós, com areia, cascalho e corantes.
- **Atlas:** coordenadas nas três dimensões.
- **Backups JSON:** importa Tier by Tier v1, preservando Atlas e arquivando o histórico antigo.
- **PWA/offline:** instalação no navegador, sem servidor ou conta.

A roleta, a obrigação de completar uma porcentagem de farms e as restrições artificiais de equipamentos **não aparecem na nova interface**. É Survival normal, com direção.

## Executar

Pré-requisitos: Node.js 22 e npm.

```sh
npm install
npm run dev
```

Testes e build de produção:

```sh
npm test
npm run build
npm run preview
```

O GitHub Actions publica na branch main em https://andreaselias.github.io/minecraft-tier-by-tier/.

## Dados, migração e backups

A nova versão salva em `localStorage` na chave `bellacera:world:v2`. Se ainda não há dados da Bellacera, importa automaticamente de `minecraft-tier-by-tier:world:v1`. A chave antiga permanece intacta.

Objetivos com equivalência clara são reaproveitados. Os demais não são marcados como concluídos por suposição; o JSON anterior fica preservado integralmente em `legacyArchive` e vai junto no próximo backup. O Atlas de coordenadas é migrado. Use Configurações → Exportar JSON para transportar seus dados entre dispositivos.

**Importante:** a aplicação não lê o Minecraft e não sincroniza progresso entre navegadores. Faça também backups independentes do save do jogo, especialmente antes de testar novos mods e renderizadores.

## Estrutura

- `src/bellacera/data.ts` — capítulos, objetivos, farms e projetos.
- `src/bellacera/model.ts` — estado, validação e migração.
- `src/bellacera/logic.ts` — progresso e cálculo de concreto.
- `src/bellacera/App.tsx` — interface.
- `src/bellacera/styles.css` — estilos desktop/mobile.
- Módulos antigos em `src/` — preservados temporariamente para referência e regressão.

## Limites da versão

As dimensões dos projetos são sugestões, **não blueprints camada por camada**. Quantidades de materiais exatas exigirão projetos estruturais futuros. Ajuste farms e mecânicas à versão Java instalada.
