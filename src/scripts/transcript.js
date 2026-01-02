class Transcript {
    constructor() {
        this.transcript = document.getElementById('transcript');
        this.list = document.getElementById('transcriptList');
        this.initialSet = false;
        this.hidden = true;
        this.messages = [];
        this.formattedMessages = [];
        this.maxMessages = 5;
        this.close = document.getElementById('closeTranscript');
        this.open = document.getElementById('openTranscript');
    }

    hide() {
        this.transcript.classList.add('-hide');
        this.hidden = true;
    }

    show() {
        this.transcript.classList.remove('-hide');
        this.hidden = false;
    }

    manage(message) {
        // Manage multiple messages
        if (Array.isArray(message)) {
            this.messages = [...this.messages, ...message];

            this.messages.forEach((el) => {
                this.formattedMessages.push(this.format(el));
            });
        } else {
            // Manage one message
            this.messages.push(message);

            if (this.formattedMessages.length === this.maxMessages) {
                this.formattedMessages.shift();
            }

            this.formattedMessages.push(this.format(this.messages[this.messages.length - 1]));
        }

        this.list.innerHTML = this.formattedMessages.join('');

        if (!this.initialSet && this.messages.length) {
            this.open.removeAttribute('disabled');

            this.open.addEventListener('click', () => {
                this.show();
            });

            this.close.addEventListener('click', () => {
                this.hide();
            });

            this.initialSet = true;
        }
    }

    format(message) {
        const date = new Date(message.time);

        return `
            <li class="transcript__item">
                <span class="transcript__time">${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</span>
                <p class="transcript__body">${message.body}</p>
            </li>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const transcript = new Transcript();

    window.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'chatUpdate') {
            const messages = data.data;

            // If multiple messages already exist, ie refreshing in the middle of a chat, send most recent
            if (!transcript.initialSet && messages.length > 1) {
                transcript.manage(messages.filter((m) => m.role === 'customer'));
            } else {
                // Just send the most recent message
                if (messages[messages.length - 1].role === 'customer') {
                    transcript.manage(messages[messages.length - 1]);
                }
            }
        }
    });
});
