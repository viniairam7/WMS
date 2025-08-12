const express = require('express');
const cors = require('cors');

// Importação corrigida para lowdb v5+
const { LowSync, JSONFileSync } = require('lowdb');

const file = 'db.json';
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter);

async function inicializarDB() {
    db.read();
    db.data ||= { estoque: [], lojas: {} }; // Adicionando 'lojas' para armazenar credenciais
    db.write();
}

inicializarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Rota para obter todos os produtos do estoque de uma loja específica
app.get('/api/estoque/:cnpj', (req, res) => {
    db.read();
    const { cnpj } = req.params;
    const estoqueLoja = db.data.estoque.filter(p => p.cnpj === cnpj);
    res.json(estoqueLoja);
});

// Rota para adicionar ou atualizar um produto
app.post('/api/estoque', (req, res) => {
    db.read();
    const { cnpj, nome, codigo, rua, quantidade } = req.body;
    
    // Filtra o estoque para a loja específica
    const estoqueLoja = db.data.estoque.filter(p => p.cnpj === cnpj);
    const produtoExistente = estoqueLoja.find(p => p.codigo === codigo);
    
    if (produtoExistente) {
        // Se existir, atualiza a quantidade
        produtoExistente.quantidade += quantidade;
    } else {
        // Se não existir, adiciona um novo produto com o CNPJ da loja
        db.data.estoque.push({ cnpj, nome, codigo, rua, quantidade });
    }
    db.write();
    res.status(200).json({ message: 'Produto salvo com sucesso!' });
});

// Rota para remover um produto
app.delete('/api/estoque/:codigo', (req, res) => {
    db.read();
    const { codigo } = req.params;
    db.data.estoque = db.data.estoque.filter(p => p.codigo !== codigo);
    db.write();
    res.status(200).json({ message: 'Produto removido com sucesso.' });
});

// Rota para cadastrar uma nova loja
app.post('/api/cadastroLoja', (req, res) => {
    db.read();
    const { cnpj, senha } = req.body;

    if (db.data.lojas[cnpj]) {
        return res.status(409).json({ message: 'Este CNPJ já está cadastrado.' });
    }
    
    db.data.lojas[cnpj] = senha;
    db.write();
    res.status(201).json({ message: 'Loja cadastrada com sucesso!' });
});

// Rota para login da loja
app.post('/api/login', (req, res) => {
    db.read();
    const { cnpj, senha } = req.body;

    if (db.data.lojas[cnpj] && db.data.lojas[cnpj] === senha) {
        return res.status(200).json({ message: 'Login bem-sucedido.' });
    }

    res.status(401).json({ message: 'CNPJ ou senha incorretos.' });
});

// ==================================================
// ROTA PARA A NOVA FUNCIONALIDADE DE BUSCA
// ==================================================
app.get('/api/estoque/buscar/:codigo', (req, res) => {
    db.read();
    const { codigo } = req.params;
    const produto = db.data.estoque.find(p => p.codigo === codigo);

    if (produto) {
        res.status(200).json(produto);
    } else {
        res.status(404).json({ message: 'Produto não encontrado.' });
    }
});


app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
});