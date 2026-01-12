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
const KEY_MOVIMIENTOS = 'movimientos';

// ------------------------------------------------
// ############# FUNCIONES AUXILIARES #############
// ------------------------------------------------
const formatearDinero = (monto, conSimbolo = true) => {
  const opciones = conSimbolo ? { style: 'currency', currency: 'CLP' } : {};
  const resultado = new Intl.NumberFormat('es-CL', opciones).format(monto);
  return resultado;
};

const formatearFecha = (fecha) => {
  const fechaSinFormato = new Date(fecha);

  return fechaSinFormato.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
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

  if (!exito) {
    alerta.innerText = mensaje;
    return;
  }

  alerta.innerHTML = `
    <div
      id="spinner-alerta"
      role="status"
      class="spinner-border spinner-border-sm text-success me-2"
    >
      <span class="visually-hidden">Cargando...</span>
    </div>
    ${mensaje}
  `;
};

const toast = (mensaje, exito = true) => {
  const toast = document.getElementById('liveToast');
  const toastIcon = toast.querySelector('#toast-icon');
  const toastBody = toast.querySelector('#toast-message');

  toastBody.innerHTML = mensaje;
  toast.className = exito
    ? 'toast bg-success-subtle'
    : 'toast bg-danger-subtle';
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
  const datosForm = new FormData(formulario);
  return Object.fromEntries(datosForm.entries());
};

const mensajeSinRegistros = (contenedor, mensaje) => {
  contenedor.innerHTML = `
    <div class="text-center text-muted opacity-50">
      <i
        class="bi bi-patch-question text-muted"
        style="font-size: 80px"
      ></i>
      <h3 class="fw-bold">${mensaje}</h3>
    </div>
  `;
};

const registrarMovimiento = (movimiento) => {
  const movimientosActuales = leerLS(KEY_MOVIMIENTOS);
  movimientosActuales.unshift(movimiento);
  actualizarLS(KEY_MOVIMIENTOS, movimientosActuales);
};

// ------------------------------------------------
// ############## MOSTRAR INFORMACIÓN #############
// ------------------------------------------------
const mostrarSaldoActual = () => {
  const saldoSpan = document.getElementById('saldo');
  if (!saldoSpan) return;
  saldoSpan.innerText = formatearDinero(leerLS(KEY_SALDO));
};

const listarContactos = (contactos) => {
  const contenedorFiltro = document.getElementById('contenedor-filtro');
  const contenedorContactos = document.getElementById('contactos');
  const contTransferencia = document.getElementById('contenedor-transferencia');

  if (!contenedorFiltro || !contenedorContactos) return;
  const contactosRegistrados = leerLS(KEY_CONTACTOS);

  contenedorFiltro.classList.remove('d-none');
  contenedorContactos.classList.remove('d-none');
  contTransferencia.classList.add('d-none');

  if (!contactosRegistrados.length) {
    contenedorFiltro.classList.add('d-none');
    mensajeSinRegistros(contenedorContactos, 'No hay contactos');
    contenedorContactos.innerHTML += `
      <button
        type="button"
        class="btn btn-dark btn-main mx-auto mt-3"
        data-bs-toggle="modal"
        data-bs-target="#nuevo-contacto"
      >
        <i class="bi bi-person-fill-add"></i>
        Crear
      </button>
    `;
    return;
  }

  if (!contactos.length) {
    mensajeSinRegistros(contenedorContactos, 'Sin resultados');
    return;
  }

  contenedorContactos.innerHTML = '';

  contactos.forEach((contacto) => {
    const alias = contacto.alias !== '' ? `(${contacto.alias})` : '';
    const boton = `
      <button
        class="btn btn-outline-dark btn-outline-main border d-flex align-items-center gap-3 p-2 rounded-2"
        data-contacto="${contacto.nombre}"
      >
        <img src="assets/img/usuario.png" width="36" alt="Avatar" />
        <div class="d-flex flex-column align-items-start">
          <span class="fw-bold">${contacto.nombre} ${alias}</span>
          <span class="fs-7">${contacto.banco} - ${contacto.cbu}</span><span></span>
        </div>
      </button>
    `;

    contenedorContactos.innerHTML += boton;
  });

  contenedorContactos.addEventListener('click', (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;
    abrirFormTransferencia(boton.dataset.contacto);
  });
};

const listarMovimientos = (movimientos) => {
  const contenedorMovimientos = document.getElementById('movimientos');
  const contenedorFiltro = document.getElementById('contenedor-filtro');
  if (!contenedorMovimientos || !contenedorFiltro) return;
  const movimientosRegistrados = leerLS(KEY_MOVIMIENTOS);

  if (!movimientosRegistrados.length) {
    mensajeSinRegistros(contenedorMovimientos, 'Sin movimientos');
    contenedorFiltro.classList.add('d-none');
    return;
  }

  if (!movimientos.length) {
    mensajeSinRegistros(contenedorMovimientos, 'Sin resultados');
    return;
  }

  contenedorMovimientos.innerHTML = '';

  movimientos.forEach((movimiento) => {
    const color = movimiento.monto < 0 ? 'danger' : 'success';
    const tarjeta = `
      <li class="list-group-item">
        <div class="d-flex justify-content-between fw-light fs-7">
          <span>${formatearFecha(movimiento.fecha)}</span>
          <span>${movimiento.asunto}</span>
        </div>
        <div class="d-flex justify-content-between gap-2">
          <span>${movimiento.tipo}</span>
          <span class="text-right text-${color}">
            ${formatearDinero(movimiento.monto)}
          </span>
        </div>
      </li>
    `;

    contenedorMovimientos.innerHTML += tarjeta;
  });
};

// ------------------------------------------------
// ############# SETUP DE FORMULARIOS #############
// ------------------------------------------------
const setupFormLogin = () => {
  const formularioLogin = document.getElementById('form-login');
  if (!formularioLogin) return;

  formularioLogin.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = extraerDatosForm(evento.target);

    if (form.email === EMAIL_CORRECTO && form.password === CLAVE_CORRECTA) {
      alertar('Inicio de sesión exitoso. Redireccionando...');
      evento.submitter.disabled = true;
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
    let montoOperacion = parseInt(form.monto.replace('.', ''));
    const operacion = evento.submitter.dataset.operacion;
    const saldoActual = leerLS(KEY_SALDO);

    if (montoOperacion === 0) {
      toast('Ingrese un monto mayor que $0', false);
      return;
    }

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
    registrarMovimiento({
      tipo: operacion,
      monto: montoOperacion,
      fecha: new Date(),
      asunto: form.asunto,
    });
    toast(
      `Se ha realizado un <span class="fw-bold">${operacion.toLowerCase()}</span> de <span class="fw-bold">${formatearDinero(
        montoOperacion
      )}</span>`
    );
    redirigir('menu.html', 2000);
  });
};

const setupFormCrearContacto = () => {
  const formNuevoContacto = document.getElementById('form-contacto');
  if (!formNuevoContacto) return;

  formNuevoContacto.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const nuevoContacto = extraerDatosForm(evento.target);
    const contactosActuales = leerLS(KEY_CONTACTOS);
    contactosActuales.push(nuevoContacto);
    actualizarLS(KEY_CONTACTOS, contactosActuales);
    document.activeElement.blur();
    const elementoModal = document.getElementById('nuevo-contacto');
    const bsModal = bootstrap.Modal.getInstance(elementoModal);
    bsModal.hide();
    formNuevoContacto.reset();
    listarContactos(contactosActuales);
  });
};

const setupFormTransferencia = () => {
  const formTransferencia = document.getElementById('form-transferencia');
  if (!formTransferencia) return;

  formTransferencia.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const form = extraerDatosForm(evento.target);
    const montoOperacion = parseInt(form.monto.replace('.', ''));
    const saldoActual = leerLS(KEY_SALDO);

    if (montoOperacion === 0) {
      toast('Ingrese un monto mayor que $0', false);
      return;
    }

    if (montoOperacion > saldoActual) {
      toast('Saldo insuficiente', false);
      return;
    }

    actualizarLS(KEY_SALDO, saldoActual - montoOperacion);
    mostrarSaldoActual();
    registrarMovimiento({
      tipo: formTransferencia.previousElementSibling.innerText,
      monto: -montoOperacion,
      fecha: new Date(),
      asunto: form.asunto,
    });
    toast('Transferencia realizada exitosamente');
    formTransferencia.reset();
    const contactos = leerLS(KEY_CONTACTOS);
    listarContactos(contactos);
  });

  const botonCancelar = document.getElementById('cancelar');
  botonCancelar.onclick = () => {
    formTransferencia.reset();
    const contactos = leerLS(KEY_CONTACTOS);
    listarContactos(contactos);
  };
};

// ------------------------------------------------
// ############### SETUP DE FILTROS ###############
// ------------------------------------------------
const setupFiltroContactos = () => {
  const buscadorContactos = document.getElementById('buscador');
  if (!buscadorContactos) return;

  buscadorContactos.addEventListener('input', (evento) => {
    const busqueda = evento.target.value.toLowerCase();
    const contactosActuales = leerLS(KEY_CONTACTOS);
    const contactosFiltrados = contactosActuales.filter(
      (contacto) =>
        contacto.nombre.toLowerCase().includes(busqueda) ||
        contacto.alias.toLowerCase().includes(busqueda)
    );
    listarContactos(contactosFiltrados);
  });
};

const setupFiltroMovimientos = () => {
  const selectMovimientos = document.getElementById('tipo-movimiento');
  if (!selectMovimientos) return;

  selectMovimientos.addEventListener('change', (evento) => {
    const tipoMovimiento = evento.target.value;
    const movimientosActuales = leerLS(KEY_MOVIMIENTOS);
    const movimientosFiltrados = movimientosActuales.filter((movimiento) =>
      movimiento.tipo.includes(tipoMovimiento)
    );
    listarMovimientos(movimientosFiltrados);
  });
};

// ------------------------------------------------
// ############### SETUP DE EVENTOS ###############
// ------------------------------------------------
const setupMenuHandler = () => {
  const opciones = document.getElementsByClassName('opcion-menu');
  if (!opciones.length) return;

  for (let opcion of opciones) {
    opcion.addEventListener('click', (evento) => {
      const href = evento.currentTarget.dataset.href;
      const texto = evento.currentTarget.innerText;

      for (let boton of opciones) {
        boton.disabled = true;
      }

      alertar(`Redirigiendo a "${texto}"`);
      redirigir(href);
    });
  }
};

const setupTooltips = () => {
  const listaTooltip = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...listaTooltip].map((trigger) => new bootstrap.Tooltip(trigger));
};

const setupInputMonto = () => {
  const inputMonto = document.getElementById('monto');
  if (!inputMonto) return;

  inputMonto.addEventListener('input', (evento) => {
    let monto = evento.target.value.replace(/\D/g, '');

    if (!monto) {
      evento.target.value = '';
      return;
    }

    const montoFormateado = formatearDinero(monto, false);
    evento.target.value = montoFormateado;
  });
};

// !REVISAR
const abrirFormTransferencia = (nombre = '') => {
  const contFiltro = document.getElementById('contenedor-filtro');
  const contenedorContactos = document.getElementById('contactos');
  const contTransferencia = document.getElementById('contenedor-transferencia');

  const titulo = contTransferencia.querySelector('#titulo');
  if (titulo) {
    titulo.innerText = `Transferencia a ${nombre}`;
  }

  contFiltro.classList.add('d-none');
  contenedorContactos.classList.add('d-none');
  contTransferencia.classList.remove('d-none');
};

// ------------------------------------------------
// ############ FUNCION INICIALIZADORA ############
// ------------------------------------------------
const main = () => {
  // MOSTRAR DATOS
  mostrarSaldoActual();
  listarContactos(leerLS(KEY_CONTACTOS));
  listarMovimientos(leerLS(KEY_MOVIMIENTOS));

  // CONFIGURACIÓN FORMULARIOS
  setupFormLogin();
  setupFormDeposito();
  setupFormTransferencia();
  setupFormCrearContacto();

  // CONFIGURACIÓN FILTROS
  setupFiltroContactos();
  setupFiltroMovimientos();

  // CONFIGURACIÓN OTROS EVENTOS
  setupMenuHandler();
  setupTooltips();
  setupInputMonto();
};

document.addEventListener('DOMContentLoaded', main);
