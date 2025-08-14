const express = require('express');
const cors = require('cors');
const path = require('path');
const { Low, JSONFile } = require('lowdb');

const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function inicializarDB() {
    await db.read();
    db.data ||= { estoque: [], lojas: {} };
    await db.write();
}

inicializarDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Rota para obter todos os produtos do estoque de uma loja específica
app.get('/api/estoque/:cnpj', async (req, res) => {
    await db.read();
    const { cnpj } = req.params;
    const estoqueLoja = db.data.estoque.filter(p => p.cnpj === cnpj);
    res.json(estoqueLoja);
});

// Rota para adicionar ou atualizar um produto
app.post('/api/estoque', async (req, res) => {
    await db.read();
    const { cnpj, nome, codigo, rua, quantidade } = req.body;
    
    const produtoExistente = db.data.estoque.find(p => p.codigo === codigo && p.cnpj === cnpj);
    
    if (produtoExistente) {
        produtoExistente.quantidade += quantidade;
    } else {
        db.data.estoque.push({ cnpj, nome, codigo, rua, quantidade });
    }
    await db.write();
    res.status(200).json({ message: 'Produto salvo com sucesso!' });
});

// Rota para remover um produto
app.delete('/api/estoque/:codigo', async (req, res) => {
    await db.read();
    const { codigo } = req.params;
    db.data.estoque = db.data.estoque.filter(p => p.codigo !== codigo);
    await db.write();
    res.status(200).json({ message: 'Produto removido com sucesso.' });
});

// Rota para cadastrar uma nova loja
app.post('/api/cadastroLoja', async (req, res) => {
    await db.read();
    const { cnpj, senha } = req.body;

    if (db.data.lojas[cnpj]) {
        return res.status(409).json({ message: 'Este CNPJ já está cadastrado.' });
    }
    
    db.data.lojas[cnpj] = senha;
    await db.write();
    res.status(201).json({ message: 'Loja cadastrada com sucesso!' });
});

// Rota para login da loja
app.post('/api/login', async (req, res) => {
    await db.read();
    const { cnpj, senha } = req.body;

    if (db.data.lojas[cnpj] && db.data.lojas[cnpj] === senha) {
        return res.status(200).json({ message: 'Login bem-sucedido.' });
    }

    res.status(401).json({ message: 'CNPJ ou senha incorretos.' });
});

app.get('/api/estoque/buscar/:codigo', async (req, res) => {
    await db.read();
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
