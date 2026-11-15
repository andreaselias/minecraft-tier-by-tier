# ⛏ Tier by Tier — Minecraft Bedrock Journey

A web app responsiva para dar uma direção à sua aventura de Minecraft Survival: **5 eras, objetivos principais e opcionais, roleta de desafios e Atlas de coordenadas**. Funciona no desktop e no celular, com interface em português.

> Projeto independente, inspirado na ideia comunitária "Tier by Tier". Não é oficial nem afiliado à Mojang/Microsoft.

## Funcionalidades

- **Cinco eras**: Sobrevivência → Indústria → Expansão → Conquista → Legado.
- **Progressão manual**: marque as missões concluídas no próprio mundo; as missões não relacionadas a fazendas que forem obrigatórias devem estar completas, além de pelo menos 50% de todas as fazendas da era (arredondando para cima).
- **Dois modos**: **Livre**, para registrar missões de qualquer era, e **Rigoroso**, que bloqueia a marcação de objetivos de eras posteriores até cumprir todos os requisitos de avanço nas anteriores.
- **Desbloqueios**: listas de equipamentos, estruturas e mecânicas recomendadas por era.
- **Roleta**: 10 desafios não destrutivos e opcionais, com histórico.
- **Atlas**: adicione pontos com dimensão, coordenadas X/Y/Z, tipo, notas e visualização esquemática relativa X/Z. Não é um mapa topográfico e não lê a seed.
- **PWA**: instalação na tela inicial, com suporte offline após os recursos serem armazenados pelo navegador.
- **Backup JSON**: exportação/importação do mundo entre navegadores.

## Rodando localmente

Pré-requisitos: **Node.js 22** e **npm**.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`). Os testes de dados rodam com `npm test`. Para testar a versão pronta:

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

O workflow de implantação está em `.github/workflows/deploy.yml`. Para enviar este pacote ao repositório vazio, entre na pasta descompactada e execute `bash publish.sh` (Git autenticado e configurado). O script não força sobrescritas de histórico. Depois de enviar os arquivos:

1. Abra **Settings → Pages** no GitHub.
2. Em **Build and deployment**, selecione **GitHub Actions**.
3. Execute o workflow **Deploy GitHub Pages** (ou faça um push na branch `main`).
4. A aplicação deverá ficar em `https://andreaselias.github.io/minecraft-tier-by-tier/` **após uma implantação bem-sucedida**.

O Vite usa caminhos relativos para funcionar em subdiretórios do GitHub Pages.

### Instalar no celular

- **Android/Chrome**: abra a URL da aplicação → menu **⋮** → **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone/Safari**: abra a URL → botão **Compartilhar** → **Adicionar à Tela de Início**.

Os nomes podem variar conforme o navegador e a versão do sistema.

## Dados e sincronização

A versão inicial é **local-first**. Seu progresso é guardado em `localStorage` no navegador e **não é sincronizado automaticamente** entre dispositivos. Ele também pode ser perdido ao limpar os dados do navegador ou usar o modo privado. Use **Configurações → Exportar backup** regularmente; no outro dispositivo escolha **Importar backup**.

Não existe login, servidor, analytics, telemetria nem coleta de dados pessoais. O arquivo de backup é um JSON legível e inclui nome do mundo, seed, objetivos, histórico da roleta e coordenadas.

O app **não verifica automaticamente** missões concluídas dentro do Minecraft. O registro é manual.

## Sobre os objetivos

A progressão foi projetada para **Minecraft Bedrock** moderno. Inclui ferramentas de cobre, golens de cobre, Trial Chambers e outras funcionalidades disponíveis em lançamentos recentes. Tutorial de fazenda feito para Java pode não funcionar no Bedrock. Itens e mecânicas podem mudar com as atualizações do jogo.

## As sete regras da série

1. Conclua todos os objetivos obrigatórios da era antes de avançar.
2. Todas as construções e fazendas devem funcionar, ser caprichadas e integradas ao mundo.
3. Conclua pelo menos 50% das fazendas de cada era; **quais** fazendas construir é uma escolha sua. Arredondamos a meta para cima quando o total for ímpar.
4. Você pode coletar qualquer loot, mas o uso de certos equipamentos aguarda a era em que forem liberados.
5. Guarde lembranças, itens de marcos importantes e troféus para montar seu futuro museu.
6. O vídeo sugere mundos **Large Biomes** para imersão (opcional; a disponibilidade pode variar conforme a edição/versão do jogo).
7. O mapa da seed pode ser consultado livremente entre eras. Durante uma era, o conjunto original pede um *forfeit* da roleta; a versão do app trata isso como desafio manual opcional, sem punições destrutivas.

A classificação legada `PRINCIPAL`/`EXTRA` foi preservada para **objetivos não relacionados a fazendas**, mantendo o progresso já salvo. **Todas as fazendas contam igualmente para a meta de 50%**, independentemente de sua antiga classificação. Uma fazenda acima do mínimo conta como extra. A porcentagem de avanço considera os requisitos, não todos os itens da lista; o app permite consultar qualquer era mesmo quando bloqueada.


## Stack

React 19 · TypeScript · Vite 6 · CSS responsivo · Lucide Icons · PWA com service worker próprio.

## Próximas ideias

Sincronização opt-in entre dispositivos, múltiplos mundos, edição de objetivos personalizados, imagens de construções e integração opcional com mapas de seed.

## Fontes de referência (mecânicas oficiais)

- [The Copper Age (Bedrock)](https://www.minecraft.net/pt-br/updates/copper-age-drop)
- [Histórico de atualizações Minecraft](https://www.minecraft.net/en-us/updates/minecraft-updates-timeline-and-evolution)
- [The Garden Awakens](https://www.minecraft.net/en-us/updates/the-garden-awakens-drop)
