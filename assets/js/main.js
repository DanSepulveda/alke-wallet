// ************************************************
// ****************** CONSTANTES ******************
// ************************************************
const EMAIL_CORRECTO = 'admin@python.com';
const CLAVE_CORRECTA = 'admin';

// ************************************************
// ************* CLAVES LOCAL STORAGE *************
// ************************************************
const KEY_SALDO = 'saldo';
const KEY_CONTACTOS = 'contactos';
const KEY_TRANSACCIONES = 'transacciones';

// ************************************************
// ************* FUNCIONES AUXILIARES *************
// ************************************************
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

const extraerDatosForm = (formulario) => {
  const formData = new FormData(formulario);
  const datos = Object.fromEntries(formData.entries());
  return datos;
};

const generarFechaActual = () => {
  const ahora = new Date();

  return ahora.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// ************************************************
// ************ FUNCIONES PRINCIPALES *************
// ************************************************
const iniciarSesion = (event) => {
  event.preventDefault();
  const datos = extraerDatosForm(event.target);

  if (datos.email === EMAIL_CORRECTO && datos.password === CLAVE_CORRECTA) {
    alertar('Inicio de sesión exitoso. Redireccionando...');
    mostrarSpinner();
    desactivarBoton('login-button');
    redirigir('menu.html');
  } else {
    alertar('Credenciales incorrectas.', false);
  }
};

const mostrarSaldoActual = () => {
  const saldoSpan = document.getElementById('saldo');
  if (saldoSpan) {
    saldoSpan.innerText = formatearDinero(leerLS(KEY_SALDO));
  }
};

const manejarMenu = (event) => {
  const href = event.target.dataset.href;
  const texto = event.target.textContent.trim();

  alertar(`Redirigiendo a "${texto}"`);
  redirigir(href);
};

const realizarOperacion = (event) => {
  const inputMonto = document.getElementById('monto-operacion');
  let montoOperacion = inputMonto.value;

  if (!montoOperacion) {
    toast('Ingrese un monto', false);
    return;
  }

  montoOperacion = parseInt(montoOperacion);
  const saldoActual = leerLS(KEY_SALDO);
  const operacion = event.target.dataset.operacion;

  if (operacion === 'retiro') {
    if (montoOperacion > saldoActual) {
      toast('Saldo insuficiente');
      return;
    }

    montoOperacion *= -1;
  }

  inputMonto.value = '';
  actualizarLS(KEY_SALDO, saldoActual + montoOperacion);
  mostrarSaldoActual();
  registrarTransaccion({
    tipo: operacion,
    monto: montoOperacion,
    fecha: generarFechaActual(),
  });
  toast(
    `Se ha realizado un ${operacion} de ${formatearDinero(montoOperacion)}`
  );
  redirigir('menu.html', 2000);
};

// TODO
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

const filterTransactions = (event) => {
  const selectedType = event.target.value;
  const allTransactions = leerLS(KEY_TRANSACCIONES);
  const filteredTransactions = allTransactions.filter((transaction) =>
    transaction.type.includes(selectedType)
  );
  displayTransactions(filteredTransactions);
};

const createContact = () => {
  // TODO: validar datos
  const contactForm = document.getElementById('new-contact-form');
  const newContact = extraerDatosForm(contactForm);
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

const registrarTransaccion = (transaction) => {
  const currentTransactions = leerLS(KEY_TRANSACCIONES);
  currentTransactions.unshift(transaction);
  actualizarLS(KEY_TRANSACCIONES, currentTransactions);
  displayTransactions(currentTransactions);
};

const transfer2 = (event) => {
  event.preventDefault();
  console.log('aca estoy');
  const { amount } = extraerDatosForm(event.target);

  const currentBalance = leerLS(KEY_SALDO);

  if (amount > currentBalance) {
    toast('Saldo insuficiente', false);
    return;
  }

  const newBalance = currentBalance - amount;
  console.log(newBalance);

  actualizarLS(KEY_SALDO, newBalance);
  mostrarSaldoActual();
  registrarTransaccion({ type: 'Transferencia', amount: -amount });
  toast('Transferencia realizada');
};

// ************************************************
// ************ FUNCION INICIALIZADORA ************
// ************************************************
const main = () => {
  mostrarSaldoActual();
  displayContacts(leerLS(KEY_CONTACTOS));
  displayTransactions(leerLS(KEY_TRANSACCIONES));

  // * EVENT LISTENER FORMULARIO LOGIN
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', iniciarSesion);

  // * EVENT LISTENER PARA OPCIONES MENU PRINCIPAL
  const opciones = document.getElementsByClassName('opcion-menu');
  if (opciones) {
    for (let opcion of opciones) {
      opcion.addEventListener('click', manejarMenu);
    }
  }

  // * EVENT LISTENER PARA BOTONES DEPÓSITO/RETIRO
  const botonesOperacion = document.getElementsByClassName('deposito-retiro');
  if (botonesOperacion) {
    for (let boton of botonesOperacion) {
      boton.addEventListener('click', realizarOperacion);
    }
  }

  // Event Listener search contact
  const searchInput = document.getElementById('search-contact');
  if (searchInput) searchInput.addEventListener('input', searchContact);

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
