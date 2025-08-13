let username = localStorage.getItem('username');
const usernameField = document.querySelector('.username-field');
const usernameFieldButton = document.querySelector('.username-field-button');
const usernameFieldInput = document.querySelector('.username-field-input');
const incorrectInput = document.querySelector('.incorrect-input');
let countClick = 0;

usernameField.textContent = `Your username: ${username}`;

usernameFieldButton.addEventListener('click', () => {
    countClick++;
    usernameFieldButton.textContent = 'Save';
    usernameField.textContent = 'Your username:';
    usernameFieldInput.style.display = 'inline';
    if (countClick >= 2 && usernameFieldInput.value != '') {
        incorrectInput.style.display = 'none';
        username = usernameFieldInput.value;
        localStorage.setItem('username', username);
        usernameField.textContent = `Your username: ${username}`;
        usernameFieldInput.style.display = 'none';
        usernameFieldButton.textContent = 'Edit';
        countClick = 0;
    } else if (countClick >= 2) {
        incorrectInput.style.display = 'block';
    }
});
