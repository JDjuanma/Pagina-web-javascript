// Juan Manuel Díaz - N° 327538


window.addEventListener("load", inicio);
let sistema = new Sistema();
let mapaGoogle;
function mostrarSoloDatos() {
    document.getElementById("idSectionDatos").style.display = "block";
    document.getElementById("idSectionEstadisticas").style.display = "none";
}
function mostrarSoloEstadisticas() {
    document.getElementById("idSectionDatos").style.display = "none";
    document.getElementById("idSectionEstadisticas").style.display = "block";
    actualizarMapa();
}
function inicio() {
    document.getElementById("idDatos").addEventListener("click", mostrarSoloDatos);
    document.getElementById("idEstadisticas").addEventListener("click", mostrarSoloEstadisticas);
    document.getElementById("idBotonAgregarCarrera").addEventListener("click", AgregarCarreras);
    document.getElementById("idBotonAgregarPatrocinador").addEventListener("click", AgregarPatrocinador);
    document.getElementById("idAgregar").addEventListener("click", AgregarCorredor);
    document.getElementById("idInscripcion").addEventListener("click", realizarInscripcion);
    document.getElementById("idPatrocinador").addEventListener("change", cargarPatrocinador);
    document.getElementById("idConsulta").addEventListener("change", mostrarInscriptos);
    document.getElementById("idpersona").addEventListener("change", mostrarInscriptos);
    document.getElementById("idNumero").addEventListener("change", mostrarInscriptos);
    actualizarCombos();
    inicializarMapa();
    mostrarSoloDatos();
}
function actualizarTodo() {
    actualizarCombos();
    generarEstadisticas();
    actualizarMapa();
}
function validar(condicion, mensaje) {
    let esValido = true;
    if (!condicion) {
        alert(mensaje);
        esValido = false;
    }
    return esValido;
}
function buscarElemento(lista, campo, valor) {
    let indiceEncontrado = -1;
    let resultado = null;
    for (let i = 0; i < lista.length; i = i + 1) {
        let actual = lista[i][campo];
        let comparar = valor;
        if (campo === 'nombre') {
            actual = (actual || '').toLowerCase().trim();
            comparar = (comparar || '').toLowerCase().trim();
        }
        if (actual === comparar && indiceEncontrado === -1) {
            indiceEncontrado = i;
        }
    }
    if (indiceEncontrado !== -1) {
        resultado = lista[indiceEncontrado];
    }
    return resultado;
}
function ordenarPorNombre(arreglo) {
    arreglo.sort(function(a, b) {
        let nombreA, nombreB;
        if (a.corredor) {
            nombreA = a.corredor.nombre;
            nombreB = b.corredor.nombre;
        } else {
            nombreA = a.nombre;
            nombreB = b.nombre;
        }
        return nombreA.localeCompare(nombreB);
    });
}
function ordenarPorNumero(arreglo) {
    arreglo.sort(function(a, b) {
        return a.numero - b.numero;
    });
}
function contarPor(lista, campo) {
    let conteo = {};
    for (let i = 0; i < lista.length; i++) {
        let valor = lista[i];
        let partes = campo.split(".");
        for (let j = 0; j < partes.length; j++) {
            valor = valor[partes[j]];
        }
        if (!conteo[valor]) {
            conteo[valor] = 0;
        }
        conteo[valor]++;
    }
    return conteo;
}
function textoPatrocinadores(lista) {
    let txt = "";
    for (let i = 0; i < lista.length; i = i + 1) {
        if (i > 0) { txt = txt + ", "; }
        txt = txt + lista[i].nombre + " (" + lista[i].rubro + ")";
    }
    if (txt === "") { txt = "Sin patrocinadores"; }
    return txt;
}
function obtenerPatrocinadores(carrera) {
    let patrocinadores = [];
    let listaPatrocinadores = sistema.darPatrocinadores();
    for (let i = 0; i < listaPatrocinadores.length; i = i + 1) {
        let patrocinador = listaPatrocinadores[i];
        let patrocinaCarrera = false;
        for (let j = 0; j < patrocinador.carreras.length && !patrocinaCarrera; j++) {
            if (patrocinador.carreras[j] === carrera.nombre) {
                patrocinaCarrera = true;
            }
        }
        if (patrocinaCarrera) {
            patrocinadores.push(patrocinador);
        }
    }
    return patrocinadores;
}
function buscarCarreraPorNombreYDepto(lista, nombre, departamento) {
    let resultado = null;
    let nombreComp = (nombre || '').toLowerCase().trim();
    let deptoComp = (departamento || '').toLowerCase().trim();
    for (let i = 0; i < lista.length; i++) {
        let n = (lista[i].nombre || '').toLowerCase().trim();
        let d = (lista[i].departamento || '').toLowerCase().trim();
        if (n === nombreComp && d === deptoComp) {
            resultado = lista[i];
        }
    }
    return resultado;
}
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString("es-UY");
}
function obtenerNombreDepartamento(departamento) {
    return departamento;
}
function validarFechaFicha(fechaFicha, fechaCarrera) {
    return new Date(fechaFicha) >= new Date(fechaCarrera);
}
function llenarCombo(idSelect, opciones, placeholder) {
    let sel = document.getElementById(idSelect);
    if (placeholder) {
        sel.innerHTML = "<option value=''>" + placeholder + "</option>";
    } else {
        sel.innerHTML = "";
    }
    for (let i = 0; i < opciones.length; i = i + 1) {
        let o = document.createElement("option");
        o.value = opciones[i].value;
        o.textContent = opciones[i].text;
        sel.appendChild(o);
    }
}
function AgregarCarreras() {
    let form = document.getElementById("idFormCarreras");
    let resultado = false;
    if (form.reportValidity()) {
        let nombre = document.getElementById("idCarrera").value;
        let departamento = document.getElementById("idDepartamentos").value;
        let fecha = document.getElementById("idFecha").value;
        let cupo = parseInt(document.getElementById("idCupo").value) || 30;
        let carrerasActuales = sistema.darCarreras();
        let carreraExistente = buscarCarreraPorNombreYDepto(carrerasActuales, nombre, departamento);
        if (carreraExistente) {
            alert("Ya existe una carrera con ese nombre en ese departamento");
        } else {
            sistema.AgregarCarrera(new Carrera(nombre, departamento, fecha, cupo));
            actualizarTodo();
            form.reset();
            alert("Carrera agregada exitosamente");
            resultado = true;
        }
    }
    return resultado;
}
function AgregarPatrocinador() {
    let form = document.getElementById("idFormPatrocinadores");
    let resultado = false;
    if (form.reportValidity()) {
        let nombre = document.getElementById("idPatrocinador").value;
        let rubro = document.getElementById("idRubro").value;
        let selectCarreras = document.getElementById("idPatrocinadorCarreras");
        let carreras = [];
        for (let i = 0; i < selectCarreras.options.length; i++) {
            if (selectCarreras.options[i].selected) {
                carreras.push(selectCarreras.options[i].value);
            }
        }
        if (carreras.length > 0) {
            let existente = buscarElemento(sistema.darPatrocinadores(), 'nombre', nombre);
            if (existente) {
                existente.rubro = rubro;
                existente.carreras = carreras;
                alert("Patrocinador modificado exitosamente");
            } else {
                sistema.AgregarPatrocinador(new Patrocinador(nombre, rubro, carreras));
                alert("Patrocinador agregado exitosamente");
            }
            actualizarMapa();
            form.reset();
            resultado = true;
        } else {
            alert("Debe seleccionar al menos una carrera");
        }
    }
    return resultado;
}
function cargarPatrocinador() {
    let nombre = document.getElementById("idPatrocinador").value;
    let resultado = false;
    if (nombre) {
        let patrocinador = buscarElemento(sistema.darPatrocinadores(), 'nombre', nombre);
        if (patrocinador) {
            document.getElementById("idRubro").value = patrocinador.rubro;
            let select = document.getElementById("idPatrocinadorCarreras");
            for (let i = 0; i < select.options.length; i++) {
                let opcionSeleccionada = false;
                for (let j = 0; j < patrocinador.carreras.length && !opcionSeleccionada; j++) {
                    if (select.options[i].value === patrocinador.carreras[j]) {
                        opcionSeleccionada = true;
                    }
                }
                select.options[i].selected = opcionSeleccionada;
            }
            resultado = true;
        }
    }
    return resultado;
}
function AgregarCorredor() {
    let form = document.getElementById("idFormCorredores");
    let resultado = false;
    if (form.reportValidity()) {
        let nombre = document.getElementById("idNombre").value;
        let edad = parseInt(document.getElementById("idEdad").value);
        let cedula = document.getElementById("idCedula").value;
        let fichamedica = document.getElementById("idFicha").value;
        let esElite = document.getElementById("idTipoElite").checked;
        if (edad >= 18) {
            let corredorExistente = buscarElemento(sistema.darCorredores(), 'cedula', cedula);
            if (corredorExistente) {
                alert("Ya existe un corredor con esa cédula");
            } else {
                sistema.AgregarCorredor(new Corredor(nombre, edad, cedula, fichamedica, esElite));
                actualizarTodo();
                form.reset();
                document.getElementById("idTipoComun").checked = true;
                alert("Corredor agregado exitosamente");
                resultado = true;
            }
        } else {
            alert("La edad mínima es 18 años");
        }
    }
    return resultado;
}
function actualizarCombos() {
    let carreras = sistema.darCarreras();
    ordenarPorNombre(carreras);
    let opcionesCarreras = [];
    for (let i = 0; i < carreras.length; i++) {
        opcionesCarreras.push({ value: carreras[i].nombre, text: carreras[i].nombre });
    }
    llenarCombo("idPatrocinadorCarreras", opcionesCarreras);
    let corredores = sistema.darCorredores();
    ordenarPorNombre(corredores);
    let opcionesCorredores = [];
    for (let i = 0; i < corredores.length; i++) {
        opcionesCorredores.push({ value: corredores[i].cedula, text: corredores[i].nombre + " (" + corredores[i].cedula + ")" });
    }
    llenarCombo("idCorredores", opcionesCorredores, "Seleccione un corredor");
    let opcionesCarrerasInsc = [];
    for (let i = 0; i < carreras.length; i++) {
        opcionesCarrerasInsc.push({ value: carreras[i].nombre, text: carreras[i].nombre });
    }
    llenarCombo("idCarreras", opcionesCarrerasInsc, "Seleccione una carrera");
    actualizarComboConsulta();
}
function actualizarComboConsulta() {
    let carreras = sistema.darCarreras();
    ordenarPorNombre(carreras);
    let opciones = [];
    for (let i = 0; i < carreras.length; i++) {
        opciones.push({ value: carreras[i].nombre, text: carreras[i].nombre });
    }
    llenarCombo("idConsulta", opciones, "Seleccione una carrera");
    return true;
}
function mostrarInscriptos() {
    let nombreCarrera = document.getElementById("idConsulta").value;
    let tbody = document.getElementById("idTabla");
    tbody.innerHTML = "";
    let resultado = false;
    let inscripciones = sistema.darInscripciones();
    if (nombreCarrera) {
        let inscripcionesCarrera = [];
        for (let i = 0; i < inscripciones.length; i++) {
            if (inscripciones[i].carrera.nombre === nombreCarrera) {
                inscripcionesCarrera.push(inscripciones[i]);
            }
        }
        if (inscripcionesCarrera.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No hay inscriptos en esta carrera</td></tr>';
        } else {
            if (document.getElementById("idpersona").checked) {
                ordenarPorNombre(inscripcionesCarrera);
            } else if (document.getElementById("idNumero").checked) {
                ordenarPorNumero(inscripcionesCarrera);
            }
            for (let i = 0; i < inscripcionesCarrera.length; i++) {
                let inscripcion = inscripcionesCarrera[i];
                let tr = document.createElement("tr");
                if (inscripcion.corredor.esElite) {
                    tr.className = "corredor-elite";
                }
                
                let tdNombre = document.createElement("td");
                tdNombre.textContent = inscripcion.corredor.nombre;
                tr.appendChild(tdNombre);
                
                let tdEdad = document.createElement("td");
                tdEdad.textContent = inscripcion.corredor.edad;
                tr.appendChild(tdEdad);
                
                let tdCedula = document.createElement("td");
                tdCedula.textContent = inscripcion.corredor.cedula;
                tr.appendChild(tdCedula);
                
                let tdFicha = document.createElement("td");
                tdFicha.textContent = formatearFecha(inscripcion.corredor.fichamedica);
                tr.appendChild(tdFicha);
                
                let tdNumero = document.createElement("td");
                tdNumero.textContent = inscripcion.numero;
                tr.appendChild(tdNumero);
                
                tbody.appendChild(tr);
            }
            resultado = true;
        }
    }
    return resultado;
}
function validarInscripcion(corredor, carrera) {
    let esValida = true;
    let mensaje = "";
    let yaInscrito = buscarElemento(sistema.darInscripciones(), 'corredor', corredor);
    if (yaInscrito && yaInscrito.carrera.nombre === carrera.nombre) {
        esValida = false;
        mensaje = "El corredor ya está inscrito en esta carrera";
    }
    if (esValida && carrera.inscriptos >= carrera.cupo) {
        esValida = false;
        mensaje = "No hay cupo disponible en esta carrera";
    }
    if (esValida && !validarFechaFicha(corredor.fichamedica, carrera.fecha)) {
        esValida = false;
        mensaje = "La ficha médica no está vigente para la fecha de la carrera";
    }
    if (!esValida) {
        alert(mensaje);
    }
    return esValida;
}
function realizarInscripcion() {
    let form = document.getElementById("idFormInscripciones");
    let resultado = false;
    if (form.reportValidity()) {
        let cedulaCorredor = document.getElementById("idCorredores").value;
        let nombreCarrera = document.getElementById("idCarreras").value;
        if (cedulaCorredor && nombreCarrera) {
            let corredor = buscarElemento(sistema.darCorredores(), 'cedula', cedulaCorredor);
            let carrera = buscarElemento(sistema.darCarreras(), 'nombre', nombreCarrera);
            if (corredor && carrera) {
                if (validarInscripcion(corredor, carrera)) {
                    let numeroInscripcion = carrera.inscriptos + 1;
                    let nuevaInscripcion = new Inscripcion(corredor, carrera, numeroInscripcion);
                    sistema.AgregarInscripcion(nuevaInscripcion);
                    mostrarInfoInscripcion(corredor, carrera, numeroInscripcion);
                    actualizarTodo();
                    form.reset();
                    resultado = true;
                }
            } else {
                alert("Error: No se encontró el corredor o la carrera");
            }
        } else {
            alert("Debe seleccionar un corredor y una carrera");
        }
    }
    return resultado;
}
function mostrarInfoInscripcion(corredor, carrera, numero) {
    let patrocinadores = obtenerPatrocinadores(carrera);
    let patrocinadorText = textoPatrocinadores(patrocinadores);
    let tipoCorredor;
    if (corredor.esElite) {
        tipoCorredor = 'Deportista de élite';
    } else {
        tipoCorredor = 'Deportista común';
    }
    let mensaje = `¡Inscripción exitosa!
    
Corredor: ${corredor.nombre}
Cédula: ${corredor.cedula}
Número de inscripción: ${numero}

Carrera: ${carrera.nombre}
Departamento: ${obtenerNombreDepartamento(carrera.departamento)}
Fecha: ${formatearFecha(carrera.fecha)}
Cupo: ${carrera.cupo}

Patrocinadores: ${patrocinadorText}

Tipo de corredor: ${tipoCorredor}`;
    alert(mensaje);
    generarPDF(corredor, carrera, numero, patrocinadores);
}
function generarPDF(corredor, carrera, numero, patrocinadores) {
    let patrocinadorText = textoPatrocinadores(patrocinadores);
    let tipoCorredor;
    if (corredor.esElite) {
        tipoCorredor = 'Deportista de élite';
    } else {
        tipoCorredor = 'Deportista común';
    }
    let contenidoPDF = `INSCRIPCIÓN EXITOSA\n\nCorredor: ${corredor.nombre}\nCédula: ${corredor.cedula}\nNúmero de inscripción: ${numero}\n\nCarrera: ${carrera.nombre}\nDepartamento: ${obtenerNombreDepartamento(carrera.departamento)}\nFecha: ${formatearFecha(carrera.fecha)}\nCupo: ${carrera.cupo}\n\nPatrocinadores: ${patrocinadorText}\n\nTipo de corredor: ${tipoCorredor}\n\nFecha de generación: ${new Date().toLocaleDateString("es-UY")}`;
    let doc = new window.jspdf.jsPDF();
    let lines = doc.splitTextToSize(contenidoPDF, 180);
    doc.text(lines, 10, 10);
    doc.save('inscripcion_' + corredor.nombre.split(' ').join('_') + '_' + carrera.nombre.split(' ').join('_') + '.pdf');
}
function generarEstadisticas() {
    let carreras = sistema.darCarreras();
    let inscripciones = sistema.darInscripciones();
    let corredores = sistema.darCorredores();
    let promedio;
    if (carreras.length > 0) {
        promedio = (inscripciones.length / carreras.length).toFixed(2);
    } else {
        promedio = "sin datos";
    }
    document.getElementById("idPromedio").textContent = promedio;
    let conteo = contarPor(inscripciones, "carrera.nombre");
    let max = 0;
    for (let nombreCarrera in conteo) {
        if (conteo[nombreCarrera] > max) {
            max = conteo[nombreCarrera];
        }
    }
    let carrerasMax = [];
    for (let nombreCarrera in conteo) {
        if (conteo[nombreCarrera] === max) {
            let carrera = buscarElemento(carreras, 'nombre', nombreCarrera);
            if (carrera) {
                carrerasMax.push({
                    nombre: carrera.nombre,
                    departamento: obtenerNombreDepartamento(carrera.departamento),
                    fecha: carrera.fecha,
                    cupo: carrera.cupo,
                    inscriptos: conteo[nombreCarrera]
                });
            }
        }
    }
    let carrerasMasEl = document.getElementById("idCarrerasMasInscriptos");
    carrerasMasEl.innerHTML = "";
    if (carrerasMax.length > 0 && max > 0) {
        let html = "";
        for (let i = 0; i < carrerasMax.length; i++) {
            let c = carrerasMax[i];
            html += `· ${c.nombre} en ${c.departamento} el ${formatearFecha(c.fecha)} Cupo: ${c.cupo} inscriptos: ${c.inscriptos}<br>`;
        }
        carrerasMasEl.innerHTML = html;
    } else {
        carrerasMasEl.innerHTML = "<span>Todas las carreras tienen 0 inscriptos</span>";
    }
    let carrerasConInscriptos = contarPor(inscripciones, "carrera.nombre");
    let carrerasSin = [];
    for (let i = 0; i < carreras.length; i++) {
        if (!carrerasConInscriptos[carreras[i].nombre]) {
            carrerasSin.push(carreras[i]);
        }
    }
    carrerasSin.sort(function(a, b) {
        return new Date(a.fecha) - new Date(b.fecha);
    });
    let sinInscriptosEl = document.getElementById("idCarrerasSinInscriptos");
    sinInscriptosEl.innerHTML = "";
    if (carrerasSin.length > 0) {
        let html = "";
        for (let i = 0; i < carrerasSin.length; i++) {
            let c = carrerasSin[i];
            html += `· ${c.nombre} en ${obtenerNombreDepartamento(c.departamento)} el ${formatearFecha(c.fecha)} Cupo: ${c.cupo}<br>`;
        }
        sinInscriptosEl.innerHTML = html;
    } else {
        sinInscriptosEl.innerHTML = "<span>Sin datos</span>";
    }
    let porcentajeElite = "sin datos";
    if (corredores.length > 0) {
        let corredoresElite = 0;
        for (let i = 0; i < corredores.length; i++) {
            if (corredores[i].esElite) {
                corredoresElite++;
            }
        }
        porcentajeElite = ((corredoresElite / corredores.length) * 100).toFixed(2) + "%";
    }
    document.getElementById("idPorcentajeElite").textContent = porcentajeElite;
    actualizarComboConsulta();
}
function inicializarMapa() {
    google.charts.load('current', {
        'packages':['geochart']
    });
    google.charts.setOnLoadCallback(function() {
        actualizarMapa();
    });
    document.getElementById("idMapaCarreras").addEventListener("change", actualizarMapa);
    document.getElementById("idMapaInscripciones").addEventListener("change", actualizarMapa);
}
function actualizarMapa() {
    if (document.getElementById("idMapaCarreras").checked) {
        mostrarMapaCarreras();
    } else {
        mostrarMapaInscripciones();
    }
}
function dibujarGeoChart(conteoPorDepto, etiqueta, colores) {
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Departamento');
    data.addColumn('number', etiqueta);
    for (let depto in conteoPorDepto) {
        data.addRow([depto, conteoPorDepto[depto]]);
    }
    let options = {
        region: 'UY',
        displayMode: 'regions',
        resolution: 'provinces',
        colorAxis: { colors: colores },
        backgroundColor: '#f5f5f5',
        datalessRegionColor: '#f8f9fa',
        defaultColor: '#f5f5f5'
    };
    mapaGoogle = new google.visualization.GeoChart(document.getElementById('mapContainer'));
    mapaGoogle.draw(data, options);
}
function mostrarMapaCarreras() {
    let carrerasPorD = contarPor(sistema.darCarreras(), "departamento");
    dibujarGeoChart(carrerasPorD, "Carreras", ['#e0f2f1', '#00695c']);
}
function mostrarMapaInscripciones() {
    let inscPorD = contarPor(sistema.darInscripciones(), "carrera.departamento");
    dibujarGeoChart(inscPorD, "Inscripciones", ['#fff3e0', '#f57c00']);
}