const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// API do tradutor
const translateApi = require('@vitalets/google-translate-api');

// Criação do app Express
const app = express();

// Criação do servidor HTTP
const server = http.createServer(app);

// Criação do servidor de WebSocket (Socket.io)
const io = socketIo(server, {
  cors: {
    origin: "*",  // Permite qualquer origem (modifique em produção)
    methods: ["GET", "POST"]
  }
});

// Diretório público
app.use(express.static('public'));

let messages = [];

const translateMessage = async (message, lang) => {
  try {
    const res = await translateApi(message, { to: lang });
    console.log("Idioma detectado:", res.from.language.iso);
    console.log("Tradução:", res.text);
    return res.text;
  } catch (err) {
    console.log("Erro na tradução:", err);
    return message;  // Retorna a mensagem original se erro ocorrer
  }
};

// Conectar ao socket e emitir/receber mensagens
io.on('connection', (socket) => {
    console.log(`Novo usuário conectado: ${socket.id}`);
    
    // Enviar mensagens anteriores quando o cliente se conecta
    socket.emit('previousMessages', messages);
    
    // Quando um cliente envia uma mensagem
    socket.on('chat message', async (msg) => {
        const { username, messag, translate } = msg;
        
        const translatedMessage = await translateMessage(messag, translate);
        
        // Adiciona a mensagem ao array de mensagens
        messages.push({ username, message: translatedMessage, originMessage: messag });

        console.log(`Mensagem recebida de : ${socket.id}, ${username}: ${messag}`);
        io.emit('chat message', { username, message: translatedMessage, originMessage: messag });
    });

    // Quando o usuário se desconectar
    socket.on('disconnect', () => {
      console.log('Usuário desconectado');
    });
});

// Porta em que o servidor vai rodar
const port = process.env.PORT || 4000; // Usa a variável PORT ou 4000 como fallback

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
