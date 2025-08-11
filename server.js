const express = require('express');
const cors = require('cors');

// Importação corrigida para lowdb v5+
const { LowSync, JSONFileSync } = require('lowdb');

const file = 'db.json';
const adapter = new JSONFileSync(file);
const db = new LowSync(adapter);

async function inicializarDB() {
    db.read();
    db.data ||= { estoque: [] };
    db.write();
}

inicializarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/api/estoque', (req, res) => {
    db.read();
    res.json(db.data.estoque);
});

app.post('/api/estoque', (req, res) => {
    db.read();
    const { nome, codigo, rua, quantidade } = req.body;
    
    const produtoExistente = db.data.estoque.find(p => p.codigo === codigo);
    
    if (produtoExistente) {
        produtoExistente.quantidade += quantidade;
    } else {
        db.data.estoque.push({ nome, codigo, rua, quantidade });
    }
    db.write();
    res.status(200).json({ message: 'Produto salvo com sucesso!' });
});

app.delete('/api/estoque/:codigo', (req, res) => {
    db.read();
    const { codigo } = req.params;
    db.data.estoque = db.data.estoque.filter(p => p.codigo !== codigo);
    db.write();
    res.status(200).json({ message: 'Produto removido com sucesso.' });
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
});