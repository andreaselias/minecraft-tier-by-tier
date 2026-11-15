import type { Category, Objective, Tier, WheelChallenge } from './types';

type Item = [title: string, description: string, tip: string, optional?: boolean];
type Groups = Partial<Record<Category, Item[]>>;

const objectives = (tier: number, groups: Groups): Objective[] =>
  (Object.entries(groups) as [Category, Item[]][]).flatMap(([category, items]) =>
    items.map(([title, description, tip, optional], index) => ({
      id: `t${tier}-${category}-${index + 1}`,
      title, description, tip, category, optional: Boolean(optional),
    }))
  );

export const CATEGORIES: { id: Category; label: string; short: string; icon: string }[] = [
  { id: 'build', label: 'Construções', short: 'Construir', icon: 'castle' },
  { id: 'farm', label: 'Fazendas', short: 'Produzir', icon: 'wheat' },
  { id: 'explore', label: 'Exploração', short: 'Explorar', icon: 'compass' },
  { id: 'boss', label: 'Chefes', short: 'Combater', icon: 'swords' },
  { id: 'achievement', label: 'Conquistas', short: 'Conquistar', icon: 'trophy' },
];

export const TIERS: Tier[] = [
  {
    id: 1, name: 'Era da Sobrevivência', subtitle: 'O primeiro abrigo', theme: 'amber',
    description: 'Comece pequeno. Conheça o terreno, proteja seu spawn e estabeleça uma rotina sustentável antes de avançar.',
    tagline: 'Toda lenda começa com um bloco.',
    equipment: 'Ferramentas de madeira, pedra e cobre. Armaduras de couro e cobre.',
    unlocks: ['Ferramentas e armadura de cobre', 'Arco, escudo, tesoura e baldes', 'Fazendas simples, agricultura e criação de animais', 'Exploração do Overworld próxima à base'],
    goals: objectives(1, {
      build: [
        ['Casa inicial', 'Construa uma casa segura, com cama, baús, bancada, fornalhas e iluminação.', 'Pode ser compacta, mas planeje telhado, profundidade e detalhes de fachada.'],
        ['Área do spawn', 'Marque o local de início com uma praça, sinalização ou pequeno monumento.', 'Use uma bússola, tochas e placas para reconhecer a região.'],
        ['Centro de trilhas', 'Ligue a casa, uma mina e as primeiras fazendas com caminhos iluminados.', 'Planeje o futuro hub de transporte, sem precisar entrar no Nether ainda.'],
        ['Mina organizada', 'Crie uma entrada de mina com escadas, proteção e espaço de armazenagem.', 'Priorize ferro e cobre, respeitando o limite de equipamentos desta era.'],
        ['Estábulo ou curral', 'Construa um abrigo com baias e decoração para seus animais.', 'Desafio de construção livre: combine cerca, portões e telhados.', true],
      ],
      farm: [
        ['Trigo', 'Plante e colha uma plantação renovável de trigo.', 'Reserve sementes e água próxima.'],
        ['Batata', 'Cultive batatas em uma horta sinalizada.', 'Aldeias são uma boa fonte inicial de batatas.'],
        ['Cenoura', 'Cultive cenouras para comida e reprodução de animais.', 'Você pode encontrar cenouras em aldeias.'],
        ['Beterraba', 'Adicione beterrabas à sua horta.', 'É um cultivo complementar, não uma fonte principal de alimento.', true],
        ['Vacas', 'Mantenha um pequeno rebanho reprodutivo.', 'Use trigo e reserve couro para livros.'],
        ['Galinhas', 'Monte um galinheiro com ovos e reprodução.', 'Evite aglomerar animais em locais apertados.'],
        ['Ovelhas', 'Crie ovelhas e obtenha lã sem precisar eliminá-las.', 'Use tesoura e trigo; varie as cores por diversão.'],
        ['Lava renovável', 'Produza lava renovável com caldeirão, estalactite pontiaguda e fonte de lava.', 'Proteja a estrutura para não incendiar a base.', true],
        ['Neve', 'Crie um ponto de coleta de bolas de neve com um golem de neve.', 'Funciona apenas em condições e biomas adequados.', true],
      ],
      explore: [
        ['Primeira expedição', 'Descubra uma aldeia, ruína ou outro ponto de interesse e anote as coordenadas.', 'Use o Atlas do app para salvar o caminho de volta.'],
        ['Mapa da vizinhança', 'Crie um mapa do seu entorno e uma área de armazenamento de exploração.', 'Uma mesa de cartografia e uma parede de mapas ajudam na orientação.', true],
      ],
      achievement: [
        ['Armadura reserva', 'Prepare um conjunto extra de armadura e ferramentas compatíveis com a era.', 'Deixe o kit perto da cama para se recuperar após morrer.'],
        ['Primeira construção caprichada', 'Finalize uma construção com telhado, texturas, detalhes e paisagismo.', 'Teste uma paleta de 3 a 5 blocos para evitar ruído visual.', true],
      ],
    }),
  },
  {
    id: 2, name: 'Era da Indústria', subtitle: 'Automação e recursos', theme: 'slate',
    description: 'A vila cresce: ferro, redstone, armazenamento e suas primeiras estruturas de produção.',
    tagline: 'Trabalhe de forma inteligente.',
    equipment: 'Libera equipamentos de ferro e ouro; ferramentas de diamante ficam para a Era 3.',
    unlocks: ['Armaduras e ferramentas de ferro e ouro', 'Redstone, funis, pistões e automação', 'Portal do Nether e acesso à fortaleza', 'Encantamentos básicos e aldeões'],
    goals: objectives(2, {
      build: [
        ['Base intermediária', 'Expanda sua casa para uma base com depósito, área de trabalho, fundição e acesso às fazendas.', 'Separe funções em edifícios conectados por caminhos.'],
        ['Armazém categorizado', 'Organize os baús por categoria, com placas, molduras ou sistema de filtragem.', 'Deixe itens mais usados perto da entrada.'],
        ['Portal do Nether', 'Construa uma sala segura para o portal, identificada e protegida.', 'No Nether, registre a posição do portal nos dois lados.'],
        ['Zoológico inicial', 'Organize recintos para espécies pacíficas diferentes.', 'É uma coleção progressiva, não precisa estar completa agora.', true],
      ],
      farm: [
        ['Madeira', 'Crie uma área de reflorestamento e coleta de madeira.', 'Vale um bosque organizado; não precisa ser uma máquina.'],
        ['Pedregulho', 'Monte um gerador seguro e renovável de pedregulho.', 'Use água e lava com isolamento adequado.'],
        ['Ferro', 'Monte uma fazenda de ferro funcional para Bedrock.', 'As regras de aldeões e camas são diferentes das do Java.'],
        ['Cana-de-açúcar', 'Produza cana-de-açúcar de forma constante para papel e livros.', 'Automatizar é um bônus, não uma obrigação.'],
        ['Bambu', 'Monte um cultivo de bambu para combustível e construção.', 'Reserve espaço vertical suficiente.'],
        ['Abóbora e melancia', 'Cultive os dois tipos e organize a colheita.', 'Use observadores e pistões se quiser automatizar.', true],
        ['Cacto', 'Crie uma fonte renovável de cacto.', 'Reserve um circuito de descarte para evitar perdas.', true],
        ['Alga', 'Cultive algas para combustível ou decoração.', 'Pode ser feito manualmente ou com pistões.', true],
        ['Mel e favos', 'Crie uma área protegida de colmeias.', 'Use fogueiras para coletar sem irritar abelhas.', true],
        ['Lã', 'Amplie a criação de ovelhas para uma pequena produção de lã.', 'Fazenda automática é uma extensão opcional.', true],
        ['Flores e corantes', 'Construa um jardim para obter corantes renováveis.', 'Farinha de osso pode ajudar a multiplicar algumas flores.', true],
        ['Cogumelos', 'Monte uma câmara ou jardim para cogumelos.', 'Respeite as condições de iluminação e crescimento.', true],
        ['Argila e lama', 'Tenha um processo renovável para obter lama e converter em argila.', 'Use garrafas de água, terra e espeleotemas.', true],
        ['Gotejamento e espeleotemas', 'Cultive estalactites e estalagmites pontiagudas.', 'São ótimas para construir fazendas de lava.', true],
        ['Musgo', 'Crie uma área de coleta de musgo e derivados.', 'Farinha de osso ajuda a espalhar musgo.', true],
        ['Lulas e lulas-brilhantes', 'Construa ou adapte uma área de coleta de bolsas de tinta.', 'Confira as condições de geração específicas de Bedrock.', true],
        ['Bagas brilhantes', 'Faça uma plantação suspensa de bagas brilhantes.', 'Bons detalhes para decoração de cavernas.', true],
        ['Picles-do-mar', 'Crie uma pequena área de reprodução de picles-do-mar.', 'Funciona com coral vivo, água e farinha de osso.', true],
        ['Treparadeiras e líquens', 'Mantenha fontes de cipós e líquen brilhante para construção.', 'Boa opção para texturizar ruínas.', true],
        ['Pesca', 'Construa um píer ou área de pesca funcional.', 'A mecânica de AFK pode variar entre edições.', true],
        ['Fundição eficiente', 'Monte uma estação de fornalhas com entrada e saída organizadas.', 'Comece simples com funis, baús e fornalhas.', true],
      ],
      explore: [
        ['Fortaleza do Nether', 'Localize uma fortaleza e construa uma rota de acesso segura.', 'Registre as coordenadas e evite perder o portal.'],
        ['Primeiras poções', 'Construa uma estação de poções e produza ao menos três efeitos úteis.', 'Verrugas do Nether e vara de blaze serão necessárias.'],
      ],
      boss: [
        ['Blazes', 'Consiga varas de blaze na fortaleza do Nether.', 'Leve resistência ao fogo se já conseguir preparar.'],
      ],
      achievement: [
        ['Armadura reserva', 'Guarde um conjunto completo de ferro com ferramentas de reposição.', 'Deixe um kit de recuperação ao lado de cada portal.'],
        ['30 tipos de criaturas', 'Registre a descoberta ou interação com 30 tipos de criaturas.', 'Use sua lista pessoal; não é necessário capturar todas.', true],
      ],
    }),
  },
  {
    id: 3, name: 'Era da Expansão', subtitle: 'Além do horizonte', theme: 'teal',
    description: 'O Nether vira uma estrada, o End deixa de ser um mistério e a pequena base se transforma em cidade.',
    tagline: 'O mundo é maior do que você imagina.',
    equipment: 'Libera equipamentos de diamante, encantamentos avançados e acesso ao End.',
    unlocks: ['Ferramentas e armaduras de diamante', 'Olhos do End, End e Dragão do End', 'Rede de portais e rotas de longa distância', 'Fazendas avançadas e experiência'],
    goals: objectives(3, {
      build: [
        ['Cidade principal', 'Construa um núcleo urbano com ruas, iluminação e pelo menos cinco edifícios de funções diferentes.', 'Planeje distritos, praça, canalização e uma paleta consistente.'],
        ['Nether Hub', 'Monte uma central de transporte no Nether conectando três destinos.', 'Use passagens protegidas e placas de coordenadas.'],
        ['Portal do End tematizado', 'Encontre a fortaleza do Overworld e construa uma entrada para a sala do portal.', 'A sala de acesso pode se tornar parte da narrativa do mundo.'],
        ['Estação de encantamentos', 'Faça uma sala de encantamentos completa e visualmente integrada à base.', 'Reserve livros, lápis-lazúli e espaço para armazenamento.'],
      ],
      farm: [
        ['Experiência', 'Construa uma fonte consistente de XP para reparar e encantar itens.', 'Pode ser uma fazenda de mobs, fornalhas ou outro sistema adequado a Bedrock.'],
        ['Verruga do Nether', 'Produza verrugas do Nether em uma sala dedicada.', 'É fundamental para poções.'],
        ['Cobre e golens de cobre', 'Organize produção ou coleta de cobre e experimente a separação com golens de cobre.', 'O golem de cobre faz parte da atualização Era do Cobre.'],
        ['Enderman e pérolas', 'Crie um método sustentável de conseguir pérolas do End.', 'Trocas com piglins também podem ajudar.'],
        ['Basalto', 'Monte uma produção renovável de basalto.', 'A combinação utiliza lava, gelo azul e solo das almas.', true],
        ['Obsidiana', 'Tenha um processo confiável de obtenção de obsidiana.', 'Você pode obtê-la com fontes de lava e água.', true],
        ['Gelo', 'Estabeleça uma estação de coleta de gelo em bioma adequado.', 'Encantamento Toque Suave ajuda.', true],
        ['Blocos e vegetação do Nether', 'Cultive fungos carmesins, distorcidos e outras plantas do Nether.', 'Use os tipos de nílio correspondentes.', true],
        ['Magma', 'Crie uma área de coleta de creme de magma ou blocos de magma.', 'Considere uma fazenda de cubos de magma.', true],
        ['Slimes', 'Prepare uma fonte recorrente de bolas de slime.', 'Observe o funcionamento das slime chunks em Bedrock.', true],
        ['Guardião', 'Planeje uma fazenda de recursos de monumento oceânico.', 'É uma construção avançada e longa.', true],
        ['Esqueleto wither', 'Comece a reunir cabeças para um futuro confronto com o Wither.', 'A luta ocorre na próxima era.', true],
        ['Corantes variados', 'Tenha fontes de pelo menos doze cores de corante.', 'Organize uma sala de amostras.', true],
        ['Lágrimas de ghast', 'Monte uma rota ou sistema para obter lágrimas de ghast.', 'Vale coleta manual organizada.', true],
      ],
      explore: [
        ['Bastião', 'Explore um remanescente de bastião e saia com algum espólio.', 'Leve ao menos uma peça de ouro para reduzir agressividade dos piglins.'],
        ['Fortaleza do End', 'Encontre o portal do End e registre suas coordenadas.', 'Reserve olhos do End suficientes para ativar o portal.'],
      ],
      boss: [
        ['Dragão do End', 'Derrote o Dragão do End pela primeira vez.', 'Prepare poções, blocos, arco e cama de respawn no Overworld.'],
      ],
      achievement: [
        ['Armadura reserva de diamante', 'Monte um kit de recuperação com armadura de diamante.', 'Encante as peças conforme os recursos disponíveis.'],
        ['5 acabamentos de armadura', 'Encontre ao menos cinco modelos de acabamento distintos.', 'Ótima motivação para explorar estruturas.', true],
        ['10 discos musicais', 'Colecione dez discos de música diferentes.', 'Use uma sala de música na cidade.', true],
        ['Todos os chifres de cabra', 'Tente colecionar os oito chifres diferentes.', 'Alguns tipos exigem cabras berrantes.', true],
      ],
    }),
  },
  {
    id: 4, name: 'Era da Conquista', subtitle: 'Poder e grandes obras', theme: 'violet',
    description: 'Domine os sistemas avançados do jogo, derrote os maiores perigos e construa projetos monumentais.',
    tagline: 'Sua história agora deixa marcas.',
    equipment: 'Libera netherita, beacon, maça, élitros e equipamentos finais.',
    unlocks: ['Armadura e ferramentas de netherita', 'End Cities, shulkers e élitros', 'Wither, beacon e maça', 'Fazendas e projetos de alta complexidade'],
    goals: objectives(4, {
      build: [
        ['Salão de trocas', 'Construa um mercado para aldeões com profissões e trocas importantes.', 'Proteja aldeões e identifique os postos de trabalho.'],
        ['Megaconstrução', 'Finalize uma obra monumental: castelo, catedral, porto, muralha ou outro marco.', 'Divida o projeto em partes para manter o progresso.'],
        ['Distrito industrial', 'Reúna suas grandes fazendas em um bairro ou complexo industrial coerente.', 'Não precisa mover fazendas que dependem de locais específicos.', true],
      ],
      farm: [
        ['Aldeões', 'Organize reprodução ou transporte de aldeões de forma sustentável.', 'Adapte o sistema às regras de aldeões do Bedrock.'],
        ['Ouro e piglins zumbificados', 'Crie uma fonte consistente de ouro ou recursos de piglins zumbificados.', 'Mecânicas de portais diferem entre edições.'],
        ['Shulkers', 'Estabeleça uma maneira de obter conchas de shulker de forma recorrente.', 'Consulte a mecânica de duplicação da edição Bedrock.', true],
        ['Ametista', 'Use geodos para obter ametistas renováveis.', 'Não destrua os blocos geradores de brotos.', true],
        ['Luzes de sapo', 'Produza frog lights com sapos e cubos de magma pequenos.', 'Cada variante depende do tipo de sapo.', true],
        ['Concreto', 'Prepare uma linha de produção de concreto para megaconstruções.', 'A coleta de areia permanece manual no Survival vanilla.', true],
        ['Raid', 'Construa ou organize uma forma de enfrentar invasões e obter seus recursos.', 'As regras de invasão foram modificadas em atualizações recentes.', true],
      ],
      explore: [
        ['Cidade do End', 'Localize e explore uma End City e retorne com shulker shells.', 'Leve blocos para pontes e planeje o retorno.'],
        ['Élitros', 'Encontre um navio do End e obtenha seus élitros.', 'Crie uma rota segura para voltar com o item.'],
        ['Cidade ancestral', 'Entre em uma Ancient City, colete espólio e saia vivo.', 'Evite ativar sensores sculk desnecessariamente.'],
        ['Câmara de desafio', 'Explore uma Trial Chamber e registre sua localização.', 'Chaves e cofres recompensam preparação e combate.', true],
      ],
      boss: [
        ['Wither', 'Invoque e derrote o Wither em um local cuidadosamente escolhido.', 'Na edição Bedrock ele é especialmente perigoso.'],
        ['Beacon ativado', 'Construa uma pirâmide e ative um beacon com efeitos úteis.', 'A estrela do Nether vem do Wither.'],
      ],
      achievement: [
        ['Armadura reserva de netherita', 'Tenha uma reserva completa de equipamentos avançados.', 'Use modelos de melhoria e mantenha equipamentos encantados.', true],
        ['Maça e núcleo pesado', 'Obtenha uma maça explorando Trial Chambers.', 'Não é necessária para concluir esta era.', true],
        ['Tridente e concha de náutilo', 'Monte um kit para exploração oceânica e montaria aquática.', 'Inclui mecânicas dos lançamentos recentes de Bedrock.', true],
        ['Todas as cabeças de mobs', 'Colecione as cabeças de criaturas possíveis em Survival.', 'Confira quais dependem de creeper eletrificado.', true],
      ],
    }),
  },
  {
    id: 5, name: 'Era do Legado', subtitle: 'Um mundo para recordar', theme: 'blue',
    description: 'Em vez de apenas sobreviver, construa um mundo que conte sua história: museus, coleções, biomas e desafios finais.',
    tagline: 'Deixe um mundo que vale a pena revisitar.',
    equipment: 'Todos os recursos vanilla conquistados nas eras anteriores.',
    unlocks: ['Liberdade total de construção e exploração', 'Coleções completas e museu', 'Expansão da vila por novos biomas', 'Desafios pessoais e projetos de longa duração'],
    goals: objectives(5, {
      build: [
        ['Bioma personalizado', 'Transforme uma região com paisagismo temático e construções próprias.', 'Crie uma floresta mágica, deserto habitado ou vale vulcânico.'],
        ['Museu das conquistas', 'Construa um museu para troféus, armaduras, mapas e registros de aventuras.', 'Reserve áreas temáticas por era.'],
        ['Distrito de cada bioma', 'Construa pequenos postos ou bairros em pelo menos quatro biomas diferentes.', 'Use paletas e telhados adaptados a cada ambiente.', true],
        ['Mapa-múndi', 'Monte uma parede de mapas ou sala de cartografia do mundo explorado.', 'Registre no Atlas os destinos mais importantes.', true],
      ],
      farm: [
        ['Trocas com piglins', 'Construa uma estação segura de bartering com piglins.', 'Tenha reposição de ouro.'],
        ['Resina', 'Crie uma fonte renovável de resina associada ao Creaking e ao jardim pálido.', 'Visite um Pale Garden e proteja o coração do creaking.'],
        ['Produção de cobre organizada', 'Monte uma linha de separação usando baús e golens de cobre.', 'Transforme a indústria em algo visualmente interessante.', true],
        ['Fazenda de recursos de Trial Chamber', 'Estabeleça uma rota periódica de incursões às câmaras de desafio.', 'Alguns recursos exigem novas tentativas e planejamento.', true],
      ],
      explore: [
        ['Todas as dimensões conectadas', 'Crie rotas claras entre Overworld, Nether e End.', 'Faça sinalização e pontos de recuperação.'],
        ['Coleção de biomas', 'Registre visitas a ao menos doze biomas distintos.', 'Salve coordenadas e um detalhe de cada visita.', true],
        ['Expedição oceânica', 'Explore monumentos, ruínas oceânicas e um naufrágio.', 'Leve poções para respirar na água.', true],
        ['Todas as Trial Chambers próximas', 'Localize e complete três câmaras de desafio distintas.', 'Não é preciso farmar todas as recompensas.', true],
      ],
      boss: [
        ['Retorno ao Dragão', 'Ressuscite e derrote novamente o Dragão do End.', 'Construa o ritual e proteja equipamentos importantes.', true],
        ['Câmara de desafio ominosa', 'Complete uma Trial Chamber com as condições ominosas.', 'Leve equipamento e poções no nível máximo.'],
      ],
      achievement: [
        ['Museu completo', 'Exponha itens memoráveis e marcos das cinco eras.', 'Inclua painéis com datas e histórias das construções.'],
        ['Zoológico completo', 'Expanda o zoológico com espécies de biomas variados.', 'Respeite limitações de transporte e geração.', true],
        ['Todas as armaduras ornamentadas', 'Monte uma coleção de acabamentos de armadura.', 'Defina sua própria regra para combinações de material e acabamento.', true],
        ['Todos os discos de música', 'Colecione os discos disponíveis na sua versão do Bedrock.', 'Alguns discos mudam com os novos game drops.', true],
        ['Coleção de bandeiras', 'Crie bandeiras representando cidades, regiões e eras.', 'Exiba-as em um salão de heráldica.', true],
        ['Linha do tempo do mundo', 'Monte um livro, mural ou monumento que registre seus grandes feitos.', 'Essa é a verdadeira condição de vitória de uma jornada pessoal.'],
      ],
    }),
  },
];

export const WHEEL_CHALLENGES: WheelChallenge[] = [
  { id: 'night', name: 'Noite em claro', description: 'Passe uma noite inteira sem dormir ou se esconder em um lugar seguro.', emoji: '🌙' },
  { id: 'pilgrim', name: 'Peregrinação', description: 'Percorra 500 blocos de ida e volta sem montaria nem élitros.', emoji: '🥾' },
  { id: 'builder', name: 'Santuário', description: 'Construa um pequeno santuário temático com ao menos três tipos de blocos.', emoji: '🗿' },
  { id: 'slots', name: 'Inventário enxuto', description: 'Jogue por 20 minutos usando somente nove espaços do inventário.', emoji: '🎒' },
  { id: 'miner', name: 'Pedra por pedra', description: 'Passe dez minutos minerando com ferramentas de pedra ou inferiores.', emoji: '⛏️' },
  { id: 'farmer', name: 'Dia de fazendeiro', description: 'Colha ou plante 64 itens agrícolas antes de retomar a missão principal.', emoji: '🌾' },
  { id: 'artisan', name: 'Oficina', description: 'Fabrique uma ferramenta de cada tipo disponível na sua era.', emoji: '⚒️' },
  { id: 'no-sprint', name: 'Sem pressa', description: 'Não utilize corrida por 30 minutos de jogo.', emoji: '🐢' },
  { id: 'treasure', name: 'Baú do destino', description: 'Guarde cinco itens úteis em um baú por uma sessão de exploração.', emoji: '📦' },
  { id: 'cartographer', name: 'Explorador perdido', description: 'Descubra um ponto de interesse e registre-o no Atlas sem usar teleporte.', emoji: '🧭' },
];
