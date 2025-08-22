const username = localStorage.getItem('username');
const usernameText = document.querySelector('.username');
const charactersList = document.querySelector('.characters-list');
const activeImage = document.querySelector('.main-character-image');

const savedAvatar = localStorage.getItem('avatar');
if (savedAvatar) {
    activeImage.src = savedAvatar;
} else {
    localStorage.setItem('avatar', activeImage.src);
}

usernameText.textContent = username;

charactersList.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
        activeImage.src = e.target.src;
        localStorage.setItem('avatar', activeImage.src);
    }
});
