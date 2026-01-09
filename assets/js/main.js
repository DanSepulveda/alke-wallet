// ########## CONSTANTES ##########
const CORRECT_EMAIL = 'admin@python.com';
const CORRECT_PASSWORD = 'admin';

// ########## CLAVES LOCAL STORAGE ##########
const KEY_SALDO = 'saldo';
const KEY_CONTACTOS = 'contactos';
const KEY_TRANSACCIONES = 'transacciones';

// ########## FUNCIONES AUXILIARES ##########
const formatearDinero = (amount) => {
  const formateador = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  return formateador.format(amount);
};

const desactivarBoton = (id) => {
  const boton = document.getElementById(id);
  boton.disabled = 'true';
};

const mostrarSpinner = () => {
  const spinner = document.getElementById('spinner');
  spinner.classList.remove('d-none');
};

const leerLS = (clave) => {
  const valor = localStorage.getItem(clave);
  if (!valor && clave === KEY_SALDO) return 0;
  if (!valor) return [];
  return JSON.parse(valor);
};

const actualizarLS = (clave, nuevoValor) => {
  localStorage.setItem(clave, JSON.stringify(nuevoValor));
};

const alertar = (mensaje, exito = true) => {
  const alerta = document.getElementById('alert');
  const clases = exito ? 'alert alert-success' : 'alert alert-danger';

  alerta.className = clases;
  alerta.textContent = mensaje;
};

const toast = (mensaje, exito = true) => {
  const toast = document.getElementById('liveToast');
  const toastIcon = toast.querySelector('#toast-icon');
  const toastBody = toast.querySelector('#toast-message');

  toastBody.innerText = mensaje;
  toastIcon.className = exito
    ? 'bi bi-check-circle text-success fs-5'
    : 'bi bi-x-circle text-danger fs-5';

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
};

const redirigir = (url, tiempo = 1500) => {
  setTimeout(() => {
    window.location.href = url;
  }, tiempo);
};

// ########## FUNCIONES PRINCIPALES ##########
const displayCurrentBalance = () => {
  const balance = document.getElementById('balance');
  if (balance) {
    balance.innerText = formatearDinero(leerLS(KEY_SALDO));
  }
};

const displayContacts = (contacts) => {
  const contactsContainer = document.getElementById('contacts');
  if (contactsContainer) {
    contactsContainer.innerHTML = '';
    contacts.forEach((contact) => {
      const card = `
        <button class="btn btn-outline-dark btn-outline-main border d-flex flex-column p-2 rounded-2" onclick="transfer('${contact}')">
          <span>${contact.name} (${contact.alias})</span>
          <span>${contact.bank} - CBU: ${contact.cbu}</span>
        </button>
      `;
      contactsContainer.innerHTML += card;
    });
  }
};

const displayTransactions = (transactions) => {
  const transactionsContainer = document.getElementById('transactions');
  if (transactionsContainer) {
    transactionsContainer.innerHTML = '';

    transactions.forEach((transaction) => {
      const card = `
        <li class="list-group-item">
          <span>${transaction.type}</span>
          <span class="fw-medium text-danger">
            ${formatearDinero(transaction.amount)}
          </span>
        </li>`;

      transactionsContainer.innerHTML += card;
    });
  }
};

const searchContact = (event) => {
  const name = event.target.value;
  const contacts = leerLS(KEY_CONTACTOS);
  const filteredContacts = contacts.filter(
    (contact) => contact.name.includes(name) || contact.alias.includes(name)
  );
  displayContacts(filteredContacts);
};

const createContact = () => {
  // TODO: validar datos
  const contactForm = document.getElementById('new-contact-form');
  const formData = new FormData(contactForm);
  const newContact = Object.fromEntries(formData.entries());
  const currentContacts = leerLS(KEY_CONTACTOS);
  console.log(currentContacts);

  const newList = [...currentContacts, newContact];

  actualizarLS(KEY_CONTACTOS, newList);
  displayContacts(newList);
};

const cancelTransfer = () => {
  console.log('first');
  const container = document.getElementById('transfer-container');
  const searchForm = document.getElementById('search-form');
  container.classList.add('d-none');
  searchForm.classList.remove('d-none');
  // borrar user
};

const transfer = (contact) => {
  const container = document.getElementById('transfer-container');
  const searchForm = document.getElementById('search-form');
  container.classList.remove('d-none');
  searchForm.classList.add('d-none');
  // seleccionar user
};

const addTransaction = (transaction) => {
  const currentTransactions = leerLS(KEY_TRANSACCIONES);
  currentTransactions.unshift(transaction);
  actualizarLS(KEY_TRANSACCIONES, currentTransactions);
  displayTransactions(currentTransactions);
};

// LOGIN FEATURE
const login = (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const { email, password } = Object.fromEntries(formData.entries());

  if (email === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
    alertar('Inicio de sesión exitoso. Redireccionando...');
    mostrarSpinner();
    desactivarBoton('login-button');
    redirigir('menu.html');
  } else {
    alertar('Credenciales incorrectas.', false);
  }
};

// MENU OPTIONS TRIGGER
const selectMenu = (event) => {
  const href = event.target.dataset.href;
  const text = event.target.textContent.trim();

  alertar(`Redirigiendo a "${text}"`);
  redirigir(href);
};

// DEPOSIT or WITHDRAW
const doOperation = (event) => {
  const amountInput = document.getElementById('amount');
  let operationAmount = amountInput.value;
  if (!operationAmount) {
    toast('Ingrese un monto', false);
    return;
  }

  operationAmount = parseInt(operationAmount);
  const currentBalance = leerLS(KEY_SALDO);
  const operation = event.target.dataset.operation;

  if (operation === 'retiro') {
    if (operationAmount > currentBalance) {
      toast('Saldo insuficiente');
      return;
    }
    const nuevoSaldo = currentBalance - operationAmount;
    actualizarLS(KEY_SALDO, nuevoSaldo);
    addTransaction({ type: 'Retiro', amount: -operationAmount });
  } else {
    const nuevoSaldo = currentBalance + operationAmount;
    actualizarLS(KEY_SALDO, nuevoSaldo);
    addTransaction({ type: 'Depósito', amount: operationAmount });
  }

  toast(
    `Se ha realizado un ${operation} de ${formatearDinero(operationAmount)}`
  );
  displayCurrentBalance();
  redirigir('menu.html', 2000);
  amountInput.value = '';
};

const transfer2 = (event) => {
  event.preventDefault();
  console.log('aca estoy');
  const formData = new FormData(event.target);
  const { amount } = Object.fromEntries(formData.entries());

  const currentBalance = leerLS(KEY_SALDO);

  if (amount > currentBalance) {
    toast('Saldo insuficiente', false);
    return;
  }

  const newBalance = currentBalance - amount;
  console.log(newBalance);

  actualizarLS(KEY_SALDO, newBalance);
  displayCurrentBalance();
  addTransaction({ type: 'Transferencia', amount: -amount });
  toast('Transferencia realizada');
};

const filterTransactions = (event) => {
  const selectedType = event.target.value;
  const allTransactions = leerLS(KEY_TRANSACCIONES);
  const filteredTransactions = allTransactions.filter((transaction) =>
    transaction.type.includes(selectedType)
  );
  displayTransactions(filteredTransactions);
};

const main = () => {
  // Set Account Balance
  displayCurrentBalance();

  displayContacts(leerLS(KEY_CONTACTOS));

  displayTransactions(leerLS(KEY_TRANSACCIONES));

  // Event Listener search contact
  const searchInput = document.getElementById('search-contact');
  if (searchInput) searchInput.addEventListener('input', searchContact);

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

  // Event Listener for "deposit" and "withdraw"
  const operationButtons = document.getElementsByClassName('deposit-withdraw');
  if (operationButtons) {
    for (let button of operationButtons) {
      button.addEventListener('click', doOperation);
    }
  }

  // Event listener transfer form
  const transferForm = document.getElementById('transfer-form');
  if (transferForm) transferForm.addEventListener('submit', transfer2);

  const cancelTransferBtn = document.getElementById('cancel-transfer');
  if (cancelTransferBtn)
    cancelTransferBtn.addEventListener('click', cancelTransfer);

  const addContactBtn = document.getElementById('create-contact');
  if (addContactBtn) addContactBtn.addEventListener('click', createContact);

  const transactionSelect = document.getElementById('transaction-type');
  if (transactionSelect)
    transactionSelect.addEventListener('change', filterTransactions);
};

main();
