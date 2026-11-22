(function () {
  // Regras do jogo
  const HP_INICIAL = 100;
  const DANO_ERRO = 25;
  const CUSTO_PISTA = 10;
  const PONTOS_SEM_PISTA = 100;
  const PONTOS_COM_PISTA = 50;
  const TAM_TIME = 4;
  const VELOCIDADE_TEXTO = 22; // ms por letra

  const CORES_TIPO = {
    "Processamento": "#f08030",
    "Memória": "#6890f0",
    "Armazenamento": "#c8b860",
    "Comunicação": "#78c850"
  };

  const CLASSE_TIPO = {
    "Processamento": "tipo-processamento",
    "Memória": "tipo-memoria",
    "Armazenamento": "tipo-armazenamento",
    "Comunicação": "tipo-comunicacao"
  };

  const FORMAS = [
    '<circle cx="60" cy="58" r="40"/>',
    '<ellipse cx="60" cy="58" rx="34" ry="44"/>',
    '<path d="M60 12 L72 32 L96 28 L86 48 L108 62 L86 76 L92 100 L68 92 L60 112 L52 92 L28 100 L34 76 L12 62 L34 48 L24 28 L48 32 Z"/>'
  ];

  const el = (id) => document.getElementById(id);
  const ui = {
    derrotados: el("derrotados"),
    total: el("total"),
    pontos: el("pontos"),
    campo: el("campo"),
    tipoInimigo: el("tipo-inimigo"),
    nomeInimigo: document.querySelector(".nome-oculto"),
    spriteInimigo: el("sprite-inimigo"),
    vidaInimigo: el("vida-inimigo"),
    spriteJogador: el("sprite-jogador"),
    nomeJogador: el("nome-jogador"),
    vidaJogador: el("vida-jogador"),
    vidaTexto: el("vida-jogador-texto"),
    caixaTexto: el("caixa-texto"),
    mensagem: el("mensagem"),
    pista: el("pista"),
    btnPista: el("btn-pista"),
    opcoes: el("opcoes"),
    btnReiniciar: el("btn-reiniciar"),
    fim: el("fim"),
    fimTitulo: el("fim-titulo"),
    fimTexto: el("fim-texto"),
    fimReiniciar: el("fim-reiniciar")
  };

  let fila = [];
  let indice = 0;
  let hp = HP_INICIAL;
  let pontos = 0;
  let derrotados = 0;
  let sessao = 0;          // identifica a partida atual; muda ao reiniciar
  let ocupado = false;     // true enquanto a animação/texto de um turno roda
  let rodadaAtiva = false; // true quando o jogador pode escolher
  let pistaRevelada = false;
  let pularTexto = false;
  let inimigoAtual = null;
  let criaturaAtiva = null;

  // Esperas pendentes. Ao reiniciar, são canceladas: as promessas nunca resolvem,
  // então o turno antigo para no meio e não mexe no jogo novo.
  const pendentes = new Set();
  function esperar(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        pendentes.delete(id);
        resolve();
      }, ms);
      pendentes.add(id);
    });
  }
  function cancelarEsperas() {
    pendentes.forEach((id) => clearTimeout(id));
    pendentes.clear();
  }

  function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  // Desenha uma criatura em SVG. Só usa cores e formas definidas aqui.
  function svgCriatura(cor, forma) {
    return (
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="60" cy="110" rx="34" ry="7" fill="rgba(0,0,0,0.25)"/>' +
      '<g fill="' + cor + '" stroke="#1a1a24" stroke-width="4">' + FORMAS[forma] + '</g>' +
      '<ellipse cx="44" cy="40" rx="10" ry="6" fill="rgba(255,255,255,0.45)"/>' +
      '<circle cx="46" cy="54" r="9" fill="#fff" stroke="#1a1a24" stroke-width="3"/>' +
      '<circle cx="74" cy="54" r="9" fill="#fff" stroke="#1a1a24" stroke-width="3"/>' +
      '<circle cx="48" cy="55" r="4.5" fill="#1a1a24"/>' +
      '<circle cx="76" cy="55" r="4.5" fill="#1a1a24"/>' +
      '<path d="M48 74 Q60 84 72 74" stroke="#1a1a24" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '</svg>'
    );
  }

  function atualizarHP() {
    const percentual = Math.max(0, (hp / HP_INICIAL) * 100);
    ui.vidaJogador.style.width = percentual + "%";
    ui.vidaJogador.classList.toggle("baixa", percentual <= 30);
    ui.vidaTexto.textContent = Math.max(0, hp) + "/" + HP_INICIAL;
  }

  function atualizarPlacar() {
    ui.pontos.textContent = pontos;
    ui.derrotados.textContent = derrotados;
    ui.total.textContent = TERMOS.length;
  }

  // Escreve o texto letra por letra, como um diálogo de batalha.
  async function escrever(texto, classe) {
    const sessaoAtual = sessao;
    pularTexto = false;
    ui.mensagem.className = "mensagem " + (classe || "");
    ui.mensagem.textContent = "";
    for (let i = 1; i <= texto.length; i++) {
      if (sessaoAtual !== sessao) return false;
      if (pularTexto) break;
      ui.mensagem.textContent = texto.slice(0, i);
      await esperar(VELOCIDADE_TEXTO);
    }
    if (sessaoAtual !== sessao) return false;
    ui.mensagem.textContent = texto;
    return true;
  }

  function animar(elemento, classe, duracao) {
    elemento.classList.remove(classe);
    void elemento.offsetWidth; // reinicia a animação
    elemento.classList.add(classe);
    return esperar(duracao).then(() => elemento.classList.remove(classe));
  }

  function mostrarDano(lado, texto) {
    const numero = document.createElement("span");
    numero.className = "dano dano-" + lado;
    numero.textContent = texto;
    ui.campo.appendChild(numero);
    setTimeout(() => numero.remove(), 900);
  }

  function montarOpcoes(inimigo) {
    const distratores = embaralhar(TERMOS.filter((t) => t !== inimigo)).slice(0, TAM_TIME - 1);
    const time = embaralhar([inimigo].concat(distratores));
    ui.opcoes.textContent = "";
    time.forEach((criatura) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.textContent = criatura.nome;
      botao.dataset.nome = criatura.nome;
      botao.addEventListener("click", () => escolher(criatura, botao));
      ui.opcoes.appendChild(botao);
    });
  }

  function travarOpcoes() {
    ui.opcoes.querySelectorAll("button").forEach((b) => (b.disabled = true));
  }

  function atualizarBotaoPista() {
    if (pistaRevelada) {
      ui.btnPista.disabled = true;
      ui.btnPista.textContent = "Pista revelada";
      return;
    }
    ui.btnPista.textContent = "Revelar pista (−" + CUSTO_PISTA + " HP)";
    ui.btnPista.disabled = !rodadaAtiva || ocupado || hp <= CUSTO_PISTA;
  }

  async function novaRodada() {
    const sessaoAtual = sessao;
    const inimigo = fila[indice];
    inimigoAtual = inimigo;
    ocupado = true;
    rodadaAtiva = false;
    pistaRevelada = false;

    ui.tipoInimigo.textContent = "Tipo: " + inimigo.tipo;
    ui.tipoInimigo.className = "tipo " + (CLASSE_TIPO[inimigo.tipo] || "");
    ui.nomeInimigo.textContent = "???";
    ui.nomeInimigo.classList.remove("revelado");
    ui.spriteInimigo.classList.remove("desmaia");
    ui.spriteInimigo.innerHTML = svgCriatura(CORES_TIPO[inimigo.tipo], Math.floor(Math.random() * FORMAS.length));
    ui.vidaInimigo.style.width = "100%";
    ui.pista.hidden = true;
    ui.pista.textContent = "";
    ui.opcoes.textContent = "";
    atualizarBotaoPista();

    await animar(ui.spriteInimigo, "entra", 500);
    if (!(await escrever("Um inimigo do tipo " + inimigo.tipo + " apareceu!"))) return;
    await esperar(400);
    if (!(await escrever("Qual criatura do seu time derrota ele?"))) return;
    if (sessaoAtual !== sessao) return;

    montarOpcoes(inimigo);
    ocupado = false;
    rodadaAtiva = true;
    atualizarBotaoPista();
  }

  function mostrarCriaturaAtiva(criatura) {
    criaturaAtiva = criatura;
    ui.nomeJogador.textContent = criatura.nome;
    ui.spriteJogador.innerHTML = svgCriatura(CORES_TIPO[criatura.tipo], TERMOS.indexOf(criatura) % FORMAS.length);
    ui.spriteJogador.classList.remove("desmaia");
  }

  async function escolher(criatura, botao) {
    if (!rodadaAtiva || ocupado || botao.disabled) return;
    const sessaoAtual = sessao;
    const inimigo = inimigoAtual;
    ocupado = true;
    rodadaAtiva = false;
    atualizarBotaoPista();
    botao.classList.add("escolhida");

    mostrarCriaturaAtiva(criatura);
    await animar(ui.spriteJogador, "entra-jogador", 500);
    if (!(await escrever("Vai, " + criatura.nome + "!"))) return;
    await esperar(300);

    if (criatura === inimigo) {
      travarOpcoes();
      botao.classList.add("certa");
      const ganho = pistaRevelada ? PONTOS_COM_PISTA : PONTOS_SEM_PISTA;
      await animar(ui.spriteJogador, "ataca-jogador", 400);
      await animar(ui.spriteInimigo, "pisca", 600);
      ui.vidaInimigo.style.width = "0%";
      if (!(await escrever(criatura.nome + " acertou em cheio! Super efetivo!", "bom"))) return;
      await esperar(400);
      pontos += ganho;
      derrotados += 1;
      atualizarPlacar();
      ui.nomeInimigo.textContent = inimigo.nome.toUpperCase();
      ui.nomeInimigo.classList.add("revelado");
      ui.spriteInimigo.classList.add("desmaia");
      if (!(await escrever("O inimigo " + inimigo.nome + " foi derrotado! +" + ganho + " pontos.", "bom"))) return;
      await esperar(1000);
      if (sessaoAtual !== sessao) return;

      indice += 1;
      if (indice >= fila.length) {
        terminar(true);
      } else {
        novaRodada();
      }
      return;
    }

    // Erro: o inimigo contra-ataca e o jogador perde HP
    botao.classList.add("errada");
    botao.disabled = true;
    if (!(await escrever(criatura.nome + " não é efetivo...", "ruim"))) return;
    await esperar(300);
    await animar(ui.spriteInimigo, "ataca-inimigo", 400);
    hp -= DANO_ERRO;
    atualizarHP();
    mostrarDano("jogador", "-" + DANO_ERRO);
    await animar(ui.spriteJogador, "treme", 400);
    if (!(await escrever("O inimigo contra-atacou! Você perdeu " + DANO_ERRO + " HP.", "ruim"))) return;
    await esperar(400);
    if (sessaoAtual !== sessao) return;

    if (hp <= 0) {
      travarOpcoes();
      await animar(ui.spriteJogador, "desmaia-jogador", 700);
      ui.spriteJogador.classList.add("desmaia");
      terminar(false);
      return;
    }

    if (!(await escrever("Escolha outra criatura."))) return;
    ocupado = false;
    rodadaAtiva = true;
    atualizarBotaoPista();
  }

  async function revelarPista() {
    if (!rodadaAtiva || ocupado || pistaRevelada) return;
    if (hp <= CUSTO_PISTA) {
      await escrever("HP insuficiente para revelar a pista.", "ruim");
      atualizarBotaoPista();
      return;
    }
    const sessaoAtual = sessao;
    hp -= CUSTO_PISTA;
    atualizarHP();
    mostrarDano("jogador", "-" + CUSTO_PISTA);
    pistaRevelada = true;
    ui.pista.textContent = inimigoAtual.pista;
    ui.pista.hidden = false;
    atualizarBotaoPista();
    if (sessaoAtual !== sessao) return;
    if (hp <= 0) {
      travarOpcoes();
      terminar(false);
    }
  }

  async function terminar(venceu) {
    ocupado = true;
    rodadaAtiva = false;
    atualizarBotaoPista();
    const sessaoAtual = sessao;
    if (venceu) {
      ui.fimTitulo.textContent = "Vitória!";
      ui.fimTexto.textContent = "Você derrotou todos os " + TERMOS.length + " inimigos com " + Math.max(0, hp) + " HP restantes. Pontuação final: " + pontos + ".";
      await escrever("Você venceu a batalha!", "bom");
    } else {
      ui.fimTitulo.textContent = "Derrota";
      ui.fimTexto.textContent = "Seu time caiu após " + derrotados + " de " + TERMOS.length + " inimigos. Pontuação: " + pontos + ".";
      await escrever("Seu time foi derrotado...", "ruim");
    }
    await esperar(800);
    if (sessaoAtual !== sessao) return;
    if (typeof ui.fim.showModal === "function") {
      ui.fim.showModal();
    }
  }

  function reiniciar() {
    sessao += 1;
    cancelarEsperas();
    if (ui.fim.open) ui.fim.close();
    ["entra", "entra-jogador", "ataca-jogador", "ataca-inimigo", "pisca", "treme", "desmaia-jogador"].forEach((classe) => {
      ui.spriteInimigo.classList.remove(classe);
      ui.spriteJogador.classList.remove(classe);
    });
    ui.campo.querySelectorAll(".dano").forEach((n) => n.remove());
    fila = embaralhar(TERMOS);
    indice = 0;
    hp = HP_INICIAL;
    pontos = 0;
    derrotados = 0;
    ocupado = false;
    rodadaAtiva = false;
    criaturaAtiva = null;
    ui.nomeJogador.textContent = "Seu time";
    ui.spriteJogador.innerHTML = "";
    ui.spriteJogador.classList.remove("desmaia");
    atualizarHP();
    atualizarPlacar();
    novaRodada();
  }

  // Clicar na caixa de texto mostra a mensagem inteira de uma vez.
  ui.caixaTexto.addEventListener("click", () => { pularTexto = true; });
  // Esc não fecha o modal de fim: o jogador precisa usar "Jogar de novo".
  ui.fim.addEventListener("cancel", (e) => e.preventDefault());
  ui.btnPista.addEventListener("click", revelarPista);
  ui.btnReiniciar.addEventListener("click", reiniciar);
  ui.fimReiniciar.addEventListener("click", reiniciar);

  reiniciar();
})();
