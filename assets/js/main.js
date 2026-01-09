// HELPERS
const disableButton = (id) => {
  const button = document.getElementById(id);
  button.disabled = 'true';
};

const createAlert = (message, success = true) => {
  const alert = document.getElementById('alert');
  const classList = success ? 'alert alert-success' : 'alert alert-danger';

  alert.className = classList;
  alert.textContent = message;
};

const displaySpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.classList.remove('d-none');
};

const redirectAfter = (url, time = 1500) => {
  setTimeout(() => {
    window.location.href = url;
  }, time);
};

// LOGIN FEATURE
const login = (event) => {
  event.preventDefault();

  const CORRECT_EMAIL = 'admin@python.com';
  const CORRECT_PASSWORD = 'admin';

  const formData = new FormData(event.target);
  const { email, password } = Object.fromEntries(formData.entries());

  if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
    createAlert('Inicio de sesión exitoso. Redireccionando...');
    displaySpinner();
    disableButton('login-button');
    redirectAfter('menu.html');
  } else {
    createAlert('Credenciales incorrectas.', false);
  }
};

// MENU OPTIONS TRIGGER
const selectMenu = (event) => {
  const href = event.target.dataset.href;
  const text = event.target.textContent.trim();

  createAlert(`Redirigiendo a "${text}"`);
  redirectAfter(href);
};

const main = () => {
  // Event Listener login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', login);

  // Event Listener menu options
  const options = document.getElementsByClassName('options');
  if (options) {
    for (let option of options) {
      option.addEventListener('click', selectMenu);
    }
  }
};

main();
