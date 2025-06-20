let estoque = [];

window.onload = function () {
    carregarEstoque();
};

function showTab(tabName) {
    document.getElementById('cadastro').style.display = 'none';
    document.getElementById('estoque').style.display = 'none';
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'estoque') {
        renderEstoque();
    }
}

function salvarProduto() {
    const nome = document.getElementById('nomeProduto').value.trim();
    const codigo = document.getElementById('codigoBarras').value.trim();

    if (nome && codigo) {
        estoque.push({ nome, codigo });
        salvarNoLocalStorage();
        alert('Produto salvo!');
        document.getElementById('nomeProduto').value = '';
        document.getElementById('codigoBarras').value = '';
        stopScanner();
    } else {
        alert('Preencha o nome e o código de barras!');
    }
}

function renderEstoque() {
    const lista = document.getElementById('listaEstoque');
    lista.innerHTML = '';

    estoque.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${item.nome} - Código: ${item.codigo}`;
        lista.appendChild(li);
    });
}

function salvarNoLocalStorage() {
    localStorage.setItem('estoquePizzaria', JSON.stringify(estoque));
}

function carregarEstoque() {
    const dadosSalvos = localStorage.getItem('estoquePizzaria');
    if (dadosSalvos) {
        estoque = JSON.parse(dadosSalvos);
    }
}

// --------- Barcode Scanner com QuaggaJS ---------
function startScanner() {
    const cameraDiv = document.getElementById('camera');
    cameraDiv.innerHTML = '';

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: cameraDiv
        },
        decoder: {
            readers: ["ean_reader"]
        }
    }, function (err) {
        if (err) {
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
