import { join, dirname } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../db/movimentacoes.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);


await db.read();
db.data ||= { movimentacoes: [] };
await db.write();

export async function registrarMovimentacao({
  tipo, produtoCodigo, quantidade, origem, destino, motivo
}) {
  const novaMov = {
    id: nanoid(),
    tipo, 
    produtoCodigo,
    quantidade,
    origem: origem || null,
    destino: destino || null,
    motivo: motivo || '',
    data: new Date().toISOString()
  };

  db.data.movimentacoes.push(novaMov);
  await db.write();
  return novaMov;
}

export async function buscarHistoricoPorProduto(codigoProduto) {
  await db.read();
  return db.data.movimentacoes.filter(m => m.produtoCodigo === codigoProduto);
}
