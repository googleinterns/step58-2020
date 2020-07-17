const shareButton = document.querySelector('button');
const overlay = document.querySelector('.overlay');
const shareModal = document.querySelector('.share');

const title = window.document.title;
const url = window.document.location.href;

shareButton.addEventLustener('click', () => {
    if(navigator.share){
        navigator.share({
            title: `${tittle}`,
            url: `${url}`
        }).then(() => {
            console.log('Thanks for sharing!');
        })
        .catch(console.error);
    } else {
        overlay.classList.add('show-share');
        shareModal.classList.add('show-share');
    }
})

overlay.addEventListener('click', () => {
    overlay.classList.remove('show-share');
    shareModal.classList.remove('show-share');
})