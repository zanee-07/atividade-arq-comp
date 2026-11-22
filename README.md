# Batalha de Arquitetura

Um jogo de batalha estilo Pokémon para treinar os termos da aula de Tópicos de Arquitetura Computacional. Você monta um time de criaturas (os termos da aula) e enfrenta inimigos. Para causar dano, é preciso escolher a criatura do seu time que corresponde à pista apresentada.

## Como jogar

1. Você começa com um time de 4 criaturas e 100 HP.
2. Um inimigo aparece com o seu tipo. O nome fica oculto. Ele tem 4 HP; o chefe, que é o último, tem 7.
3. Uma pista aparece. Ela descreve uma das criaturas do seu time.
4. Escolha, entre as 4 opções, a criatura que corresponde à pista. Você tem 15 segundos.
   - **Acerto:** o inimigo perde 1 HP. Se o tipo da sua criatura tem vantagem sobre o tipo do inimigo, o golpe é super efetivo e causa 2 HP.
   - **Erro ou tempo esgotado:** você perde 25 HP e o inimigo contra-ataca.
5. Cada turno termina com a sua escolha, e uma nova pista aparece para o mesmo inimigo. Não há eliminação de opções.
6. Quando o HP do inimigo chega a 0, ele é derrotado e entra no seu time, se ainda não estiver nele.
7. Vença os 8 inimigos, incluindo o chefe, sem chegar a 0 HP.

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

## Estrutura do projeto

- `index.html`: página do jogo
- `style.css`: visual da batalha
- `termos.js`: os 16 termos, tipos e pistas
- `script.js`: regras da batalha, turnos, time, tipos e tempo

## Como executar

Abra o `index.html` no navegador. Não é preciso instalar nada.

## Site publicado

Link: _(preencher após publicar no GitHub Pages)_
