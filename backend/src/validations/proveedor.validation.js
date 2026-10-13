import { errorValidacion } from '../utils/ApiError.js'

// ---------------------------------------------------------------------------
// VALIDACIONES DE PROVEEDOR
// Los 4 campos son obligatorios (las mismas reglas que imponía el formulario
// del frontend). El nombre duplicado lo resuelve el índice único con
// collation del modelo, que responde 409.
// ---------------------------------------------------------------------------
const CAMPOS = [
    { campo: 'nombre', mensaje: 'El nombre del proveedor es obligatorio.' },
    { campo: 'telefono', mensaje: 'El teléfono del proveedor es obligatorio.' },
    { campo: 'email', mensaje: 'El correo electrónico del proveedor es obligatorio.' },
    { campo: 'direccion', mensaje: 'La dirección del proveedor es obligatoria.' }
]

export function validarProveedor(datos) {
    if (!datos || typeof datos !== 'object') {
        throw errorValidacion('No se recibieron datos del proveedor.')
    }

    const proveedor = {}

    for (const regla of CAMPOS) {
        const valor = String(datos[regla.campo] ?? '').trim()

        if (!valor) {
            throw errorValidacion(regla.mensaje)
        }

        proveedor[regla.campo] = valor
    }

    return proveedor
}
