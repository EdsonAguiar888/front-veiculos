
// ========================================
// CONFIGURAÇÃO DA API
// ========================================

// IMPORTANTE:
// Não use require() do model Mongoose aqui.
// Este arquivo roda no navegador.
// O frontend conversa com o backend somente através da API HTTP.

const API_URL = "http://localhost:3000/veiculo";


// ========================================
// ELEMENTOS DO HTML
// ========================================

const formulario = document.querySelector("#form-veiculo");

const campoId = document.querySelector("#veiculo-id");
const campoNome = document.querySelector("#nome");
const campoMarca = document.querySelector("#marca");
const campoAno = document.querySelector("#ano");

const tituloFormulario =
  document.querySelector("#titulo-formulario");

const botaoSalvar =
  document.querySelector("#botao-salvar");

const botaoCancelar =
  document.querySelector("#botao-cancelar");

const listaVeiculos =
  document.querySelector("#lista-veiculos");

const mensagem =
  document.querySelector("#mensagem");

const formularioBusca =
  document.querySelector("#form-busca");

const campoBuscaId =
  document.querySelector("#busca-id");


// ========================================
// FUNÇÃO GENÉRICA PARA REQUISIÇÕES
// ========================================

async function fazerRequisicao(url, opcoes = {}) {

  console.log("Requisição para:", url);
  console.log("Opções:", opcoes);

  const resposta = await fetch(url, opcoes);

  console.log("Status da resposta:", resposta.status);

  if (!resposta.ok) {

    const erro =
      await resposta.json().catch(() => ({}));

    throw new Error(
      erro.mensagem ||
      erro.message ||
      "Não foi possível concluir a operação"
    );
  }

  // DELETE pode retornar 204
  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}


// ========================================
// MOSTRAR MENSAGEM
// ========================================

function mostrarMensagem(texto, erro = false) {

  mensagem.textContent = texto;

  mensagem.classList.toggle(
    "erro",
    erro
  );
}


// ========================================
// CRIAR CARD DO VEÍCULO
// ========================================

function criarVeiculo(veiculo) {

  const cartao =
    document.createElement("article");

  cartao.className = "veiculo";


  // Nome
  const nome =
    document.createElement("h3");

  nome.textContent =
    veiculo.nome;


  // Marca
  const marca =
    document.createElement("p");

  marca.textContent =
    `Marca: ${veiculo.marca}`;


  // Ano
  const ano =
    document.createElement("p");

  ano.textContent =
    `Ano: ${veiculo.ano ?? "Não informado"}`;


  // ID
  const id =
    document.createElement("p");

  id.textContent =
    `ID: ${veiculo._id}`;


  // Área dos botões
  const acoes =
    document.createElement("div");

  acoes.className =
    "acoes-veiculo";


  // Botão editar
  const botaoEditar =
    document.createElement("button");

  botaoEditar.type = "button";

  botaoEditar.textContent =
    "Editar";

  botaoEditar.addEventListener(
    "click",
    () => carregarVeiculoParaEdicao(veiculo._id)
  );


  // Botão excluir
  const botaoExcluir =
    document.createElement("button");

  botaoExcluir.type = "button";

  botaoExcluir.className =
    "perigo";

  botaoExcluir.textContent =
    "Excluir";

  botaoExcluir.addEventListener(
    "click",
    () => excluirVeiculo(veiculo._id)
  );


  acoes.append(
    botaoEditar,
    botaoExcluir
  );


  cartao.append(
    nome,
    marca,
    ano,
    id,
    acoes
  );


  return cartao;
}


// ========================================
// EXIBIR VEÍCULOS
// ========================================

function exibirVeiculos(veiculos) {

  listaVeiculos.innerHTML = "";


  if (!Array.isArray(veiculos)) {

    mostrarMensagem(
      "Resposta inválida da API",
      true
    );

    return;
  }


  if (veiculos.length === 0) {

    mostrarMensagem(
      "Nenhum veículo cadastrado"
    );

    return;
  }


  veiculos.forEach((veiculo) => {

    listaVeiculos.appendChild(
      criarVeiculo(veiculo)
    );

  });


  mostrarMensagem(
    `${veiculos.length} veículo(s) encontrado(s)`
  );
}


// ========================================
// LISTAR VEÍCULOS
// ========================================

async function listarVeiculos() {

  console.log("Iniciando listagem de veículos...");

  try {

    mostrarMensagem(
      "Carregando veículos..."
    );


    const veiculos =
      await fazerRequisicao(API_URL);


    console.log(
      "Veículos recebidos:",
      veiculos
    );


    exibirVeiculos(veiculos);

  } catch (erro) {

    console.error(
      "Erro ao listar veículos:",
      erro
    );


    listaVeiculos.innerHTML = "";


    mostrarMensagem(
      erro.message,
      true
    );
  }
}


// ========================================
// BUSCAR VEÍCULO POR ID
// ========================================

async function buscarVeiculoPorId(id) {

  console.log(
    "Buscando veículo:",
    id
  );


  const veiculo =
    await fazerRequisicao(
      `${API_URL}/${id}`
    );


  console.log(
    "Veículo encontrado:",
    veiculo
  );


  exibirVeiculos([
    veiculo
  ]);


  return veiculo;
}


// ========================================
// SALVAR VEÍCULO
// ========================================

async function salvarVeiculo(evento) {

  evento.preventDefault();


  // Monta objeto exatamente de acordo
  // com o model do backend

  const veiculo = {

    nome:
      campoNome.value.trim(),

    marca:
      campoMarca.value.trim(),

  };


  // Ano é opcional
  if (campoAno.value !== "") {

    veiculo.ano =
      Number(campoAno.value);

  }


  console.log(
    "Veículo enviado:",
    veiculo
  );


  const id =
    campoId.value;


  const estaEditando =
    Boolean(id);


  const url =
    estaEditando
      ? `${API_URL}/${id}`
      : API_URL;


  const metodo =
    estaEditando
      ? "PUT"
      : "POST";


  try {

    await fazerRequisicao(
      url,
      {

        method: metodo,

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(veiculo)

      }
    );


    limparFormulario();


    mostrarMensagem(
      estaEditando
        ? "Veículo atualizado com sucesso"
        : "Veículo cadastrado com sucesso"
    );


    await listarVeiculos();


  } catch (erro) {

    console.error(
      "Erro ao salvar veículo:",
      erro
    );


    mostrarMensagem(
      erro.message,
      true
    );
  }
}


// ========================================
// CARREGAR VEÍCULO PARA EDIÇÃO
// ========================================

async function carregarVeiculoParaEdicao(id) {

  try {

    const veiculo =
      await fazerRequisicao(
        `${API_URL}/${id}`
      );


    campoId.value =
      veiculo._id;


    campoNome.value =
      veiculo.nome;


    campoMarca.value =
      veiculo.marca;


    campoAno.value =
      veiculo.ano ?? "";


    tituloFormulario.textContent =
      "Editar Veículo";


    botaoSalvar.textContent =
      "Salvar alterações";


    botaoCancelar.classList.remove(
      "oculto"
    );


    campoNome.focus();


  } catch (erro) {

    console.error(
      "Erro ao carregar veículo:",
      erro
    );


    mostrarMensagem(
      erro.message,
      true
    );
  }
}


// ========================================
// EXCLUIR VEÍCULO
// ========================================

async function excluirVeiculo(id) {

  const confirmou =
    window.confirm(
      "Deseja excluir este veículo?"
    );


  if (!confirmou) {
    return;
  }


  try {

    await fazerRequisicao(
      `${API_URL}/${id}`,
      {
        method: "DELETE"
      }
    );


    limparFormulario();


    mostrarMensagem(
      "Veículo excluído com sucesso"
    );


    await listarVeiculos();


  } catch (erro) {

    console.error(
      "Erro ao excluir veículo:",
      erro
    );


    mostrarMensagem(
      erro.message,
      true
    );
  }
}


// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function limparFormulario() {

  formulario.reset();


  campoId.value = "";


  tituloFormulario.textContent =
    "Novo Veículo";


  botaoSalvar.textContent =
    "Cadastrar";


  botaoCancelar.classList.add(
    "oculto"
  );
}


// ========================================
// EVENTO DO FORMULÁRIO
// ========================================

formulario.addEventListener(
  "submit",
  salvarVeiculo
);


// ========================================
// BOTÃO CANCELAR
// ========================================

botaoCancelar.addEventListener(
  "click",
  limparFormulario
);


// ========================================
// BOTÃO ATUALIZAR
// ========================================

document
  .querySelector("#botao-atualizar")
  .addEventListener(
    "click",
    listarVeiculos
  );


// ========================================
// BOTÃO LIMPAR BUSCA
// ========================================

document
  .querySelector("#botao-limpar-busca")
  .addEventListener(
    "click",
    () => {

      campoBuscaId.value = "";

      listarVeiculos();

    }
  );


// ========================================
// BUSCAR POR ID
// ========================================

formularioBusca.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();


    const id =
      campoBuscaId.value.trim();


    if (!id) {

      mostrarMensagem(
        "Informe um ID para realizar a busca",
        true
      );

      return;
    }


    try {

      await buscarVeiculoPorId(id);


    } catch (erro) {

      console.error(
        "Erro ao buscar veículo:",
        erro
      );


      listaVeiculos.innerHTML = "";


      mostrarMensagem(
        erro.message,
        true
      );
    }

  }
);


// ========================================
// SERVICE WORKER
// ========================================

if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register(
    "sw.js"
  ).catch((erro) => {

    console.error(
      "Erro ao registrar Service Worker:",
      erro
    );

  });

}


// ========================================
// CARREGAR VEÍCULOS AO ABRIR A PÁGINA
// ========================================

listarVeiculos();

