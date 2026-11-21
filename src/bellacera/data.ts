export type Domain = 'survival' | 'construcao' | 'producao' | 'exploracao' | 'marco';
export type Priority = 'essencial' | 'alta' | 'media' | 'tardia';
export type ProjectStatus = 'planejado' | 'em-obra' | 'concluido';
export type Dimension = 'overworld' | 'nether' | 'end';

export interface Goal {
  id: string; chapter: number; title: string; description: string;
  domain: Domain; tip: string; optional: boolean; requires: string[];
}
export interface Chapter {
  id: number; name: string; subtitle: string; description: string;
  motto: string; symbol: string; accent: string;
}
export interface Production {
  id: string; name: string; chapter: number; priority: Priority;
  kind: 'farm' | 'coleta' | 'processamento'; outputs: string[];
  cityUse: string; goalId: string; description: string; requires: string[];
}
export interface CityProject {
  id: string; name: string; district: string; chapter: number; type: string;
  size: string; description: string; style: string; goalId: string;
  productionIds: string[]; resources: string[];
}

export const SEED = '8888892703877335828';
export const CHAPTERS: Chapter[] = [
  {id:1,name:'Fundação',subtitle:'O primeiro abrigo',motto:'Uma cidade começa com uma porta.',symbol:'house',accent:'sage',description:'Reconhecer o lago, definir o terreno e criar segurança antes de erguer o primeiro bairro.'},
  {id:2,name:'Autossuficiência',subtitle:'Recursos que sustentam',motto:'Toda boa cidade tem suas oficinas.',symbol:'pickaxe',accent:'sand',description:'Ferro, comida, madeira, aldeões e materiais sem transformar o mundo em um complexo industrial.'},
  {id:3,name:'Primeiro bairro',subtitle:'Bellacera ganha vida',motto:'O caminho faz parte da construção.',symbol:'landmark',accent:'rose',description:'A orla, a primeira praça, as docas e alguns pequenos estabelecimentos.'},
  {id:4,name:'Além do portal',subtitle:'Expedição ao Nether',motto:'Voltar para casa também faz parte da aventura.',symbol:'flame',accent:'ember',description:'Acesso às poções, redstone, recursos do Nether e uma rota segura.'},
  {id:5,name:'A cidade produz',subtitle:'Concreto e logística',motto:'Uma boa construção merece sua cadeia de recursos.',symbol:'factory',accent:'slate',description:'Planejar as fachadas claras, fabricar concreto e organizar os primeiros estoques em escala.'},
  {id:6,name:'O grande horizonte',subtitle:'Conquista do End',motto:'Para construir mais alto, precisamos viajar mais longe.',symbol:'sparkles',accent:'violet',description:'Dragão, cidades do End, Elytra e caixas de shulker para projetos maiores.'},
  {id:7,name:'Legado de Bellacera',subtitle:'Cidade em expansão',motto:'Um mundo feito para continuar crescendo.',symbol:'castle',accent:'gold',description:'Orla completa, distritos, castelo, parque, indústrias e histórias próprias.'},
];

function goal(chapter:number,id:string,title:string,description:string,domain:Domain,tip:string,optional=false,requires:string[]=[]):Goal {
  return {id,chapter,title,description,domain,tip,optional,requires};
}
export const GOALS: Goal[] = [
  goal(1,'c1-world','Criar o mundo Java e o backup inicial','Criar o mundo na seed escolhida; salvar uma cópia independente do launcher.','survival','Seed de referência: 8888892703877335828. Confirme terreno e estruturas no Java.'),
  goal(1,'c1-lake','Reconhecer a região do lago','Marcar onde ficarão a orla, a casa, a praça e a expansão comercial.','exploracao','Fotografe a vista do lago e registre coordenadas no Atlas.',false,['c1-world']),
  goal(1,'c1-kit','Preparar o kit de sobrevivência','Cama, alimentação, escudo, balde e ferramentas de ferro.','survival','Não é preciso rushar diamante; priorize segurança.',false,['c1-world']),
  goal(1,'c1-shelter','Montar um abrigo temporário','Uma área iluminada com baús, crafting e fornalhas.','construcao','Deixe o abrigo fora do local da futura praça.',false,['c1-kit']),
  goal(1,'c1-food','Iniciar produção de comida','Plantação, animais ou outra fonte renovável suficiente.','producao','Uma horta junto à primeira casa pode virar parte do cenário.',false,['c1-kit']),
  goal(1,'c1-wood','Criar bosque de replantio','Separar espécies úteis e replantar após cada coleta.','producao','Pinheiro para vigas e carvalho para variedade.',false,['c1-lake']),
  goal(1,'c1-outline','Marcar o outline da Casa do Fundador','Definir volumes, alturas e orientação antes de preencher paredes.','construcao','Use lã colorida para comparar silhuetas e telhados.',false,['c1-lake']),
  goal(1,'c1-home','Construir a Casa do Fundador','Térreo funcional e andar superior preparado para storage e encantamentos futuros.','construcao','Pedra na base, paredes claras e vigas de pinheiro; decoração pode esperar.',false,['c1-outline','c1-wood']),
  goal(1,'c1-path','Primeiro caminho ao lago','Conectar casa e margem sem urbanizar o lago todo.','construcao','Experimente a curva com segmentos longos antes de trocar a terra por pedra.',true,['c1-home']),

  goal(2,'c2-mine','Abrir uma mina organizada','Entrada protegida, iluminação e armazenamento de rochas.','construcao','A mina pode virar uma pedreira histórica da vila.'),
  goal(2,'c2-diamonds','Conseguir ferramentas de diamante','Uma picareta de diamante e reserva de recursos.','survival','Diamante ajuda com obsidiana e exploração.',false,['c2-mine']),
  goal(2,'c2-stonecutter','Instalar cortador de pedras','Produzir acabamento de pedra com menos desperdício.','producao','Útil para muretas, escadas e caminhos.'),
  goal(2,'c2-smelter','Montar uma fundição inicial','Fornalhas, funis opcionais e estoque de combustível.','producao','Uma fundição bonita pode esconder máquinas simples.',false,['c2-mine']),
  goal(2,'c2-villagers','Proteger e preparar aldeões','Garantir acesso seguro a aldeões, camas e futuras trocas.','survival','Mecânicas de farms precisam ser as da edição Java.'),
  goal(2,'c2-iron','Produzir ferro renovável','Construir uma farm de ferro compatível com Java.','producao','Integre a farm a uma fundição ou construa fora do centro.',false,['c2-villagers']),
  goal(2,'c2-sugar','Cultivar cana-de-açúcar','Papel para livros, mapas e trocas.','producao','Pode ficar disfarçada como plantação de várzea.'),
  goal(2,'c2-bonemeal','Garantir farinha de osso','Composte excesso de plantas ou aproveite uma farm de esqueletos.','producao','É essencial para acelerar flores e tinturas.'),
  goal(2,'c2-dyes','Criar jardim de flores e corantes','Organizar espécies que forneçam as cores das fachadas.','producao','Priorize branco, vermelho, verde e tons quentes.',false,['c2-bonemeal']),
  goal(2,'c2-storage','Organizar armazenamento básico','Setorizar pedra, madeira, comida e drops em baús.','construcao','O mega armazém chegará depois; comece legível.'),
  goal(2,'c2-wool','Criar fonte renovável de lã','Pequeno curral ou sistema automático de tosquia.','producao','Útil para camas, banners e marcações de outline.',true),

  goal(3,'c3-facade','Finalizar a fachada principal da casa','Molduras, floreiras, janelas e acabamento interior limpo.','construcao','Não duplique todas as paredes: separe textura externa de estrutura.',false,['c1-home']),
  goal(3,'c3-promenade','Construir o primeiro calçadão','Traçar 30–50 blocos com curva suave, muros e iluminação.','construcao','A água permanece no centro; o passeio fica do lado de terra.',false,['c1-path']),
  goal(3,'c3-square','Criar a praça ou mirante do lago','Banco, árvores, flores e transição com o calçadão.','construcao','Um mirante resolve mudanças bruscas de direção.',false,['c3-promenade']),
  goal(3,'c3-docks','Construir o primeiro píer','Atracadouro pequeno com barco, iluminação e acesso seguro.','construcao','Reserve espaço para um porto maior.',false,['c3-promenade']),
  goal(3,'c3-bakery','Abrir a primeira padaria ou taverna','Construir um comércio simples e útil.','construcao','Paredes claras, vigas aparentes e toldo.',true,['c3-square']),
  goal(3,'c3-florist','Construir floricultura ou estufa','Produzir e expor flores para paisagismo.','construcao','Boa conexão visual com o parque das cerejeiras.',true,['c2-dyes']),
  goal(3,'c3-palette','Testar a paleta de fachadas','Comparar reboco claro, pinheiro, pedra e três tipos de cobertura.','construcao','Faça um painel de amostras antes do grande projeto de concreto.',false,['c3-facade']),

  goal(4,'c4-portal','Abrir um portal seguro para o Nether','Registrar coordenadas e construir um abrigo para o portal.','exploracao','Não leve seus melhores materiais na primeira expedição.',false,['c2-diamonds']),
  goal(4,'c4-fortress','Localizar uma Nether Fortress','Estabelecer um acesso seguro e anotado.','exploracao','Leve ouro, comida e materiais para pontes.',false,['c4-portal']),
  goal(4,'c4-blaze','Coletar varas de blaze','Obter combustível e ingredientes de poções.','survival','Escudo e caminho protegido ajudam muito.',false,['c4-fortress']),
  goal(4,'c4-wart','Cultivar verrugas do Nether','Criar um pequeno jardim de soul sand e verrugas.','producao','Pode ficar na futura botica.',false,['c4-fortress']),
  goal(4,'c4-brew','Preparar as primeiras poções','Montar suporte de poções e estoques úteis.','survival','Resistência ao fogo é uma grande conquista.',false,['c4-blaze','c4-wart']),
  goal(4,'c4-quartz','Coletar quartzo e componentes','Reunir material para observadores e construções pontuais.','producao','Quartzo serve ao progresso técnico; não precisa dominar nossa paleta.',true,['c4-portal']),
  goal(4,'c4-piglin','Organizar trocas com piglins','Criar um pequeno ponto seguro de barter.','producao','Cascalho é um dos resultados úteis para o concreto.',true,['c4-portal']),
  goal(4,'c4-route','Construir uma rota segura no Nether','Conectar portal e locais importantes sem navegação perigosa.','construcao','O futuro hub pode nascer dessa primeira estrada.',true,['c4-fortress']),

  goal(5,'c5-palette','Definir as cores oficiais de Bellacera','Escolher acabamentos de paredes, vigas e telhados por distrito.','construcao','Centro com reboco claro; bairro antigo mais rústico.',false,['c3-palette']),
  goal(5,'c5-sand','Planejar a extração de areia','Selecionar local remoto de coleta sem destruir o lago.','producao','Na prática a areia é um gargalo para concreto em escala.'),
  goal(5,'c5-gravel','Estocar cascalho','Mineração e/ou trocas com piglins.','producao','Guarde o cascalho em vez de descartá-lo.',false,['c4-portal']),
  goal(5,'c5-dye','Garantir corantes das fachadas','Produção confiável das cores mais usadas.','producao','Farinha de osso e flores ajudam com várias cores.',false,['c2-dyes']),
  goal(5,'c5-concrete','Produzir o primeiro lote de concreto','Testar mistura e hidratação do pó.','producao','4 areia + 4 cascalho + 1 corante geram 8 pós; água os transforma em concreto.',false,['c5-sand','c5-gravel','c5-dye']),
  goal(5,'c5-converter','Montar estação de conversão','Começar manualmente; automatizar somente quando houver demanda.','producao','Mantenha a fábrica afastada da orla histórica.',false,['c5-concrete']),
  goal(5,'c5-lumber','Ampliar madeira e bambu','Preparar suprimento para projetos em lote.','producao','Construção de madeira ainda será o melhor recurso inicial.',true,['c1-wood']),
  goal(5,'c5-warehouse','Construir armazém intermediário','Armazenamento de blocos por família e fácil reposição.','construcao','O mega centro comercial IKEA é expansão tardia.',false,['c2-storage']),
  goal(5,'c5-sort','Automatizar classificação quando fizer sentido','Montar módulos de sorter para os itens realmente frequentes.','producao','Não precisa construir um sistema de 200 filtros logo no início.',true,['c5-warehouse']),

  goal(6,'c6-prep','Preparar equipamentos para o End','Armadura, arco, blocos, comida, poções e cama no Overworld.','survival','Faça backup antes da viagem.',false,['c4-brew']),
  goal(6,'c6-pearls','Conseguir pérolas e olhos do End','Reunir ingredientes para localizar e abrir o portal.','exploracao','Trocas ou combate são alternativas.',false,['c4-blaze']),
  goal(6,'c6-stronghold','Encontrar o Stronghold','Registrar coordenadas e construir rota segura.','exploracao','O portal pode ganhar um santuário no futuro.',false,['c6-pearls']),
  goal(6,'c6-dragon','Derrotar o Dragão do End','Concluir o confronto e registrar o marco.','marco','Leve blocos e planeje recuperação dos itens.',false,['c6-prep','c6-stronghold']),
  goal(6,'c6-endcity','Explorar uma End City','Buscar navio, recursos e conchas de shulker.','exploracao','Tenha rota clara de retorno.',false,['c6-dragon']),
  goal(6,'c6-elytra','Conseguir Elytra','Obter mobilidade para grandes construções.','marco','Evite voar até montar estoque de foguetes.',false,['c6-endcity']),
  goal(6,'c6-shulker','Produzir primeiras shulker boxes','Montar kit de transporte para obras e expedições.','survival','Guarde conjuntos de materiais por projeto.',false,['c6-endcity']),
  goal(6,'c6-gunpowder','Obter pólvora de forma recorrente','Fonte confiável para foguetes e TNT.','producao','Projete uma farm compatível com Java.',false,['c6-elytra']),
  goal(6,'c6-enchant','Completar o canto de encantamentos','Mesa, 15 estantes com espaço de ar adequado e armazenamento.','construcao','A sala deve funcionar sem prejudicar a decoração.',true,['c1-home']),

  goal(7,'c7-prom','Expandir o calçadão do lago','Conectar praças, docas e parque preservando trechos de margem natural.','construcao','Não é necessário urbanizar toda a costa.',false,['c3-promenade']),
  goal(7,'c7-commercial','Criar o centro comercial','Praça, fachadas de comércio e trading hall de aldeões.','construcao','Linguagem suíço-italiana com detalhes medievais.',false,['c2-villagers','c3-square']),
  goal(7,'c7-ikea','Construir a IKEA medieval','Grande centro de armazenamento e classificação com fachada comercial.','construcao','Mantenha o prédio maior fora da orla antiga.',true,['c5-warehouse']),
  goal(7,'c7-industry','Desenvolver distrito industrial','Agrupar as farms compatíveis com o terreno e integrar fachadas.','construcao','Mecanismos podem ficar distantes por razões técnicas.',true,['c5-converter']),
  goal(7,'c7-gardens','Construir parque das cerejeiras','Jardins, passarelas, bancos e árvores customizadas.','construcao','Preserve pontos de vista para o lago.',false,['c3-square']),
  goal(7,'c7-bridges','Conectar bairros por pontes','Pontes e ruas em diferentes cotas do terreno.','construcao','Observe o relevo antes de desenhar cada trecho.',true,['c7-prom']),
  goal(7,'c7-hub','Construir Nether Hub','Rede de portais para pedreira, farms e pontos distantes.','construcao','Não projete o hub antes de conhecer as rotas úteis.',true,['c4-route']),
  goal(7,'c7-castle','Erguer o castelo','Marco de longa duração sobre as encostas das cerejeiras.','construcao','Trabalhe em muralha, pátio e torres por etapas.',false,['c7-gardens']),
  goal(7,'c7-witch','Criar a morada da Madame Falecida','Casa de bruxa fictícia e narrativa do lado hostil do lago.','construcao','O antigo Pillager Outpost pode fazer parte do cenário.',true,['c7-bridges']),
  goal(7,'c7-museum','Criar museu de marcos','Expor itens e histórias das grandes conquistas.','construcao','Um bom destino para souvenirs do Nether e End.',true,['c6-dragon']),
  goal(7,'c7-wither','Derrotar Wither e instalar beacon','Obter efeitos úteis para grandes obras.','marco','Planeje local seguro para o confronto.',true,['c6-dragon']),
];

export const PRODUCTIONS: Production[] = [
  {id:'food',name:'Horta e alimentação',chapter:1,priority:'essencial',kind:'farm',outputs:['Comida','trigo','cenoura'],cityUse:'Hortas do bairro antigo',goalId:'c1-food',description:'Sustento inicial e criação de animais sem depender de loot.',requires:[]},
  {id:'wood',name:'Bosque de pinheiros',chapter:1,priority:'essencial',kind:'farm',outputs:['Madeira','vigas','tábuas'],cityUse:'Serraria alpina',goalId:'c1-wood',description:'Pilares, molduras, piso e produção constante de materiais.',requires:[]},
  {id:'iron',name:'Farm de ferro (Java)',chapter:2,priority:'alta',kind:'farm',outputs:['Ferro','funis','grades'],cityUse:'Fundição / ferraria',goalId:'c2-iron',description:'Ferro para grades da orla, funis, trilhos e ferramentas.',requires:['c2-villagers']},
  {id:'sugar',name:'Cana-de-açúcar',chapter:2,priority:'alta',kind:'farm',outputs:['Papel','livros'],cityUse:'Papelaria e biblioteca',goalId:'c2-sugar',description:'Livros, mapas, trocas com aldeões e encantamentos.',requires:[]},
  {id:'bonemeal',name:'Farinha de osso',chapter:2,priority:'alta',kind:'farm',outputs:['Farinha de osso'],cityUse:'Estufa municipal',goalId:'c2-bonemeal',description:'Acelera árvores, flores e tinturas conforme o projeto.',requires:[]},
  {id:'dye',name:'Flores e corantes',chapter:2,priority:'alta',kind:'farm',outputs:['Corantes','flores'],cityUse:'Floricultura',goalId:'c2-dyes',description:'Fachadas coloridas e floreiras ao longo da orla.',requires:['c2-bonemeal']},
  {id:'wool',name:'Lã e ovelhas',chapter:2,priority:'media',kind:'farm',outputs:['Lã','tapetes'],cityUse:'Tecelagem',goalId:'c2-wool',description:'Camas, toldos, banners e marcações temporárias.',requires:[]},
  {id:'villagers',name:'Aldeões e trocas',chapter:2,priority:'alta',kind:'farm',outputs:['Trocas','equipamentos'],cityUse:'Mercado central',goalId:'c2-villagers',description:'Trocas para livros, ferramentas e outros recursos.',requires:[]},
  {id:'quartz',name:'Quartzo do Nether',chapter:4,priority:'media',kind:'coleta',outputs:['Quartzo','observadores'],cityUse:'Oficina de mecanismos',goalId:'c4-quartz',description:'Obtido por mineração no Nether, útil para automações.',requires:['c4-portal']},
  {id:'piglin',name:'Trocas com piglins',chapter:4,priority:'media',kind:'farm',outputs:['Cascalho','obsidiana','outros drops'],cityUse:'Entreposto do Nether',goalId:'c4-piglin',description:'Uma das fontes recorrentes de cascalho.',requires:['c4-portal']},
  {id:'sand',name:'Extração de areia',chapter:5,priority:'alta',kind:'coleta',outputs:['Areia','vidro','concreto'],cityUse:'Pedreira distante',goalId:'c5-sand',description:'Reservar região remota; não sacrificar a margem principal.',requires:[]},
  {id:'gravel',name:'Cascalho',chapter:5,priority:'alta',kind:'coleta',outputs:['Cascalho','pó de concreto'],cityUse:'Depósito de agregados',goalId:'c5-gravel',description:'Mineração e trocas com piglins para estoque em escala.',requires:[]},
  {id:'concrete',name:'Conversão de concreto',chapter:5,priority:'alta',kind:'processamento',outputs:['Concreto sólido'],cityUse:'Fábrica de materiais',goalId:'c5-converter',description:'Estação manual no início; automatizar conforme demanda.',requires:['c5-concrete']},
  {id:'powder',name:'Pólvora e foguetes',chapter:6,priority:'alta',kind:'farm',outputs:['Pólvora','foguetes'],cityUse:'Oficina de foguetes',goalId:'c6-gunpowder',description:'Fundamental para usar Elytra com liberdade.',requires:['c6-elytra']},
  {id:'sort',name:'Classificação automática',chapter:5,priority:'media',kind:'processamento',outputs:['Itens organizados'],cityUse:'Armazém comercial',goalId:'c5-sort',description:'Criar sorter gradual, apenas para itens de maior volume.',requires:['c5-warehouse']},
];

export const PROJECTS: CityProject[] = [
  {id:'founder',name:'Casa do Fundador',district:'Bairro antigo',chapter:1,type:'Moradia',size:'11 × 13 (referência)',description:'Casa de dois andares; quarto, oficina, storage e área reservada para encantamentos.',style:'Base de pedra, reboco claro e vigas de pinheiro.',goalId:'c1-home',productionIds:['wood','food'],resources:['Pedra','Diorito / calcita','Madeira de pinheiro','Vidro']},
  {id:'quarry',name:'Pedreira e mina',district:'Encosta oeste',chapter:2,type:'Infraestrutura',size:'Adaptável ao relevo',description:'Entrada de mineração com depósito, lanternas e trilhos futuros.',style:'Pedra escura, vigas rústicas e telhado baixo.',goalId:'c2-mine',productionIds:['wood'],resources:['Pedra','Madeira','Lanternas']},
  {id:'forge',name:'Fundição de Bellacera',district:'Bairro produtivo',chapter:2,type:'Produção',size:'9 × 11 (sugestão)',description:'Exterior medieval para o sistema de ferro e fornalhas.',style:'Pedra, chaminé, cobre e madeira escura.',goalId:'c2-iron',productionIds:['iron','wood'],resources:['Pedra','Ferro','Madeira']},
  {id:'promenade',name:'Primeiro calçadão',district:'Orla leste',chapter:3,type:'Urbanismo',size:'30–50 blocos de extensão',description:'Passeio contornando o lago com curvas longas, grades, árvores e bancos.',style:'Pedra clara, ferro, floreiras e luz quente.',goalId:'c3-promenade',productionIds:['iron','dye'],resources:['Tijolos de pedra','Lajes','Barras de ferro','Flores']},
  {id:'square',name:'Praça do lago',district:'Orla leste',chapter:3,type:'Urbanismo',size:'11 × 15 (sugestão)',description:'Mirante para a cidade, banco, canteiro e conexão dos passeios.',style:'Pavimento claro, grade de ferro e cerejeiras.',goalId:'c3-square',productionIds:['iron','dye'],resources:['Pedra','Lanternas','Flores']},
  {id:'docks',name:'Doca dos barcos',district:'Orla do lago',chapter:3,type:'Porto',size:'7 × 15 (sugestão)',description:'Píer inicial, barco e pequeno abrigo para pescadores.',style:'Madeira de pinheiro e ancoragem em pedra.',goalId:'c3-docks',productionIds:['wood'],resources:['Madeira','Cerca','Lanternas']},
  {id:'bakery',name:'Padaria / taverna',district:'Centro antigo',chapter:3,type:'Comércio',size:'9 × 11 (sugestão)',description:'Primeiro edifício comercial para a vila parecer habitada.',style:'Reboco claro, toldo, vitrines e floreiras.',goalId:'c3-bakery',productionIds:['wood','food'],resources:['Diorito','Madeira','Vidro','Lã']},
  {id:'florist',name:'Floricultura das cerejeiras',district:'Parque do lago',chapter:3,type:'Comércio',size:'7 × 9 (sugestão)',description:'Loja e estufa com flores e corantes para o paisagismo.',style:'Madeira clara, vidro e plantas.',goalId:'c3-florist',productionIds:['dye','bonemeal'],resources:['Vidro','Madeira','Flores']},
  {id:'portal',name:'Santuário do portal',district:'Distrito exterior',chapter:4,type:'Especial',size:'11 × 11 (sugestão)',description:'Portal protegido, visual distinto sem dominar a cidade.',style:'Pedra e toques pontuais de Nether.',goalId:'c4-portal',productionIds:[],resources:['Obsidiana','Pedra','Lanternas']},
  {id:'factory',name:'Fábrica de concreto',district:'Zona industrial',chapter:5,type:'Produção',size:'Livre',description:'Área para estoque de areia/cascalho, corantes e hidratação.',style:'Armazém medieval funcional com pátio.',goalId:'c5-converter',productionIds:['sand','gravel','dye','concrete'],resources:['Areia','Cascalho','Corante']},
  {id:'warehouse',name:'Armazém intermediário',district:'Bairro produtivo',chapter:5,type:'Logística',size:'13 × 17 (sugestão)',description:'Organização de materiais por uso, preparada para ampliar.',style:'Pedra, madeira e acesso para carroças.',goalId:'c5-warehouse',productionIds:['sort'],resources:['Madeira','Baús','Funis']},
  {id:'ikea',name:'IKEA de Bellacera',district:'Distrito comercial externo',chapter:7,type:'Mega storage',size:'Grande, por módulos',description:'Fachada divertida de loja e interior de armazenamento automatizado.',style:'Centro comercial fantasia com identidade própria.',goalId:'c7-ikea',productionIds:['iron','sort','wood'],resources:['Concreto','Madeira','Vidro','Funis']},
  {id:'park',name:'Parque das Cerejeiras',district:'Encosta sudeste',chapter:7,type:'Paisagismo',size:'Adaptável ao vale',description:'Jardins, trilhas, bosques e mirantes entre as casas.',style:'Pedra clara, caminhos orgânicos, vegetação.',goalId:'c7-gardens',productionIds:['dye','bonemeal'],resources:['Flores','Folhagens','Pedra']},
  {id:'castle',name:'Castelo do vale',district:'Cidade alta',chapter:7,type:'Monumento',size:'Projeto por módulos',description:'Castelo com torres, muralhas e grande vista do lago.',style:'Pedra, telhados de deepslate e detalhes alpinos.',goalId:'c7-castle',productionIds:['iron','wood','concrete'],resources:['Pedra','Deepslate','Madeira']},
  {id:'witch',name:'Mansão da Madame Falecida',district:'Margem oeste',chapter:7,type:'Fantasia',size:'Casa e jardim',description:'A residência fictícia da bruxa perto do território dos Pillagers.',style:'Arquitetura torta, jardim sinistro e humor medieval.',goalId:'c7-witch',productionIds:['wood'],resources:['Madeira escura','Pedra','Cogumelos']},
];

export const GOAL_MAP = Object.fromEntries(GOALS.map(g => [g.id,g])) as Record<string,Goal>;
export const PRODUCTION_MAP = Object.fromEntries(PRODUCTIONS.map(p => [p.id,p])) as Record<string,Production>;
