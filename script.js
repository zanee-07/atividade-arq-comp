(function () {
  // Regras do jogo
  const HP_INICIAL = 100;
  const DANO_ERRO = 25;
  const CUSTO_PISTA = 10;
  const PONTOS_SEM_PISTA = 100;
  const PONTOS_COM_PISTA = 50;
  const TAM_TIME = 4;
  const PAUSA_ENTRE_RODADAS = 1200;

  const CLASSE_TIPO = {
    "Processamento": "tipo-processamento",
    "Memória": "tipo-memoria",
    "Armazenamento": "tipo-armazenamento",
    "Comunicação": "tipo-comunicacao"
  };

  const el = (id) => document.getElementById(id);
  const ui = {
    derrotados: el("derrotados"),
    total: el("total"),
    tipoInimigo: el("tipo-inimigo"),
    avatar: el("avatar-inimigo"),
    nomeOculto: document.querySelector(".nome-oculto"),
    vidaInimigo: el("vida-inimigo"),
    pista: el("pista"),
    btnPista: el("btn-pista"),
    vidaJogador: el("vida-jogador"),
    vidaTexto: el("vida-jogador-texto"),
    opcoes: el("opcoes"),
    mensagem: el("mensagem"),
    pontos: el("pontos"),
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
  let pistaRevelada = false;
  let rodadaAtiva = false;
  let timer = null;

  function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function mostrarMensagem(texto, tipo) {
    ui.mensagem.textContent = texto;
    ui.mensagem.className = "mensagem " + (tipo || "");
  }

  function atualizarBarras() {
    const percentual = Math.max(0, (hp / HP_INICIAL) * 100);
    ui.vidaJogador.style.width = percentual + "%";
    ui.vidaJogador.classList.toggle("baixa", percentual <= 30);
    ui.vidaTexto.textContent = "HP " + Math.max(0, hp);
    ui.pontos.textContent = pontos;
    ui.derrotados.textContent = derrotados;
    ui.total.textContent = TERMOS.length;
    if (rodadaAtiva && !pistaRevelada) {
      ui.btnPista.disabled = hp <= CUSTO_PISTA;
    }
  }

  function inimigoAtual() {
    return fila[indice];
  }

  function montarRodada() {
    const inimigo = inimigoAtual();
    pistaRevelada = false;
    rodadaAtiva = true;

    ui.tipoInimigo.textContent = "Tipo: " + inimigo.tipo;
    ui.tipoInimigo.className = "tipo " + (CLASSE_TIPO[inimigo.tipo] || "");
    ui.avatar.textContent = "?";
    ui.avatar.className = "avatar " + (CLASSE_TIPO[inimigo.tipo] || "");
    ui.nomeOculto.textContent = "???";
    ui.vidaInimigo.style.width = "100%";
    ui.pista.hidden = true;
    ui.pista.textContent = "";
    ui.btnPista.disabled = false;
    ui.btnPista.textContent = "Revelar pista (−" + CUSTO_PISTA + " HP)";

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

    mostrarMensagem("Escolha a criatura que derrota este inimigo.", "");
    atualizarBarras();
  }

  function escolher(criatura, botao) {
    if (!rodadaAtiva || botao.disabled) return;
    const inimigo = inimigoAtual();

    if (criatura === inimigo) {
      rodadaAtiva = false;
      const ganho = pistaRevelada ? PONTOS_COM_PISTA : PONTOS_SEM_PISTA;
      pontos += ganho;
      derrotados += 1;
      botao.classList.add("certa");
      ui.opcoes.querySelectorAll("button").forEach((b) => (b.disabled = true));
      ui.btnPista.disabled = true;
      ui.nomeOculto.textContent = inimigo.nome.toUpperCase();
      ui.avatar.classList.add("derrotado");
      ui.vidaInimigo.style.width = "0%";
      mostrarMensagem("Super efetivo! " + inimigo.nome + " foi derrotado. +" + ganho + " pontos.", "bom");
      atualizarBarras();

      timer = setTimeout(() => {
        indice += 1;
        if (indice >= fila.length) {
          terminar(true);
        } else {
          montarRodada();
        }
      }, PAUSA_ENTRE_RODADAS);
      return;
    }

    botao.classList.add("errada");
    botao.disabled = true;
    hp -= DANO_ERRO;
    mostrarMensagem("Não afetou. Você perdeu " + DANO_ERRO + " HP.", "ruim");
    ui.avatar.classList.remove("tremer");
    void ui.avatar.offsetWidth;
    ui.avatar.classList.add("tremer");
    atualizarBarras();

    if (hp <= 0) {
      rodadaAtiva = false;
      ui.opcoes.querySelectorAll("button").forEach((b) => (b.disabled = true));
      ui.btnPista.disabled = true;
      terminar(false);
    }
  }

  function revelarPista() {
    if (!rodadaAtiva || pistaRevelada) return;
    if (hp <= CUSTO_PISTA) {
      mostrarMensagem("HP insuficiente para revelar a pista.", "ruim");
      ui.btnPista.disabled = true;
      return;
    }
    hp -= CUSTO_PISTA;
    pistaRevelada = true;
    ui.pista.textContent = inimigoAtual().pista;
    ui.pista.hidden = false;
    ui.btnPista.disabled = true;
    ui.btnPista.textContent = "Pista revelada";
    atualizarBarras();
  }

  function terminar(venceu) {
    if (venceu) {
      ui.fimTitulo.textContent = "Vitória!";
      ui.fimTexto.textContent = "Você derrotou todos os " + TERMOS.length + " inimigos com " + Math.max(0, hp) + " HP restantes. Pontuação final: " + pontos + ".";
    } else {
      ui.fimTitulo.textContent = "Derrota";
      ui.fimTexto.textContent = "Seu time caiu após " + derrotados + " de " + TERMOS.length + " inimigos. Pontuação: " + pontos + ".";
    }
    if (typeof ui.fim.showModal === "function") {
      ui.fim.showModal();
    }
  }

  function reiniciar() {
    clearTimeout(timer);
    if (ui.fim.open) ui.fim.close();
    fila = embaralhar(TERMOS);
    indice = 0;
    hp = HP_INICIAL;
    pontos = 0;
    derrotados = 0;
    ui.avatar.classList.remove("derrotado");
    montarRodada();
  }

  // Esc não fecha o modal de fim: o jogador precisa usar "Jogar de novo".
  ui.fim.addEventListener("cancel", (e) => e.preventDefault());
  ui.btnPista.addEventListener("click", revelarPista);
  ui.btnReiniciar.addEventListener("click", reiniciar);
  ui.fimReiniciar.addEventListener("click", reiniciar);

  reiniciar();
})();
