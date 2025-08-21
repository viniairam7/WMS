let lojaCNPJ = '';

window.onload = function () {};

function fazerLogin() {
    const cnpj = document.getElementById('cnpj').value;
    const senha = document.getElementById('senha').value;

    fetch('https://wmsback2.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, senha })
    })
    .then(response => {
        if (response.status === 200) {
            lojaCNPJ = cnpj;
            document.getElementById('login').style.display = 'none';
            document.getElementById('mainTabs').style.display = 'flex';
            carregarEstoque();
            showTab('cadastro');
        } else {
            return response.json().then(data => alert(data.message));
        }
    })
    .catch(error => {
        console.error('Erro de login:', error);
        alert('Erro ao tentar fazer login.');
    });
}

function showTab(tabName) {
    const tabs = ['login', 'cadastroLoja', 'cadastro', 'estoque', 'buscarProduto', 'movimentacoes', 'picking']; 
    tabs.forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'estoque') {
        carregarEstoque();
        marcarBotaoAtivo('btn-estoque');
    } else if (tabName === 'cadastro') {
        marcarBotaoAtivo('btn-cadastro');
    } else if (tabName === 'buscarProduto') {
        marcarBotaoAtivo('btn-buscar');
        document.getElementById('resultadoBusca').innerHTML = '';
        document.getElementById('codigoBarrasBusca').value = '';
    } else if (tabName === 'movimentacoes') {
        marcarBotaoAtivo('btn-movimentacoes');
        document.getElementById('historicoResultado').innerHTML = '';
    }
}


function salvarLoja() {
    const cnpj = document.getElementById('cnpjCadastro').value;
    const senha = document.getElementById('senhaCadastro').value;

    if (!cnpj || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    fetch('https://wmsback2.onrender.com/api/cadastroLoja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj, senha })
    })
    .then(response => response.ok ? response.json() : Promise.reject('Erro ao cadastrar loja.'))
    .then(data => {
        alert(data.message);
        showTab('login');
    })
    .catch(error => {
        console.error('Erro ao cadastrar loja:', error);
        alert('Erro ao cadastrar loja.');
    });
}

function marcarBotaoAtivo(id) {
    ['btn-cadastro', 'btn-estoque', 'btn-buscar', 'btn-movimentacoes', 'btn-picking'].forEach(btn => {
        const el = document.getElementById(btn);
        if (el) el.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}


function salvarProduto() {
    const nome = document.getElementById('nomeProduto').value.trim();
    const codigo = document.getElementById('codigoBarras').value.trim();
    const rua = document.getElementById('ruaProduto').value.trim();
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome || !codigo || !rua || !quantidade || quantidade <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const novoProduto = { cnpj: lojaCNPJ, nome, codigo, rua, quantidade };

    fetch('https://wmsback2.onrender.com/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProduto)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        limparFormulario();
        stopScanner();
        carregarEstoque();
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar o produto.');
    });
}

function atualizarProduto(codigo) {
    const nome = document.getElementById('nomeProduto').value.trim();
    const rua = document.getElementById('ruaProduto').value.trim();
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome || !rua || !quantidade || quantidade <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    fetch(`https://wmsback2.onrender.com/api/estoque/${codigo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, rua, quantidade })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.mensagem || 'Produto atualizado com sucesso.');
        document.getElementById('codigoBarras').removeAttribute('readonly');
        document.getElementById('salvarProdutoBtn').innerText = 'Salvar Produto';
        document.getElementById('salvarProdutoBtn').onclick = salvarProduto;
        limparFormulario();
        carregarEstoque();
        showTab('estoque');
    })
    .catch(error => {
        console.error('Erro ao atualizar produto:', error);
        alert('Erro ao atualizar o produto.');
    });
}

function editarProduto(codigo) {
    fetch(`https://wmsback2.onrender.com/api/estoque/buscar/${codigo}`)
        .then(response => response.json())
        .then(produto => {
            if (!produto || !produto.codigo) {
                alert('Produto não encontrado.');
                return;
            }

            document.getElementById('nomeProduto').value = produto.nome;
            document.getElementById('codigoBarras').value = produto.codigo;
            document.getElementById('ruaProduto').value = produto.rua;
            document.getElementById('quantidade').value = produto.quantidade;

            document.getElementById('codigoBarras').setAttribute('readonly', true);
            document.getElementById('salvarProdutoBtn').innerText = 'Salvar Alterações';
            document.getElementById('salvarProdutoBtn').onclick = function () {
                atualizarProduto(produto.codigo);
            };

            showTab('cadastro');
        })
        .catch(error => {
            console.error('Erro ao buscar produto:', error);
            alert('Erro ao buscar produto.');
        });
}

function limparFormulario() {
    document.getElementById('nomeProduto').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('ruaProduto').value = '';
    document.getElementById('quantidade').value = 1;
}

function renderEstoque(estoque, filtrarTexto = '') {
    const lista = document.getElementById('listaEstoque');
    lista.innerHTML = '';

    let filtrado = estoque;
    if (filtrarTexto) {
        filtrado = estoque.filter(item =>
            item.nome.toLowerCase().includes(filtrarTexto.toLowerCase()) ||
            item.codigo.includes(filtrarTexto) ||
            item.rua.toLowerCase().includes(filtrarTexto.toLowerCase())
        );
    }

    if (filtrado.length === 0) {
        lista.innerHTML = '<li><em>Nenhum produto encontrado.</em></li>';
        return;
    }

    filtrado.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nome}</strong><br />
                Código: ${item.codigo}<br />
                Rua: ${item.rua}<br />
                Quantidade: ${item.quantidade}
            </div>
            <button onclick="editarProduto('${item.codigo}')">Editar</button>
            <button onclick="removerProduto('${item.codigo}')">Excluir</button>
        `;
        lista.appendChild(li);
    });
}

function filtrarEstoque() {
    const texto = document.getElementById('filtro').value.trim();
    carregarEstoque(texto);
}

function removerProduto(codigo) {
    if (confirm('Deseja realmente excluir este produto?')) {
        fetch(`https://wmsback2.onrender.com/api/estoque/${lojaCNPJ}/${codigo}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            carregarEstoque();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao remover o produto.');
        });
    }
}

function carregarEstoque(filtro = '') {
    fetch(`https://wmsback2.onrender.com/api/estoque/${lojaCNPJ}`)
    .then(response => response.json())
    .then(estoqueData => {
        renderEstoque(estoqueData, filtro);
    })
    .catch(error => {
        console.error('Erro ao carregar o estoque:', error);
        document.getElementById('listaEstoque').innerHTML = '<li><em>Erro ao carregar o estoque.</em></li>';
    });
}

function buscarProdutoPorCodigo() {
    const codigo = document.getElementById('codigoBarrasBusca').value.trim();
    if (!codigo) {
        alert('Por favor, insira um código de barras.');
        return;
    }

    fetch(`https://wmsback2.onrender.com/api/estoque/buscar/${codigo}`)
        .then(response => response.json())
        .then(data => {
            const resultadoDiv = document.getElementById('resultadoBusca');
            if (data.rua) {
                resultadoDiv.innerHTML = `
                    <p><strong>Nome:</strong> ${data.nome}</p>
                    <p><strong>Código:</strong> ${data.codigo}</p>
                    <p><strong>Localização:</strong> Rua ${data.rua}</p>
                    <p><strong>Quantidade:</strong> ${data.quantidade}</p>
                `;
            } else {
                resultadoDiv.innerHTML = `<p><em>${data.message}</em></p>`;
            }
        })
        .catch(error => {
            console.error('Erro na busca:', error);
            alert('Erro ao buscar o produto.');
        });
}

function startScannerBusca() {
    const cameraDiv = document.getElementById('camera');
    cameraDiv.innerHTML = '';

    Quagga.init({
        inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: cameraDiv,
            constraints: { facingMode: 'environment' }
        },
        decoder: {
            readers: ['ean_reader', 'code_128_reader', 'upc_reader']
        },
        locate: true
    }, function (err) {
        if (err) {
            alert('Erro ao iniciar o scanner: ' + err);
            console.error(err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function (data) {
        const codigo = data.codeResult.code;
        document.getElementById('codigoBarrasBusca').value = codigo;
        alert(`Código detectado: ${codigo}`);
        stopScannerBusca();
        buscarProdutoPorCodigo();
    });
}

function stopScannerBusca() {
    if (Quagga.running) Quagga.stop();
}

function stopScanner() {
    if (Quagga.running) Quagga.stop();
}

const movimentacaoAPI = 'https://wmsback2.onrender.com/api/movimentacoes';

function registrarEntrada() {
    const produtoCodigo = document.getElementById('entradaCodigo').value;
    const quantidade = parseInt(document.getElementById('entradaQuantidade').value);
    const motivo = document.getElementById('entradaMotivo').value;
    const destino = {
        rua: document.getElementById('entradaRua').value,
        coluna: parseInt(document.getElementById('entradaColuna').value),
        posicao: parseInt(document.getElementById('entradaPosicao').value)
    };

    fetch(`${movimentacaoAPI}/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoCodigo, quantidade, destino, motivo })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Entrada registrada com sucesso');
    })
    .catch(err => {
        console.error('Erro na entrada:', err);
        alert('Erro ao registrar entrada.');
    });
}

function registrarSaida() {
    const produtoCodigo = document.getElementById('saidaCodigo').value;
    const quantidade = parseInt(document.getElementById('saidaQuantidade').value);
    const motivo = document.getElementById('saidaMotivo').value;
    const origem = {
        rua: document.getElementById('saidaRua').value,
        coluna: parseInt(document.getElementById('saidaColuna').value),
        posicao: parseInt(document.getElementById('saidaPosicao').value)
    };

    fetch(`${movimentacaoAPI}/saida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoCodigo, quantidade, origem, motivo })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Saída registrada com sucesso');
    })
    .catch(err => {
        console.error('Erro na saída:', err);
        alert('Erro ao registrar saída.');
    });
}

function registrarTransferencia() {
    const produtoCodigo = document.getElementById('transfCodigo').value;
    const quantidade = parseInt(document.getElementById('transfQuantidade').value);
    const motivo = document.getElementById('transfMotivo').value;

    const origem = {
        rua: document.getElementById('transfOrigemRua').value,
        coluna: parseInt(document.getElementById('transfOrigemColuna').value),
        posicao: parseInt(document.getElementById('transfOrigemPosicao').value)
    };

    const destino = {
        rua: document.getElementById('transfDestinoRua').value,
        coluna: parseInt(document.getElementById('transfDestinoColuna').value),
        posicao: parseInt(document.getElementById('transfDestinoPosicao').value)
    };

    fetch(`${movimentacaoAPI}/transferencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoCodigo, quantidade, origem, destino, motivo })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Transferência registrada com sucesso');
    })
    .catch(err => {
        console.error('Erro na transferência:', err);
        alert('Erro ao registrar transferência.');
    });
}

function buscarHistoricoMovimentacao() {
    const codigo = document.getElementById('historicoCodigo').value;
    const lista = document.getElementById('historicoResultado');
    lista.innerHTML = 'Carregando...';

    fetch(`${movimentacaoAPI}/historico/${codigo}`)
        .then(res => res.json())
        .then(data => {
            lista.innerHTML = '';
            if (data.message) {
                lista.innerHTML = `<li>${data.message}</li>`;
            } else {
                data.forEach(mov => {
                    const li = document.createElement('li');
                    li.textContent = `${mov.tipo.toUpperCase()} - Qtd: ${mov.quantidade} - Motivo: ${mov.motivo} - Data: ${new Date(mov.data).toLocaleString()}`;
                    lista.appendChild(li);
                });
            }
        })
        .catch(err => {
            console.error('Erro no histórico:', err);
            lista.innerHTML = '<li>Erro ao buscar histórico</li>';
        });
}

function cadastrarEndereco() {
    const rua = document.getElementById('endRua').value;
    const coluna = parseInt(document.getElementById('endColuna').value);
    const posicao = parseInt(document.getElementById('endPosicao').value);

    fetch(`${movimentacaoAPI}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rua, coluna, posicao })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || 'Endereço cadastrado com sucesso');
    })
    .catch(err => {
        console.error('Erro no cadastro de endereço:', err);
        alert('Erro ao cadastrar endereço.');
    });
}

function criarPedido() {
  const raw = document.getElementById('pedidoItens').value;
  let itens;

  try {
    itens = JSON.parse(raw);
    if (!Array.isArray(itens)) throw new Error();
  } catch {
    alert("Formato inválido. Use: [{\"codigo\":\"123\", \"quantidade\":2}]");
    return;
  }

  fetch('https://wmsback2.onrender.com/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cnpj: lojaCNPJ, itens })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    document.getElementById('pedidoItens').value = '';
    carregarPedidos();
  });
}

function carregarPedidos() {
  fetch('https://wmsback2.onrender.com/api/pedidos')
    .then(res => res.json())
    .then(pedidos => {
      const lista = document.getElementById('listaPedidosPendentes');
      lista.innerHTML = '';
      pedidos
        .filter(p => p.status === 'pendente')
        .forEach(pedido => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>ID:</strong> ${pedido.id}<br>
            <strong>Itens:</strong> ${pedido.itens.map(i => `(${i.codigo} x${i.quantidade})`).join(', ')}<br>
            <button onclick="finalizarPedido('${pedido.id}')">Marcar como Separado</button>
          `;
          lista.appendChild(li);
        });
    });
}

function finalizarPedido(id) {
  fetch(`https://wmsback2.onrender.com/api/pedidos/${id}/finalizar`, {
    method: 'PUT'
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    carregarPedidos();
  });
}

