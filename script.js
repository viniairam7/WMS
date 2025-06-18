let estoque = [];

function showTab(tabName) {
    document.getElementById('cadastro').style.display = 'none';
    document.getElementById('estoque').style.display = 'none';
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'estoque') {
        renderEstoque();
    }
}

function salvarProduto() {
    const nome = document.getElementById('nomeProduto').value;
    const codigo = document.getElementById('codigoBarras').value;

    if (nome && codigo) {
        estoque.push({ nome, codigo });
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
            readers: ["ean_reader"]  // Tipo de código de barras (exemplo: EAN para alimentos)
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
