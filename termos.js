// Os 16 termos do jogo: nome (como aparece na criatura), tipo (dica gratuita)
// e pista (revelada sob custo). Rascunhos: conferir com o e-book da disciplina.
const TERMOS = [
  { nome: "CPU", tipo: "Processamento", pista: "Cérebro do computador que executa as instruções dos programas." },
  { nome: "ULA", tipo: "Processamento", pista: "Parte da CPU que faz as contas e as operações lógicas." },
  { nome: "UC", tipo: "Processamento", pista: "Parte da CPU que busca e decodifica instruções e controla o fluxo." },
  { nome: "Registradores", tipo: "Memória", pista: "Pequenas memórias ultrarrápidas dentro do processador, usadas para operar sobre valores." },
  { nome: "RAM", tipo: "Memória", pista: "Memória volátil que guarda os programas e dados em uso enquanto o computador está ligado." },
  { nome: "ROM", tipo: "Memória", pista: "Memória não volátil gravada de fábrica, que o usuário não pode apagar." },
  { nome: "EEPROM", tipo: "Memória", pista: "Memória não volátil que pode ser apagada e regravada eletricamente, byte a byte." },
  { nome: "Flash", tipo: "Memória", pista: "Memória não volátil regravável em blocos, usada em pendrives e cartões." },
  { nome: "Cache", tipo: "Memória", pista: "Memória pequena e muito rápida que guarda cópias dos dados mais usados." },
  { nome: "Memória de massa", tipo: "Armazenamento", pista: "Grande capacidade não volátil para guardar arquivos e programas por longos períodos." },
  { nome: "DMA", tipo: "Comunicação", pista: "Controlador que transfere dados entre memória e periféricos sem usar a CPU." },
  { nome: "Address bus", tipo: "Comunicação", pista: "Caminho que indica para qual posição da memória a CPU quer acessar." },
  { nome: "Data bus", tipo: "Comunicação", pista: "Caminho que transporta as informações trocadas entre CPU e memória." },
  { nome: "Microcontrolador", tipo: "Processamento", pista: "Chip único com processador, memória e periféricos, para tarefas embarcadas." },
  { nome: "Dual core", tipo: "Processamento", pista: "Processador com duas unidades de execução independentes no mesmo chip." },
  { nome: "Quad core", tipo: "Processamento", pista: "Processador com quatro unidades de execução independentes no mesmo chip." }
];

if (typeof module !== "undefined") module.exports = TERMOS;
