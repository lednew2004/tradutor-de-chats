// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

//api do tradutoe
const translateApi = require('@vitalets/google-translate-api')

// Cria o app Express
const app = express();

// Cria o servidor HTTP com o app Express
const server = http.createServer(app);

// Cria o servidor de WebSocket com o Socket.IO
const io = socketIo(server);

// Diretório público
app.use(express.static('public'));

let messages = [];

const translateMessage = async (message, lang) => {

  try {
    //const originMessage = message
    const res = await translateApi(message, { to: lang});
    console.log("Idioma detectado:", res.from.language.iso);
    console.log("Tradução:", res.text);
    return res.text;
  } catch (err) {
    console.log("Erro na tradução:", err);
    return message;
  }
      
};

// Conectar ao socket e emitir/receber mensagens
io.on('connection', (socket) => {
    console.log(`Novo usuario conectado: ${socket.id}`);
    
    // Enviar mensagens anteriores quando o cliente se conecta
    socket.emit('previousMessages', messages);
    
    // Quando um cliente envia uma mensagem
    socket.on('chat message', async (msg) => {
        const { username, messag, translate } = msg;
        
        const translatedMessage = await translateMessage(messag, translate)
        
        // Adiciona a mensagem ao array de mensagens
        messages.push({ username, message: translatedMessage, originMessage: messag });

        console.log(messages)

    console.log(`Mensagem recebida de : ${socket.id}, ${username}: ${messag}`);

    io.emit('chat message', { username, message : translatedMessage, originMessage: messag})

  });

  // Quando o usuário se desconectar
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// Porta em que o servidor vai rodar
server.listen(4000, () => {
  console.log('Servidor rodando em http://localhost:4000');
});
