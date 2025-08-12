let lojaCNPJ = '';

// As credenciais agora serão gerenciadas pelo backend
// const CREDENCIAIS = { ... };

window.onload = function () {
    // A lógica de carregamento inicial será refeita
};

function fazerLogin() {
    const cnpj = document.getElementById('cnpj').value;
    const senha = document.getElementById('senha').value;

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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
    document.getElementById('login').style.display = 'none';
    document.getElementById('cadastroLoja').style.display = 'none';
    document.getElementById('cadastro').style.display = 'none';
    document.getElementById('estoque').style.display = 'none';
    
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'estoque') {
        carregarEstoque();
        marcarBotaoAtivo('btn-estoque');
    } else if (tabName === 'cadastro') {
        marcarBotaoAtivo('btn-cadastro');
    }
}

function salvarLoja() {
    const cnpj = document.getElementById('cnpjCadastro').value;
    const senha = document.getElementById('senhaCadastro').value;

    if (!cnpj || !senha) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    fetch('http://localhost:3000/api/cadastroLoja', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cnpj, senha })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (response.ok) {
            showTab('login');
        }
    })
    .catch(error => {
        console.error('Erro ao cadastrar loja:', error);
        alert('Erro ao cadastrar loja.');
    });
}


function marcarBotaoAtivo(id) {
    document.getElementById('btn-cadastro').classList.remove('active');
    document.getElementById('btn-estoque').classList.remove('active');
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

    fetch('http://localhost:3000/api/estoque', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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
        fetch(`http://localhost:3000/api/estoque/${codigo}`, {
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

// Essa função agora busca os dados do backend
function carregarEstoque(filtro = '') {
    fetch(`http://localhost:3000/api/estoque/${lojaCNPJ}`)
    .then(response => response.json())
    .then(estoqueData => {
        renderEstoque(estoqueData, filtro);
    })
    .catch(error => {
        console.error('Erro ao carregar o estoque:', error);
        document.getElementById('listaEstoque').innerHTML = '<li><em>Erro ao carregar o estoque.</em></li>';
    });
}

function startScanner() {
    const cameraDiv = document.getElementById('camera');
    cameraDiv.innerHTML = '';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: cameraDiv,
            constraints: {
                facingMode: "environment"
            }
        },
        decoder: {
            readers: ["ean_reader", "code_128_reader", "upc_reader"]
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        locate: true,
        numOfWorkers: (navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4)
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