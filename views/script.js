$(function () {
    const $events = document.getElementById('events');
    const $img = document.getElementById('img');

    const newItem = (content) => {
        const item = document.createElement('li');
        item.innerText = content;
        return item;
    };

    const socket = io();

    socket.on('conectado', (counter) => {
        $img.style.display='none';
        $events.appendChild(newItem(`Conectado com ${counter}`));
    });
});