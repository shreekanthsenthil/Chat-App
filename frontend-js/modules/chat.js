

export default class Chat {
    constructor() {
        this.chatBox = document.querySelector('.chat-box')
        this.chatScroll()
    }

    chatScroll() {
        this.chatBox.scrollTop = this.chatBox.scrollHeight
    }

}