# Batalha de Arquitetura

Um jogo de batalha estilo Pokémon para treinar os termos da aula de Tópicos de Arquitetura Computacional. Você monta um time de criaturas (os termos da aula) e enfrenta inimigos. Para causar dano, é preciso escolher a criatura do seu time que corresponde à pista apresentada.

## Como jogar

1. Você começa com um time de 4 criaturas e 100 HP.
2. Um inimigo aparece com o seu tipo. Ele tem 4 HP; o chefe, que é o último, tem 7.
3. A cada turno, uma pista aparece. Ela descreve uma criatura do seu time.
4. Escolha, entre as 4 opções, a criatura que corresponde à pista. Você tem 15 segundos.
   - **Acerto:** o inimigo perde 1 HP. Se o tipo da sua criatura tem vantagem sobre o tipo do inimigo, o golpe é super efetivo e causa 2 HP.
   - **Erro ou tempo esgotado:** você perde 25 HP e o inimigo contra-ataca.
5. Ao derrotar um inimigo, ele entra no seu time, se ainda não estiver nele. O time cresce conforme você captura inimigos novos.
6. Vença os 8 inimigos, incluindo o chefe, sem chegar a 0 HP.

### Tipos e vantagens

Cada tipo é forte contra o seguinte:

| Atacante | Super efetivo contra |
|---|---|
| Processamento | Comunicação |
| Comunicação | Armazenamento |
| Armazenamento | Memória |
| Memória | Processamento |

### Pontuação

- Cada acerto: +50 pontos.
- Inimigo derrotado: +100 pontos.
- Chefe derrotado: +250 pontos.

## Termos e pistas

| Tipo | Termo | Pista |
|---|---|---|
| Processamento | CPU | Cérebro do computador que executa as instruções dos programas. |
| Processamento | ULA | Parte do processador que faz as contas e as operações lógicas. |
| Processamento | UC | Parte do processador que busca e decodifica instruções e controla o fluxo. |
| Memória | Registradores | Pequenas memórias ultrarrápidas dentro do processador, usadas para operar sobre valores. |
| Memória | RAM | Memória volátil que guarda os programas e dados em uso enquanto o computador está ligado. |
| Memória | ROM | Memória não volátil gravada de fábrica, que o usuário não pode apagar. |
| Memória | EEPROM | Memória não volátil que pode ser apagada e regravada byte a byte. |
| Armazenamento | Flash | Memória não volátil regravável em blocos, usada em pendrives e cartões. |
| Memória | Cache | Memória pequena e muito rápida que guarda cópias dos dados mais usados. |
| Armazenamento | Memória de massa | Grande capacidade não volátil para guardar arquivos e programas por longos períodos. |
| Comunicação | DMA | Controlador que transfere dados entre memória e periféricos sem usar o processador. |
| Comunicação | Address bus | Caminho que indica para qual posição da memória o processador quer acessar. |
| Comunicação | Data bus | Caminho que transporta as informações trocadas entre processador e memória. |
| Processamento | Microcontrolador | Chip único com processador, memória e periféricos, para tarefas embarcadas. |
| Processamento | Dual core | Processador com duas unidades de execução independentes no mesmo chip. |
| Processamento | Quad core | Processador com quatro unidades de execução independentes no mesmo chip. |

As pistas são rascunhos e ainda precisam ser conferidas com o e-book da disciplina.

## Estrutura do projeto

- `index.html`: página do jogo
- `style.css`: visual da batalha
- `termos.js`: os 16 termos, tipos e pistas
- `script.js`: regras da batalha, turnos, time, tipos e tempo

## Como executar

Abra o `index.html` no navegador. Não é preciso instalar nada.

## Site publicado

Link: _(preencher após publicar no GitHub Pages)_
