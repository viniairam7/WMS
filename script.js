let estoque = [];

window.onload = function () {
    carregarEstoque();
    showTab('cadastro');
    marcarBotaoAtivo('btn-cadastro');
};

function showTab(tabName) {
    document.getElementById('cadastro').style.display = 'none';
    document.getElementById('estoque').style.display = 'none';
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'estoque') {
        renderEstoque();
        marcarBotaoAtivo('btn-estoque');
    } else {
        marcarBotaoAtivo('btn-cadastro');
    }
}

function marcarBotaoAtivo(id) {
    document.getElementById('btn-cadastro').classList.remove('active');
    document.getElementById('btn-estoque').classList.remove('active');
    document.getElementById(id).classList.add('active');
}

function salvarProduto() {
    const nome = document.getElementById('nomeProduto').value.trim();
    const codigo = document.getElementById('codigoBarras').value.trim();
    const quantidade = parseInt(document.getElementById('quantidade').value);

    if (!nome) {
        alert('Por favor, preencha o nome do produto.');
        return;
    }
    if (!codigo) {
        alert('Por favor, preencha o código de barras.');
        return;
    }
    if (!quantidade || quantidade <= 0) {
        alert('Quantidade inválida.');
        return;
    }

    // Verifica se o produto já existe (pelo código)
    const idx = estoque.findIndex(p => p.codigo === codigo);
    if (idx >= 0) {
        // Atualiza quantidade do produto existente
        estoque[idx].quantidade += quantidade;
    } else {
        // Adiciona novo produto
        estoque.push({ nome, codigo, quantidade });
    }

    salvarNoLocalStorage();
    alert('Produto salvo com sucesso!');
    limparFormulario();
    stopScanner();
}

function limparFormulario() {
    document.getElementById('nomeProduto').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('quantidade').value = 1;
}

function renderEstoque(filtrarTexto = '') {
    const lista = document.getElementById('listaEstoque');
    lista.innerHTML = '';

    let filtrado = estoque;
    if (filtrarTexto) {
        filtrado = estoque.filter(item =>
            item.nome.toLowerCase().includes(filtrarTexto.toLowerCase()) ||
            item.codigo.includes(filtrarTexto)
        );
    }

    if (filtrado.length === 0) {
        lista.innerHTML = '<li><em>Nenhum produto encontrado.</em></li>';
        return;
    }

    filtrado.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nome}</strong><br />
                Código: ${item.codigo}<br />
                Quantidade: ${item.quantidade}
            </div>
            <button onclick="removerProduto('${item.codigo}')">Excluir</button>
        `;
        lista.appendChild(li);
    });
}

function filtrarEstoque() {
    const texto = document.getElementById('filtro').value.trim();
    renderEstoque(texto);
}

function removerProduto(codigo) {
    if (confirm('Deseja realmente excluir este produto?')) {
        estoque = estoque.filter(p => p.codigo !== codigo);
        salvarNoLocalStorage();
        renderEstoque();
    }
}

function salvarNoLocalStorage() {
    localStorage.setItem('estoquePizzaria', JSON.stringify(estoque));
}

function carregarEstoque() {
    const dados = localStorage.getItem('estoquePizzaria');
    if (dados) {
        estoque = JSON.parse(dados);
    }
}

// --------- Scanner de código de barras ---------
function startScanner() {
    const cameraDiv = document.getElementById('camera');
    cameraDiv.innerHTML = '';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: cameraDiv,
            constraints: {
                facingMode: "environment" // usar câmera traseira (celular)
            }
        },
        decoder: {
            readers: ["ean_reader", "code_128_reader", "upc_reader"]
        }
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
        document.getElementById('codigoBarras').value = codigo;
        alert(`Código detectado: ${codigo}`);
        stopScanner();
    });
}

function stopScanner() {
    if (Quagga.running) {
        Quagga.stop();
    }
}
