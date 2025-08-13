const inputButton = document.querySelector('#inputNameButton');
const inputForm = document.querySelector('#inputNameForm');
const errorText = document.querySelector('.error-input');

inputButton.addEventListener('click', () => {
    const nameCharacter = inputForm.value;
    if (nameCharacter != '') {
        window.location.href = './pages/home.html';
    } else {
        errorText.style.display = 'block';
    }
});
