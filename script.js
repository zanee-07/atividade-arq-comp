(function () {
  // ---------- Regras ----------
  const HP_INICIAL = 100;
  const DANO_ERRO = 25;          // dano ao jogador por erro ou tempo esgotado
  const HP_INIMIGO = 4;
  const HP_CHEFE = 7;
  const DANO_NORMAL = 1;         // golpes por acerto
  const DANO_SUPER_EFETIVO = 2;
  const TIME_INICIAL = 4;
  const OPCOES = 4;
  const TEMPO_TURNO = 15;        // segundos para responder
  const INIMIGOS_PARA_VENCER = 8; // o último é o chefe
  const PONTOS_ACERTO = 50;
  const PONTOS_INIMIGO = 100;
  const PONTOS_CHEFE = 250;
  const VELOCIDADE_TEXTO = 22;   // ms por letra

  // Cada tipo é forte contra o seguinte: Processamento > Comunicação > Armazenamento > Memória > Processamento.
  const VANTAGEM = {
    "Processamento": "Comunicação",
    "Comunicação": "Armazenamento",
    "Armazenamento": "Memória",
    "Memória": "Processamento"
  };
  const superEfetivo = (atacante, defensor) => VANTAGEM[atacante] === defensor;

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

  // ---------- Elementos ----------
  const el = (id) => document.getElementById(id);
  const ui = {
    derrotados: el("derrotados"),
    total: el("total"),
    pontos: el("pontos"),
    time: el("time"),
    campo: el("campo"),
    tipoInimigo: el("tipo-inimigo"),
    nomeInimigo: el("nome-inimigo"),
    spriteInimigo: el("sprite-inimigo"),
    vidaInimigo: el("vida-inimigo"),
    spriteJogador: el("sprite-jogador"),
    nomeJogador: el("nome-jogador"),
    vidaJogador: el("vida-jogador"),
    vidaTexto: el("vida-jogador-texto"),
    caixaTexto: el("caixa-texto"),
    mensagem: el("mensagem"),
    pista: el("pista"),
    anuncio: el("anuncio"),
    tempo: el("tempo"),
    opcoes: el("opcoes"),
    btnReiniciar: el("btn-reiniciar"),
    fim: el("fim"),
    fimTitulo: el("fim-titulo"),
    fimTexto: el("fim-texto"),
    fimReiniciar: el("fim-reiniciar")
  };

  // ---------- Estado ----------
  let time = [];          // criaturas do jogador (termos)
  let inimigos = [];      // ordem dos inimigos da partida
  let indice = 0;
  let inimigo = null;     // termo do inimigo atual
  let hpInimigo = 0;
  let maxHpInimigo = 0;
  let alvo = null;        // criatura que responde à pista atual
  let hp = HP_INICIAL;
  let pontos = 0;
  let vencidos = 0;
  let sessao = 0;         // muda ao reiniciar; cancela turnos antigos
  let fase = "ocupado";   // "ocupado" | "escolha" | "fim"
  let timerId = null;
  let tempoRestante = TEMPO_TURNO;
  let pularTexto = false;

  // ---------- Utilidades ----------
  // Esperas pendentes: ao reiniciar são canceladas, então o turno antigo para no meio.
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
    pararTimer();
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

  // Escreve o texto letra por letra. Clicar na caixa ou pressionar Enter mostra o texto inteiro.
  // Um leitor de tela só recebe o texto final, em #anuncio.
  async function escrever(texto, classe, destino) {
    const sessaoAtual = sessao;
    const alvo = destino || ui.mensagem;
    pularTexto = false;
    if (!destino) ui.mensagem.className = "mensagem " + (classe || "");
    alvo.textContent = "";
    for (let i = 1; i <= texto.length; i++) {
      if (sessaoAtual !== sessao) return false;
      if (pularTexto) break;
      alvo.textContent = texto.slice(0, i);
      await esperar(VELOCIDADE_TEXTO);
    }
    if (sessaoAtual !== sessao) return false;
    alvo.textContent = texto;
    ui.anuncio.textContent = texto;
    return true;
  }

  // ---------- Placar ----------
  function atualizarHP() {
    const percentual = Math.max(0, (hp / HP_INICIAL) * 100);
    ui.vidaJogador.style.width = percentual + "%";
    ui.vidaJogador.classList.toggle("baixa", percentual <= 30);
    ui.vidaTexto.textContent = Math.max(0, hp) + "/" + HP_INICIAL;
  }

  function atualizarInimigoHP() {
    const percentual = Math.max(0, (hpInimigo / maxHpInimigo) * 100);
    ui.vidaInimigo.style.width = percentual + "%";
  }

  function atualizarPlacar() {
    ui.pontos.textContent = pontos;
    ui.derrotados.textContent = vencidos;
    ui.total.textContent = INIMIGOS_PARA_VENCER;
    ui.time.textContent = time.length;
  }

  // ---------- Turno ----------
  function pararTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function atualizarTempo() {
    ui.tempo.textContent = "Tempo: " + tempoRestante + "s";
  }

  function iniciarTimer() {
    pararTimer();
    tempoRestante = TEMPO_TURNO;
    atualizarTempo();
    const sessaoAtual = sessao;
    const id = setInterval(() => {
      if (sessaoAtual !== sessao) {
        clearInterval(id);
        return;
      }
      tempoRestante -= 1;
      atualizarTempo();
      if (tempoRestante <= 0) {
        clearInterval(id);
        if (timerId === id) timerId = null;
        resolverTurno(null, null);
      }
    }, 1000);
    timerId = id;
  }

  function montarOpcoes() {
    const outras = embaralhar(time.filter((c) => c !== alvo)).slice(0, OPCOES - 1);
    const opcoes = embaralhar([alvo].concat(outras));
    ui.opcoes.textContent = "";
    opcoes.forEach((criatura) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.textContent = criatura.nome;
      botao.addEventListener("click", () => resolverTurno(criatura, botao));
      ui.opcoes.appendChild(botao);
    });
  }

  function travarOpcoes() {
    ui.opcoes.querySelectorAll("button").forEach((b) => (b.disabled = true));
  }

  function mostrarCriaturaAtiva(criatura) {
    ui.nomeJogador.textContent = criatura.nome;
    ui.spriteJogador.innerHTML = svgCriatura(CORES_TIPO[criatura.tipo], TERMOS.indexOf(criatura) % FORMAS.length);
    ui.spriteJogador.classList.remove("desmaia");
  }

  // Pergunta nova para o mesmo inimigo: a pista descreve uma criatura do seu time.
  async function novaPergunta() {
    const sessaoAtual = sessao;
    fase = "ocupado";
    ui.opcoes.textContent = "";
    // Prefere uma criatura diferente do inimigo, para a pista não descrever o próprio inimigo.
    const candidatas = time.filter((c) => c !== inimigo);
    const fonte = candidatas.length > 0 ? candidatas : time;
    alvo = fonte[Math.floor(Math.random() * fonte.length)];
    ui.pista.hidden = true;
    if (!(await escrever("Pista: " + alvo.pista, "", ui.pista))) return;
    ui.pista.hidden = false;
    if (!(await escrever("Qual criatura do seu time corresponde a ela? Você tem " + TEMPO_TURNO + " segundos."))) return;
    if (sessaoAtual !== sessao) return;
    montarOpcoes();
    fase = "escolha";
    iniciarTimer();
  }

  // Resolve a escolha (ou o tempo esgotado, com escolhida = null).
  async function resolverTurno(escolhida, botao) {
    if (fase !== "escolha") return;
    const sessaoAtual = sessao;
    fase = "ocupado";
    pararTimer();
    travarOpcoes();
    ui.pista.hidden = true;
    ui.pista.textContent = "";
    ui.tempo.textContent = "";

    const acerto = escolhida !== null && escolhida === alvo;

    if (escolhida) {
      mostrarCriaturaAtiva(escolhida);
      await animar(ui.spriteJogador, "entra-jogador", 500);
      if (sessaoAtual !== sessao) return;
      if (botao) botao.classList.add(acerto ? "certa" : "errada");
      if (!(await escrever("Vai, " + escolhida.nome + "!"))) return;
      await esperar(300);
    }

    if (acerto) {
      const dano = superEfetivo(escolhida.tipo, inimigo.tipo) ? DANO_SUPER_EFETIVO : DANO_NORMAL;
      await animar(ui.spriteJogador, "ataca-jogador", 400);
      await animar(ui.spriteInimigo, "pisca", 600);
      if (sessaoAtual !== sessao) return;
      hpInimigo = Math.max(0, hpInimigo - dano);
      atualizarInimigoHP();
      mostrarDano("inimigo", "-" + dano);
      pontos += PONTOS_ACERTO;
      atualizarPlacar();
      const texto = escolhida.nome + " acertou em cheio!" + (dano === DANO_SUPER_EFETIVO ? " Super efetivo!" : "");
      if (!(await escrever(texto, "bom"))) return;
      await esperar(500);
      if (sessaoAtual !== sessao) return;
      if (hpInimigo <= 0) {
        await derrotarInimigo(sessaoAtual);
        return;
      }
    } else {
      const motivo = escolhida ? escolhida.nome + " não é efetivo..." : "O tempo acabou!";
      if (!(await escrever(motivo, "ruim"))) return;
      await esperar(400);
      await animar(ui.spriteInimigo, "ataca-inimigo", 400);
      if (sessaoAtual !== sessao) return;
      hp -= DANO_ERRO;
      atualizarHP();
      mostrarDano("jogador", "-" + DANO_ERRO);
      await animar(ui.spriteJogador, "treme", 400);
      if (!(await escrever("O inimigo contra-atacou! Você perdeu " + DANO_ERRO + " HP.", "ruim"))) return;
      await esperar(400);
      if (sessaoAtual !== sessao) return;
      if (hp <= 0) {
        terminar(false);
        return;
      }
    }

    novaPergunta();
  }

  // ---------- Inimigos ----------
  async function novoInimigo() {
    const sessaoAtual = sessao;
    fase = "ocupado";
    inimigo = inimigos[indice];
    const chefe = indice === INIMIGOS_PARA_VENCER - 1;
    maxHpInimigo = chefe ? HP_CHEFE : HP_INIMIGO;
    hpInimigo = maxHpInimigo;

    ui.tipoInimigo.textContent = (chefe ? "Chefe · " : "") + "Tipo: " + inimigo.tipo;
    ui.tipoInimigo.className = "tipo " + (CLASSE_TIPO[inimigo.tipo] || "");
    ui.nomeInimigo.textContent = "???";
    ui.nomeInimigo.classList.remove("revelado");
    ui.spriteInimigo.classList.remove("desmaia");
    ui.spriteInimigo.innerHTML = svgCriatura(CORES_TIPO[inimigo.tipo], Math.floor(Math.random() * FORMAS.length));
    atualizarInimigoHP();
    ui.opcoes.textContent = "";
    pararTimer();
    ui.tempo.textContent = "";

    await animar(ui.spriteInimigo, "entra", 500);
    if (sessaoAtual !== sessao) return;
    const apresentacao = (chefe ? "Um chefe do tipo " : "Um inimigo do tipo ") + inimigo.tipo + " apareceu!";
    if (!(await escrever(apresentacao))) return;
    await esperar(400);
    if (sessaoAtual !== sessao) return;
    novaPergunta();
  }

  async function derrotarInimigo(sessaoAtual) {
    const chefe = indice === INIMIGOS_PARA_VENCER - 1;
    fase = "ocupado";
    ui.nomeInimigo.textContent = inimigo.nome.toUpperCase();
    ui.nomeInimigo.classList.add("revelado");
    ui.spriteInimigo.classList.add("desmaia");
    pontos += chefe ? PONTOS_CHEFE : PONTOS_INIMIGO;
    vencidos += 1;
    const jaNoTime = time.includes(inimigo);
    if (!jaNoTime) time.push(inimigo);
    atualizarPlacar();
    const texto = "O inimigo " + inimigo.nome + " foi derrotado!" + (jaNoTime ? "" : " " + inimigo.nome + " entrou no seu time.");
    if (!(await escrever(texto, "bom"))) return;
    await esperar(1000);
    if (sessaoAtual !== sessao) return;

    indice += 1;
    if (indice >= INIMIGOS_PARA_VENCER) {
      terminar(true);
    } else {
      novoInimigo();
    }
  }

  // ---------- Fim e reinício ----------
  async function terminar(venceu) {
    const sessaoAtual = sessao;
    fase = "fim";
    pararTimer();
    travarOpcoes();
    if (venceu) {
      ui.fimTitulo.textContent = "Vitória!";
      ui.fimTexto.textContent = "Você derrotou " + INIMIGOS_PARA_VENCER + " inimigos, incluindo o chefe, com " + Math.max(0, hp) + " HP. Pontuação final: " + pontos + ".";
      await escrever("Você venceu a batalha!", "bom");
    } else {
      ui.fimTitulo.textContent = "Derrota";
      ui.fimTexto.textContent = "Seu time caiu após " + vencidos + " de " + INIMIGOS_PARA_VENCER + " inimigos. Pontuação: " + pontos + ".";
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

    time = embaralhar(TERMOS).slice(0, TIME_INICIAL);
    inimigos = embaralhar(TERMOS).slice(0, INIMIGOS_PARA_VENCER);
    indice = 0;
    hp = HP_INICIAL;
    pontos = 0;
    vencidos = 0;
    fase = "ocupado";
    ui.nomeJogador.textContent = "Seu time";
    ui.spriteJogador.innerHTML = "";
    ui.spriteJogador.classList.remove("desmaia");
    atualizarHP();
    atualizarPlacar();
    novoInimigo();
  }

  // ---------- Eventos ----------
  function pularDialogo() {
    pularTexto = true;
  }

  ui.caixaTexto.addEventListener("click", pularDialogo);
  ui.caixaTexto.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pularDialogo();
    }
  });
  // Esc não fecha o modal de fim: o jogador precisa usar "Jogar de novo".
  ui.fim.addEventListener("cancel", (e) => e.preventDefault());
  ui.btnReiniciar.addEventListener("click", reiniciar);
  ui.fimReiniciar.addEventListener("click", reiniciar);

  reiniciar();
})();
