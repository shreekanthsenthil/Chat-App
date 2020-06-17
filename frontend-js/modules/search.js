import axios from 'axios'
import dompurify from 'dompurify'

export default class Search{
    constructor(){
        this.seachField = document.querySelector('.searchField')
        this.resultArea = document.querySelector('.result-area')
        this.typingTimer
        this.previousValue = ""
        this.events()
    }

    events(){
        this.seachField.addEventListener('keyup', () => {
            this.keyPressHandler()
        })
    }

    keyPressHandler(){
        let value = this.seachField.value

        if(value == ""){
            clearTimeout(this.typingTimer)
            this.renderBlankHTML()
        }

        if(value !="" && value != this.previousValue){
            clearTimeout(this.typingTimer)
            this.typingTimer = setTimeout(() => {this.sendRequest()}, 750)
        }
        this.previousValue = value
    }

    sendRequest() {
        console.log("Sending request")
        axios.post('/search', {searchTerm: this.seachField.value}).then((response) => {
            console.log(response.data)
            this.renderHTML(response.data)
        }).catch((e) => {
            console.log(e)
            alert("FAIL")
        })
    }

    renderHTML(users){
        if(users.length){
            this.resultArea.innerHTML = dompurify.sanitize(`
            ${users.map(user => {
                return `
                <form action="/connect/${user._id}" method="POST" class="d-inline">
                <button class="list-group-item list-group-item-action list-group-item-light rounded-0">
                    <div class="media"><img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg" alt="user" width="50" class="rounded-circle">
                      <div class="media-body ml-4">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                          <h6 class="mb-0">${user.username}</h6>
                        </div>
                        <p class="font-italic text-muted mb-0 text-small">${user.email}</p>
                      </div>
                    </div>
                  </button>
                  </form>
                `
            }).join('')}
            `)
        } else {
            this.resultArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search</p>`
        }
        
    }

    renderBlankHTML(){
        this.resultArea.innerHTML = `<p class="alert alert-danger text-center shadow-sm">Please type username/email to connect</p>`
    }

}
