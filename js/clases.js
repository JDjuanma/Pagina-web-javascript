// Juan Manuel Díaz - N° 327538

class Carrera {
    constructor(nombre, departamento, fecha, cupo = 30) {
        this.nombre = nombre;
        this.departamento = departamento;
        this.fecha = fecha;
        this.cupo = cupo;
        this.inscriptos = 0;
    }
}

class Patrocinador {
    constructor(nombre, rubro, carreras) {
        this.nombre = nombre;
        this.rubro = rubro;
        this.carreras = carreras;
    }
}

class Corredor {
    constructor(nombre, edad, cedula, fichamedica, esElite = false) {
        this.nombre = nombre;
        this.edad = edad;
        this.cedula = cedula;
        this.fichamedica = fichamedica;
        this.esElite = esElite;
    }
}

class Inscripcion {
    constructor(corredor, carrera, numero) {
        this.corredor = corredor;
        this.carrera = carrera;
        this.numero = numero;
    }
}

class Sistema {
    constructor() {
        this.listaCarreras = [];
        this.listaPatrocinadores = [];
        this.listaCorredores = [];
        this.listaInscripciones = [];
    }

    AgregarCarrera(carrera) {
        let lista = this.listaCarreras;
        lista.push(carrera);
    }

    AgregarPatrocinador(patrocinador) {
        let existente = null;
        for (let i = 0; i < this.listaPatrocinadores.length; i = i + 1) {
            if (this.listaPatrocinadores[i].nombre === patrocinador.nombre) {
                existente = this.listaPatrocinadores[i];
            }
        }
        if (existente) {
            existente.rubro = patrocinador.rubro;
            existente.carreras = patrocinador.carreras;
        } else {
            this.listaPatrocinadores.push(patrocinador);
        }
    }    AgregarCorredor(corredor) {
        this.listaCorredores.push(corredor);
    }
    
    AgregarInscripcion(inscripcion) {
        this.listaInscripciones.push(inscripcion);
        inscripcion.carrera.inscriptos++;
    }

    darPatrocinadores() {
        return this.listaPatrocinadores;
    }
    darCarreras() {
        return this.listaCarreras;
    }
    darCorredores() {
        return this.listaCorredores;
    }
    darInscripciones() {
        return this.listaInscripciones;
    }
}