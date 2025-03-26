// script.js

// Conectar ao servidor Socket.IO
const socket = io();

// Referências aos elementos
const form = document.getElementById('chat');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const messagesContainer = document.getElementById('messages');
const messageTranslate = document.getElementById("languageTo");  // Idioma de tradução

// Enviar mensagem quando o formulário for enviado
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();
    const translate = messageTranslate.value;  // Idioma de tradução selecionado

    // Verifica se o nome de usuário e a mensagem não estão vazios
    if (username && message) {
        // Estrutura da mensagem com o nome, mensagem e idioma
        const messageToSend = {
            username: username,
            messag: message,
            translate: translate // Idioma para tradução
        };

        // Emitir a mensagem para o servidor
        socket.emit('chat message', messageToSend);

        // Limpar o campo de mensagem após o envio
        messageInput.value = '';
    }
});

// Escutar mensagens do servidor e adicionar ao chat
socket.on('chat message', (msg) => {
    const text = `${msg.username}: ${msg.message}(${msg.originMessage})`;
    const msgElement = document.createElement('div');
    msgElement.textContent = text;
    messagesContainer.appendChild(msgElement);

    // Manter o scroll na parte inferior das mensagens
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Receber mensagens anteriores quando o cliente se conecta
socket.on('previousMessages', function (messages) {
    for (let mensagem of messages) {
        const msgElement = document.createElement('div');
        msgElement.textContent = `${mensagem.username}: ${mensagem.message}(${mensagem.originMessage})`;
        messagesContainer.appendChild(msgElement);

        // Manter o scroll na parte inferior das mensagens
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
