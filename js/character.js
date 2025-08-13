const username = localStorage.getItem('username');
const usernameText = document.querySelector('.username');
const charactersList = document.querySelector('.characters-list');
const activeImage = document.querySelector('.main-character-image');
localStorage.setItem('avatar', activeImage);

usernameText.textContent = username;

charactersList.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        activeImage.src = e.target.src;
        localStorage.setItem('avatar', activeImage);
    }
});
