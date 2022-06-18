(() => {
    // initialize variables
    const spanUserName = document.getElementById('spanUserName');
    const divMessages = document.getElementById('divMessages');
    const buttonConnect = document.getElementById('buttonConnect');
    const buttonDisconnect = document.getElementById('buttonDisconnect');
    const textMessage = document.getElementById('textMessage');
    const buttonSend = document.getElementById('buttonSend');
    const appId = 'Kd29d';
    const apiUrl = 'wss://socketsbay.com/wss/v2/2/demo/';
    let webSocket = null;

    // initialize controls
    spanUserName.textContent = '';
    divMessages.textContent = '';

    // prompt for user name
    const userName = prompt('Please enter a user name: ', `User${Math.round(Math.random() * 100)}`);
    spanUserName.textContent = `${userName} (You)`;

    // wire connect button to connect to server and set up WebSocket
    buttonConnect.addEventListener('click', () => {
        // disable the connect button now before connecting 
        //  so user can't click on it multiple times while waiting for connection to be established
        // we will enable this though if connection failed
        buttonConnect.textContent = 'Connecting...';
        buttonConnect.setAttribute('disabled', '');
        connect();
    });

    connect = () => {
        webSocket = new WebSocket(apiUrl);

        webSocket.onopen = (event) => {
            console.log('Connection to server opened.');
            setUIConnect();
            sendMessage(userName, 'Connected');
        }

        webSocket.onmessage = (event) => {
            // check if we have data
            if (event.data) {
                const data = JSON.parse(event.data);
                if (data && data.id && data.id == appId && data.type && data.type == 'chat') {
                    const userName = data.user;
                    const message = data.text;
                    appendToDivMessages(userName, message);
                }
            }
        };

        webSocket.onerror = (event) => {
            buttonConnect.textContent = 'Connect';
            buttonConnect.removeAttribute('disabled');
            buttonConnect.focus();
        }
    };

    setUIConnect = () => {
        buttonConnect.setAttribute('disabled', '');
        buttonConnect.textContent = 'Connect';
        buttonDisconnect.removeAttribute('disabled');
        textMessage.removeAttribute('disabled');
        textMessage.focus();
        buttonSend.removeAttribute('disabled');
    };

    appendToDivMessages = (userName, textMessage) => {
        const span = document.createElement('span');
        span.classList.add('badge');
        span.classList.add('bg-secondary');
        span.append(userName);
        divMessages.appendChild(span);
        divMessages.append(' ' + textMessage);
        divMessages.appendChild(document.createElement('br'));

        // always set scrollbar at bottom
        //divMessages.scrollTop(200);
        divMessages.scrollTop = divMessages.scrollHeight - divMessages.clientHeight;
        //console.log('scrollTop: ' + divMessages.scrollTop);
        //console.log('scrollHeight: ' + divMessages.scrollHeight);
        //console.log('clientHeight: ' + divMessages.clientHeight);
    };

    // wire disconnect button to disconnect from server and close Websocket
    buttonDisconnect.addEventListener('click', () => {
        disconnect();
    });

    disconnect = () => {
        sendMessage(userName, 'Disconnected');
        webSocket.close();
        setUIDisconnect();
    }

    setUIDisconnect = () => {
        buttonConnect.removeAttribute('disabled');
        buttonConnect.focus();
        buttonDisconnect.setAttribute('disabled', '');
        textMessage.setAttribute('disabled', '');
        buttonSend.setAttribute('disabled', '');
    }

    // wire send button to send chat message
    buttonSend.addEventListener('click', () => {
        sendMessage(userName, textMessage.value);
        textMessage.value = '';
    });

    sendMessage = (userName, textMessage) => {
        var msg = {
            id:   appId,
            type: 'chat',
            user: userName,
            text: textMessage,
        };
        webSocket.send(JSON.stringify(msg));
        appendToDivMessages(`${userName} (You)`, textMessage);
    }

    // wire enter key pressed on text message to click send
    textMessage.addEventListener('keydown', (e) => {
        if (e.key == 'Enter' && !e.altKey) {
            e.preventDefault();
            sendMessage(userName, textMessage.value);
            textMessage.value = '';
        }
    });

    // wire new chat window button to open another chat window
    document.getElementById('buttonNewChatWindow').addEventListener('click', (e) => {
        window.open('index.html', `chatWindow${Math.round(Math.random() * 100)}`, 'popup');
    })
})();