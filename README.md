Sistema de Gestão de Armazém (WMS)
Este é um sistema de gestão de armazém (WMS) simples e baseado na web, projetado para pequenas empresas. Ele foi aprimorado com um backend Node.js, garantindo que o estoque seja armazenado de forma persistente.

Funcionalidades ✨
Cadastro de Produtos: Registre produtos com nome, código de barras, rua de armazenamento e quantidade.

Leitura de Código de Barras: Utilize sua webcam para escanear códigos de barras de forma precisa.

Gestão de Estoque: Visualize, filtre e gerencie seu estoque de forma eficiente.

Persistência de Dados: Os dados são salvos em um banco de dados simples (Lowdb), persistindo mesmo após o fechamento do navegador.

Exclusão de Produtos: Remova produtos do estoque conforme necessário.

Tecnologias Utilizadas 💻
Front-end :

HTML: Estrutura da página.

CSS: Estilização moderna e responsiva.

JavaScript: Lógica de interação com o usuário e comunicação com o backend.

QuaggaJS: Biblioteca para leitura de código de barras em tempo real.

Backend :

Node.js: Servidor para gerenciar as requisições da aplicação.

Express: Framework para criar as rotas da API.

Lowdb: Banco de dados simples e baseado em arquivo JSON para persistência dos dados.

Como Usar ▶️
Configurar o Backend :

Abra o terminal na pasta do projeto e instale as dependências: npm install.

Inicie o servidor Node.js: node server.js.

Abra o Frontend :

Abra o arquivo index.html em seu navegador de preferência (Google Chrome ou Firefox).

Uso do sistema :

Na tela de login, insira as credenciais de exemplo.

Vá para a aba "Cadastro de Produto" para adicionar novos itens.

Use a opção de "Ler Código de Barras" para escanear com a webcam.

Acesse a aba "Estoque" para ver e gerenciar a lista de produtos.