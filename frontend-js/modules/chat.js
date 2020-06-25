import axios from "axios"


export default class Chat {
    constructor() {
        this.chatBox = document.querySelector('.chat-box')
        this.chatUsers = document.querySelectorAll('.list-group .list-group-item')
        this.activeChat = document.querySelector('.active')
        this.chatArea = document.querySelector('.chat-box')
        this.typingArea = document.querySelector('.message-field')
        this.sendButton = document.querySelector('.send-button')
        this.userList = document.querySelector('.user-list')
        this.renderChatBox(this.activeChat.dataset.id)
        this.SocketConnection()
        this.events()
    }

    //events
    events(){
        this.chatUsers.forEach(chatUser => {
            chatUser.onclick = () => {
                this.handleUserClick(chatUser)
            }
        })
        this.sendButton.onclick = () => {
            this.sendMessage()
        }
        this.typingArea.addEventListener('keypress', (e) => {
            if(e.key === 'Enter'){
                this.sendMessage()
            }
        })
    }

    chatScroll() {
        this.chatBox.scrollTop = this.chatBox.scrollHeight
    }

    makeActive(id) {
        this.activeChat.classList.remove('active', 'text-white')
        this.activeChat.classList.add('list-group-item-light')
        this.activeChat = document.querySelector(`button[data-id="${id}"]`)
        this.activeChat.classList.remove('list-group-item-light')
        this.activeChat.classList.add('active', 'text-white')
    }

    handleUserClick(ClickedUser) {
        if(this.activeChat != ClickedUser) {
            this.makeActive(ClickedUser.dataset.id)
            this.renderChatBox(this.activeChat.dataset.id)
        }
    }

    renderChatBox(id) {
        axios.post('/getMessages', {connectId: id}).then((response) => {
            this.messages = response.data
            this.chatArea.innerHTML = this.messages.map(messageDoc => {
                let time = this.formatTime(messageDoc.time)
                if(messageDoc.from == id) {
                    return this.renderConnectorMessage(messageDoc.message, time)
                } else {
                    return this.renderUserMessage(messageDoc.message, time)
                }
            }).join('')
        }).catch((e) => {
            console.log(e)
        })
        this.chatScroll()
    }

    SocketConnection() {
        this.socket = io()
        this.socket.on('welcome', data => {
            this.userId = data.userId
            this.socket.emit('join', {id: this.userId})
        })
        this.socket.on('newMessageFromServer', (data) => {
            this.receiveMessage(data)
        })
        this.socket.on('newConnection', data => {
            this.newConnection(data)
        })
    }

    sendMessage() {
        if(this.typingArea.value != ""){
            this.socket.emit('newMessageFromBrowser', {toUserId: this.activeChat.dataset.id, time: new Date(), message: this.typingArea.value})
            this.chatArea.innerHTML += this.renderUserMessage(this.typingArea.value, this.formatTime(new Date()))
            this.typingArea.value = ""
            this.chatScroll()
        }
    }

    receiveMessage(data) {
        if(this.activeChat.dataset.id == data.fromUserId) {
            this.chatArea.innerHTML += this.renderConnectorMessage(data.message, this.formatTime(data.time))
            this.chatScroll()
        } else {
            this.makeActive(data.fromUserId)
            this.renderChatBox(data.fromUserId)
        }
    }

    newConnection(data) {
        this.userList.innerHTML += `
        <button class="list-group-item list-group-item-action list-group-item-light rounded-0" data-id="${data.id}">
            <div class="media"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                <div class="media-body ml-4 mt-2">
                    <div class="align-items-center justify-content-between">
                        <h5 class="mb-0"> ${data.username} </h5>
                    </div>
                </div>
            </div>
        </button>
        `
    }

    renderConnectorMessage(message, time) {
        return `
        <div class="media w-50 mb-3"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
        <div class="media-body ml-3">
          <div class="bg-light rounded py-2 px-3 mb-2">
            <p class="text-small mb-0 text-muted">${message}</p>
          </div>
          <p class="small text-muted">${time}</p>
        </div>
      </div>`
    }

    renderUserMessage(message, time) {
        return `
        <div class="media w-50 ml-auto mb-3">
        <div class="media-body">
          <div class="bg-primary rounded py-2 px-3 mb-2">
            <p class="text-small mb-0 text-white">${message}</p>
          </div>
          <p class="small text-muted">${time}</p>
        </div>
      </div>
        `
    }

    formatTime(time) {
        time = new Date(time)
        time = '' + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + ' | ' + time.toLocaleString('en-US', { month: 'short' }) + ' ' + time.getDate()
        return time
    }

}