# Batalha de Arquitetura

Um jogo de quiz no estilo Pokémon para treinar os termos da aula de Tópicos de Arquitetura Computacional.

Cada inimigo é uma criatura oculta, identificada apenas pelo **tipo**. Para derrotá-la, você precisa escolher, entre as criaturas do seu time, a que corresponde à pista do inimigo.

## Como jogar

1. Um inimigo aparece com o seu tipo (Processamento, Memória, Armazenamento ou Comunicação). O nome fica oculto.
2. Escolha uma das 4 criaturas do time. Ela deve ser o termo que responde à pista.
3. Acertou: o inimigo é derrotado e você ganha pontos.
4. Errou: você perde 25 HP e aquela criatura fica desabilitada. Tente outra.
5. Quer uma dica? Revelar a pista custa 10 HP, e acertar com pista revelada rende menos pontos (50 em vez de 100). A pista só pode ser revelada se você tiver mais de 10 HP.
6. Derrote os 16 inimigos com HP acima de zero para vencer.

## Termos e pistas

| Tipo | Termo | Pista |
|---|---|---|
| Processamento | CPU | Cérebro do computador que executa as instruções dos programas. |
| Processamento | ULA | Parte da CPU que faz as contas e as operações lógicas. |
| Processamento | UC | Parte da CPU que busca e decodifica instruções e controla o fluxo. |
| Memória | Registradores | Pequenas memórias ultrarrápidas dentro do processador, usadas para operar sobre valores. |
| Memória | RAM | Memória volátil que guarda os programas e dados em uso enquanto o computador está ligado. |
| Memória | ROM | Memória não volátil gravada de fábrica, que o usuário não pode apagar. |
| Memória | EEPROM | Memória não volátil que pode ser apagada e regravada eletricamente, byte a byte. |
| Memória | Flash | Memória não volátil regravável em blocos, usada em pendrives e cartões. |
| Memória | Cache | Memória pequena e muito rápida que guarda cópias dos dados mais usados. |
| Armazenamento | Memória de massa | Grande capacidade não volátil para guardar arquivos e programas por longos períodos. |
| Comunicação | DMA | Controlador que transfere dados entre memória e periféricos sem usar a CPU. |
| Comunicação | Address bus | Caminho que indica para qual posição da memória a CPU quer acessar. |
| Comunicação | Data bus | Caminho que transporta as informações trocadas entre CPU e memória. |
| Processamento | Microcontrolador | Chip único com processador, memória e periféricos, para tarefas embarcadas. |
| Processamento | Dual core | Processador com duas unidades de execução independentes no mesmo chip. |
| Processamento | Quad core | Processador com quatro unidades de execução independentes no mesmo chip. |

## Estrutura do projeto

- `index.html`: página do jogo
- `style.css`: visual e tema claro/escuro
- `termos.js`: os 16 termos, tipos e pistas
- `script.js`: regras da batalha

## Como executar

Abra o `index.html` no navegador. Não é preciso instalar nada.

## Site publicado

Link: _(preencher após publicar no GitHub Pages)_
