// Importación de módulos y configuración
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const Joi = require('joi');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuración del pool de PostgreSQL usando variables de entorno
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

// Esquemas Joi para la validación
const usuarioSchema = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    balance: Joi.number().min(0).required()
});

const transferenciaSchema = Joi.object({
    emisor: Joi.number().required(),
    receptor: Joi.number().required(),
    monto: Joi.number().min(1).required()
});

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas CRUD para usuarios
app.post('/usuario', async (req, res) => {
    const { error, value } = usuarioSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const result = await pool.query(
            'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *',
            [value.nombre, value.balance]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el usuario');
    }
});

app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener los usuarios');
    }
});

app.put('/usuario/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, balance } = req.body;
    const { error } = usuarioSchema.validate({ nombre, balance });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const result = await pool.query(
            'UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *',
            [id, nombre, balance]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar el usuario');
    }
});

app.delete('/usuario/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar el usuario');
    }
});

// Ruta para manejar transferencias
app.post('/transferencia', async (req, res) => {
    const { emisor, receptor, monto } = req.body;
    try {
        await pool.query('BEGIN');
        const deductBalance = 'UPDATE usuarios SET balance = balance - $1 WHERE id = $2 AND balance >= $1';
        const addBalance = 'UPDATE usuarios SET balance = balance + $1 WHERE id = $2';
        await pool.query(deductBalance, [monto, emisor]);
        const resultDeduct = await pool.query('SELECT * FROM usuarios WHERE id = $1', [emisor]);

        if (resultDeduct.rows[0].balance < 0) {
            throw new Error('Insufficient funds');
        }

        await pool.query(addBalance, [monto, receptor]);
        const insertTransfer = 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *';
        const result = await pool.query(insertTransfer, [emisor, receptor, monto]);
        await pool.query('COMMIT');
        res.status(201).send('Transferencia realizada con éxito');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Transaction Error:', err);
        res.status(500).send('Error al realizar la transferencia: ' + err.message);
    }
});

// Ruta para obtener todas las transferencias con nombres
app.get('/transferencias', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.id, 
                   t.emisor, 
                   e.nombre AS nombre_emisor, 
                   t.receptor, 
                   r.nombre AS nombre_receptor, 
                   t.monto, 
                   t.fecha
            FROM transferencias t
            JOIN usuarios e ON t.emisor = e.id
            JOIN usuarios r ON t.receptor = r.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener las transferencias');
    }
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
