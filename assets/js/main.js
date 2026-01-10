// ------------------------------------------------
// ################## CONSTANTES ##################
// ------------------------------------------------
const EMAIL_CORRECTO = 'admin@python.com';
const CLAVE_CORRECTA = 'admin';

// ------------------------------------------------
// ############# CLAVES LOCAL STORAGE #############
// ------------------------------------------------
const KEY_SALDO = 'saldo';
const KEY_CONTACTOS = 'contactos';
const KEY_TRANSACCIONES = 'transacciones';

// ------------------------------------------------
// ############# FUNCIONES AUXILIARES #############
// ------------------------------------------------
const formatearDinero = (monto) => {
  const formateador = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  });

  return formateador.format(monto);
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
  return Object.fromEntries(formData.entries());
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

const registrarTransaccion = (transaccion) => {
  const transaccionesActuales = leerLS(KEY_TRANSACCIONES);
  transaccionesActuales.unshift(transaccion);
  actualizarLS(KEY_TRANSACCIONES, transaccionesActuales);
  listarTransacciones(transaccionesActuales);
};

// ------------------------------------------------
// ############## MOSTRAR INFORMACIÓN #############
// ------------------------------------------------
const mostrarSaldoActual = () => {
  const saldoSpan = document.getElementById('saldo');
  if (!saldoSpan) return;
  saldoSpan.innerText = formatearDinero(leerLS(KEY_SALDO));
};

const listarDestinatarios = (destinatarios) => {
  const contenedorDestinatarios = document.getElementById('destinatarios');
  if (!contenedorDestinatarios) return;

  contenedorDestinatarios.innerHTML = '';
  destinatarios.forEach((destinatario) => {
    const boton = `
        <button
          class="btn btn-outline-dark btn-outline-main border d-flex align-items-center gap-3 p-2 rounded-2"
          data-destinatario="${destinatario.nombre}"
        >
          <img src="assets/img/usuario.png" width="36" alt="Avatar" />
          <div class="d-flex flex-column align-items-start">
            <span class="fw-bold">${destinatario.nombre} (${destinatario.alias})</span>
            <span>${destinatario.banco}</span>
            <span class="fs-7">CBU: ${destinatario.cbu}</span>
          </div>
        </button>
      `;

    contenedorDestinatarios.innerHTML += boton;
  });

  contenedorDestinatarios.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;

    const destinatario = boton.dataset.destinatario;
    toogleFormTransferencia(destinatario);
    contenedorDestinatarios.innerHTML = '';
  });

  if (!destinatarios.length) {
    contenedorDestinatarios.innerHTML = `
        <p class="text-center">No hay destinatarios regristrados</p>
      `;
  }
};

const listarTransacciones = (transacciones) => {
  const contenedorTransacciones = document.getElementById('transacciones');
  if (!contenedorTransacciones) return;

  contenedorTransacciones.innerHTML = '';

  transacciones.forEach((transaccion) => {
    const color = transaccion.monto < 0 ? 'danger' : 'success';
    const tarjeta = `
        <li class="list-group-item">
          <div class="d-flex justify-content-between fw-light fs-7">
            <span>${transaccion.fecha}</span>
            <span>${transaccion.asunto ?? ''}</span>
          </div>
          <div class="d-flex justify-content-between gap-2">
            <span>${transaccion.tipo}</span>
            <span class="text-right text-${color}">
              ${formatearDinero(transaccion.monto)}
            </span>
          </div>
        </li>`;

    contenedorTransacciones.innerHTML += tarjeta;
  });

  if (!transacciones.length) {
    contenedorTransacciones.innerHTML = `
        <p class="text-center">Sin movimientos</p>
      `;
  }
};

// ------------------------------------------------
// ############# SETUP DE FORMULARIOS #############
// ------------------------------------------------
const setupFormLogin = () => {
  const formularioLogin = document.getElementById('form-login');
  if (!formularioLogin) return;

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const datos = extraerDatosForm(evento.target);

    if (datos.email === EMAIL_CORRECTO && datos.password === CLAVE_CORRECTA) {
      alertar('Inicio de sesión exitoso. Redireccionando...');
      mostrarSpinner();
      desactivarBoton('boton-login');
      redirigir('menu.html');
    } else {
      alertar('Credenciales incorrectas.', false);
    }
  });
};

const setupFormDeposito = () => {
  const formularioDeposito = document.getElementById('form-deposito');
  if (!formularioDeposito) return;

  formularioDeposito.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') evento.preventDefault();
  });

  formularioDeposito.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = extraerDatosForm(evento.target);
    let montoOperacion = form.monto;

    if (montoOperacion <= 0) {
      toast('Ingrese un monto mayor a $0', false);
      return;
    }

    montoOperacion = parseInt(montoOperacion);
    const saldoActual = leerLS(KEY_SALDO);
    const operacion = evento.submitter.dataset.operacion;

    if (operacion === 'Retiro') {
      if (montoOperacion > saldoActual) {
        toast('Saldo insuficiente', false);
        return;
      }

      montoOperacion *= -1;
    }

    evento.target.reset();
    actualizarLS(KEY_SALDO, saldoActual + montoOperacion);
    mostrarSaldoActual();
    registrarTransaccion({
      tipo: operacion,
      monto: montoOperacion,
      fecha: generarFechaActual(),
      asunto: form.asunto,
    });
    toast(
      `Se ha realizado un ${operacion.toLowerCase()} de ${formatearDinero(
        montoOperacion
      )}`
    );
    redirigir('menu.html', 2000);
  });
};

const setupFormCrearDestinatario = () => {
  const formularioDestinatario = document.getElementById('form-destinatario');
  if (!formularioDestinatario) return;

  formularioDestinatario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nuevoDestinatario = extraerDatosForm(evento.target);
    const destinatariosActuales = leerLS(KEY_CONTACTOS);
    destinatariosActuales.push(nuevoDestinatario);
    actualizarLS(KEY_CONTACTOS, destinatariosActuales);
    const modalElement = document.getElementById('nuevo-destinatario');
    const bsModal = bootstrap.Modal.getInstance(modalElement);
    bsModal.hide();
    formularioDestinatario.reset();
    listarDestinatarios(destinatariosActuales);
  });
};

// !REVISAR
const setupFormTransferencia = () => {
  const formTransferencia = document.getElementById('form-transferencia');
  if (!formTransferencia) return;

  formTransferencia.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = extraerDatosForm(evento.target);

    const saldoActual = leerLS(KEY_SALDO);

    if (form.monto > saldoActual) {
      toast('Saldo insuficiente', false);
      return;
    }

    actualizarLS(KEY_SALDO, saldoActual - form.monto);
    mostrarSaldoActual();
    registrarTransaccion({
      tipo: 'Transferencia',
      monto: -form.monto,
      fecha: generarFechaActual(),
      asunto: form.asunto,
    });
    toast('Transferencia realizada');
    toogleFormTransferencia();
    const destinatarios = leerLS(KEY_CONTACTOS);
    listarDestinatarios(destinatarios);
  });

  const botonCancelar = document.getElementById('cancelar');
  console.log(botonCancelar);
  botonCancelar.addEventListener('click', () => {
    toogleFormTransferencia();
    const destinatarios = leerLS(KEY_CONTACTOS);
    listarDestinatarios(destinatarios);
  });
};

// ------------------------------------------------
// ############### SETUP DE FILTROS ###############
// ------------------------------------------------
const setupFiltroDestinatarios = () => {
  const inputDestinatario = document.getElementById('buscar-destinatario');
  if (!inputDestinatario) return;

  inputDestinatario.addEventListener('input', (evento) => {
    const busqueda = evento.target.value;
    const contactosActuales = leerLS(KEY_CONTACTOS);
    const contactosFiltrados = contactosActuales.filter(
      (contacto) =>
        contacto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        contacto.alias.toLowerCase().includes(busqueda.toLowerCase())
    );
    listarDestinatarios(contactosFiltrados);
  });
};

const setupFiltroTransacciones = () => {
  const selectTransacciones = document.getElementById('tipo-transaccion');
  if (!selectTransacciones) return;

  selectTransacciones.addEventListener('change', (evento) => {
    const tipoTransaccion = evento.target.value;
    const transaccionesActuales = leerLS(KEY_TRANSACCIONES);
    const transaccionesFiltradas = transaccionesActuales.filter((transaccion) =>
      transaccion.tipo.includes(tipoTransaccion)
    );
    listarTransacciones(transaccionesFiltradas);
  });
};

// ------------------------------------------------
// ############### SETUP DE EVENTOS ###############
// ------------------------------------------------
const setupMenuHandler = () => {
  const opciones = document.getElementsByClassName('opcion-menu');
  if (!opciones) return;

  for (let opcion of opciones) {
    opcion.addEventListener('click', (evento) => {
      const href = evento.target.dataset.href;
      const texto = evento.target.textContent.trim();

      alertar(`Redirigiendo a "${texto}"`);
      redirigir(href);
    });
  }
};

const toogleFormTransferencia = (destinatario = '') => {
  const contFiltro = document.getElementById('contenedor-filtro');
  const contTransferencia = document.getElementById('contenedor-transferencia');
  const titulo = contTransferencia.querySelector('#titulo');
  titulo.innerText = `Transferencia a ${destinatario}`;
  contFiltro.classList.toggle('d-none');
  contTransferencia.classList.toggle('d-none');
};

// ------------------------------------------------
// ############ FUNCION INICIALIZADORA ############
// ------------------------------------------------
const main = () => {
  // MOSTRAR DATOS
  mostrarSaldoActual();
  listarDestinatarios(leerLS(KEY_CONTACTOS));
  listarTransacciones(leerLS(KEY_TRANSACCIONES));

  // CONFIGURACIÓN FORMULARIOS
  setupFormLogin();
  setupFormDeposito();
  setupFormTransferencia();
  setupFormCrearDestinatario();

  // CONFIGURACIÓN FILTROS
  setupFiltroDestinatarios();
  setupFiltroTransacciones();

  // CONFIGURACIÓN OTROS EVENTOS
  setupMenuHandler();
};

document.addEventListener('DOMContentLoaded', main);
