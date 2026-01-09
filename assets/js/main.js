// CONSTANTS
const CORRECT_EMAIL = 'admin@python.com';
const CORRECT_PASSWORD = 'admin';
const BALANCE_KEY = 'balance';
const CONTACTS_KEY = 'contacts';
const TRANSACTIONS_KEY = 'transactions';

// HELPERS
const formatCash = (amount) => {
  const clpFormatter = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  return clpFormatter.format(amount);
};

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

const toast = (message, success = true) => {
  const toast = document.getElementById('liveToast');
  const toastIcon = toast.querySelector('#toast-icon');
  const toastBody = toast.querySelector('#toast-message');

  toastBody.innerText = message;

  toastIcon.className = success
    ? 'bi bi-check-circle text-success fs-5'
    : 'bi bi-x-circle text-danger fs-5';

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
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

const readBalanceLS = () => {
  const balance = localStorage.getItem(BALANCE_KEY) ?? 0;
  return parseInt(balance);
};

const updateBalanceLS = (amount) => {
  const newBalance = readBalanceLS() + amount;
  localStorage.setItem(BALANCE_KEY, newBalance);
};

const readContactsLS = () => {
  const contacts = localStorage.getItem(CONTACTS_KEY);
  if (!contacts) return [];
  return JSON.parse(contacts);
};

const updateContactsLS = (contacts) => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

const searchContact = (event) => {
  const name = event.target.value;
  const contacts = readContactsLS();
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
  const currentContacts = readContactsLS();

  const newList = [...currentContacts, newContact];

  updateContactsLS(newList);
  displayContacts(newList);
};

const displayCurrentBalance = () => {
  const balance = document.getElementById('balance');
  if (balance) {
    balance.innerText = formatCash(readBalanceLS());
  }
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
            ${formatCash(transaction.amount)}
          </span>
        </li>`;

      transactionsContainer.innerHTML += card;
    });
  }
};

const readTransactionsLS = () => {
  const transactions = localStorage.getItem(TRANSACTIONS_KEY);
  if (!transactions) return [];
  return JSON.parse(transactions);
};

const updateTransactionsLS = (transactions) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

const addTransaction = (transaction) => {
  const currentTransactions = readTransactionsLS();
  currentTransactions.unshift(transaction);
  updateTransactionsLS(currentTransactions);
  displayTransactions(currentTransactions);
};

// LOGIN FEATURE
const login = (event) => {
  event.preventDefault();

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

// DEPOSIT or WITHDRAW
const doOperation = (event) => {
  const amountInput = document.getElementById('amount');
  let operationAmount = amountInput.value;
  if (!operationAmount) {
    toast('Ingrese un monto', false);
    return;
  }

  operationAmount = parseInt(operationAmount);
  const currentBalance = readBalanceLS();
  const operation = event.target.dataset.operation;

  if (operation === 'retiro') {
    if (operationAmount > currentBalance) {
      toast('Saldo insuficiente');
      return;
    }

    updateBalanceLS(-operationAmount);
    addTransaction({ type: 'Retiro', amount: -operationAmount });
  } else {
    updateBalanceLS(operationAmount);
    addTransaction({ type: 'Depósito', amount: operationAmount });
  }

  toast(`Se ha realizado un ${operation} de ${formatCash(operationAmount)}`);
  displayCurrentBalance();
  redirectAfter('menu.html', 2000);
  amountInput.value = '';
};

const transfer2 = (event) => {
  event.preventDefault();
  console.log('aca estoy');
  const formData = new FormData(event.target);
  const { amount } = Object.fromEntries(formData.entries());

  const currentBalance = readBalanceLS();

  if (amount > currentBalance) {
    toast('Saldo insuficiente', false);
    return;
  }

  const newBalance = currentBalance - amount;
  console.log(newBalance);

  updateBalanceLS(parseInt(-amount));
  displayCurrentBalance();
  addTransaction({ type: 'Transferencia', amount: -amount });
  toast('Transferencia realizada');
};

const filterTransactions = (event) => {
  const selectedType = event.target.value;
  const allTransactions = readTransactionsLS();
  const filteredTransactions = allTransactions.filter((transaction) =>
    transaction.type.includes(selectedType)
  );
  displayTransactions(filteredTransactions);
};

const main = () => {
  // Set Account Balance
  displayCurrentBalance();

  displayContacts(readContactsLS());

  displayTransactions(readTransactionsLS());

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
