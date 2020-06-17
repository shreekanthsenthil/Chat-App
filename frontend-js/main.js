import Chat from './modules/chat'
import Search from './modules/search'

if(document.querySelector('.chat-box')){
    new Chat()
}

if(document.querySelector('.searchField')){
    console.log('Triggering Seach Class')
    new Search()
}