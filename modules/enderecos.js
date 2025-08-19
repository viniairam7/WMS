import { join, dirname } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../db/enderecos.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();
db.data ||= { enderecos: [] };
await db.write();

export async function listarEnderecos() {
  await db.read();
  return db.data.enderecos;
}

export async function adicionarEndereco({ rua, coluna, posicao }) {
  await db.read();
  const jaExiste = db.data.enderecos.some(e =>
    e.rua === rua && e.coluna === coluna && e.posicao === posicao
  );

  if (jaExiste) {
    throw new Error('Endereço já cadastrado.');
  }

  const novoEndereco = { rua, coluna, posicao };
  db.data.enderecos.push(novoEndereco);
  await db.write();
  return novoEndereco;
}
