// seedHorarios.js
import mongoose from 'mongoose';
import Ruta from './models/ruta.model.js';
import Parada from './models/parada.model.js';
import Horario from './models/horario.model.js';
import Tarifa from './models/tarifa.model.js';

await mongoose.connect('mongodb://localhost:27017/tuapp'); // reemplazar si usás Atlas

const ruta = await Ruta.create({
    nombre: 'Santa Lucia - Monteros',
    id_admin: null // opcional
});

const nombresParadas = [
    'SANTA LUCIA', 'ZAVALIA', 'LA CORTADA', 'LA CIENAGA', 'KM 3',
    'ALTO VERDE', 'ACHERAL', 'CERVECERIA', 'STO DOMINGO', 'CITROMAX', 'MONTEROS'
];

const paradas = await Promise.all(nombresParadas.map(nombre =>
    Parada.create({ nombre, ubicacion: 'Tucumán', id_ruta: ruta._id })
));

const horariosLista = [
    '07:00', '07:30', '08:00', '08:30', '09:00'
];

for (let hora of horariosLista) {
    for (let i = 0; i < paradas.length; i++) {
        const minutosOffset = i * 7;
        const [h, m] = hora.split(':').map(Number);
        const newMinutes = m + minutosOffset;
        const newHour = h + Math.floor(newMinutes / 60);
        const formatted = `${String(newHour).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`;

        await Horario.create({
            id_ruta: ruta._id,
            id_parada: paradas[i]._id,
            horario: formatted
        });
    }
}

// Tarifas base desde Santa Lucia
const tarifas = [
    { destino: 'MONTEROS', precio: 1510.00 },
    { destino: 'CERVECERIA', precio: 790.00 },
    { destino: 'ACHERAL', precio: 920.00 }
];

for (let t of tarifas) {
    await Tarifa.create({
        id_ruta: ruta._id,
        tipoOrigen: 'SANTA LUCIA',
        destino: t.destino,
        precio: t.precio
    });
}

console.log('Datos insertados correctamente');
process.exit();
