import express from 'express';
import { registrarMovimentacao, buscarHistoricoPorProduto } from '../models/movimentacoes.js';
import { listarEnderecos, adicionarEndereco } from '../models/enderecos.js';

const router = express.Router();


router.post('/entrada', async (req, res) => {
  try {
    const { produtoCodigo, quantidade, destino, motivo } = req.body;

    if (!produtoCodigo || !quantidade || !destino) {
      return res.status(400).json({ message: 'Dados incompletos para entrada.' });
    }

    const entrada = await registrarMovimentacao({
      tipo: 'entrada',
      produtoCodigo,
      quantidade,
      destino,
      motivo
    });

    res.status(201).json({ message: 'Entrada registrada com sucesso.', entrada });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar entrada.', error: error.message });
  }
});

router.post('/saida', async (req, res) => {
  try {
    const { produtoCodigo, quantidade, origem, motivo } = req.body;

    if (!produtoCodigo || !quantidade || !origem) {
      return res.status(400).json({ message: 'Dados incompletos para saída.' });
    }

    const saida = await registrarMovimentacao({
      tipo: 'saida',
      produtoCodigo,
      quantidade,
      origem,
      motivo
    });

    res.status(201).json({ message: 'Saída registrada com sucesso.', saida });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar saída.', error: error.message });
  }
});


router.post('/transferencia', async (req, res) => {
  try {
    const { produtoCodigo, quantidade, origem, destino, motivo } = req.body;

    if (!produtoCodigo || !quantidade || !origem || !destino) {
      return res.status(400).json({ message: 'Dados incompletos para transferência.' });
    }

    const transferencia = await registrarMovimentacao({
      tipo: 'transferencia',
      produtoCodigo,
      quantidade,
      origem,
      destino,
      motivo
    });

    res.status(201).json({ message: 'Transferência registrada com sucesso.', transferencia });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar transferência.', error: error.message });
  }
});


router.get('/historico/:codigoProduto', async (req, res) => {
  try {
    const { codigoProduto } = req.params;
    const historico = await buscarHistoricoPorProduto(codigoProduto);

    if (historico.length === 0) {
      return res.status(404).json({ message: 'Nenhuma movimentação encontrada para este produto.' });
    }

    res.json(historico);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar histórico.', error: error.message });
  }
});


router.get('/enderecos', async (req, res) => {
  try {
    const enderecos = await listarEnderecos();
    res.json(enderecos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar endereços.', error: error.message });
  }
});

router.post('/enderecos', async (req, res) => {
  try {
    const { rua, coluna, posicao } = req.body;

    if (!rua || coluna == null || posicao == null) {
      return res.status(400).json({ message: 'Dados incompletos para cadastro de endereço.' });
    }

    const novoEndereco = await adicionarEndereco({ rua, coluna, posicao });
    res.status(201).json({ message: 'Endereço cadastrado com sucesso.', endereco: novoEndereco });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cadastrar endereço.', error: error.message });
  }
});

export default router;
