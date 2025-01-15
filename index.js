const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Middleware
app.use(cors());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/E-Dnevnik');

const db = mongoose.connection;
db.on('error', (error) => {
    console.error('Error connecting to the database:', error);
});
db.once('open', () => {
    console.log('Connected to the database.');
});

// Port Configuration
const port = 5500;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Schemas and Models
const { Schema } = mongoose;

const ucenikShema = new Schema({
    redni_broj: Number,
    ime_i_prezime: String,
    datum_rodenja: String,
    mjesto_rodenja: String,
    maticni_broj: String,
    adresa: String,
    program: String,
    podaci_o_roditeljima: {
        majka: String,
        otac: String,
        adresa: String,
        telefon: Number,
    },
    oib: String,
});

const Ucenik = mongoose.model('Ucenik', ucenikShema, 'osobni_podaci');

const studentiShema = new Schema({
    ime: String,
    prezime: String,
    razred: String,
    korisnicko_ime: String,
    lozinka: String,
    skola: {
        naziv: String,
        mjesto: String,
    },
    ime_prezime_razrednika: String,
});

const Studenti = mongoose.model('Studenti', studentiShema, 'studenti');

// Routes for "Ucenik"
app.get('/osobni_podaci', async (req, res) => {
    try {
        const sviUcenici = await Ucenik.find();
        res.json(sviUcenici);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
});

// Routes for "Studenti"
app.post('/studenti', async (req, res) => {
    const { korisnicko_ime, lozinka } = req.body;

    try {
        const student = await Studenti.findOne({ korisnicko_ime, lozinka });

        if (student) {
            res.json({ success: true, student });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error verifying login:', error);
        res.status(500).json({ success: false, message: 'Error verifying login' });
    }
});

app.get('/studenti', async (req, res) => {
    try {
        const sviStudenti = await Studenti.find();
        res.json(sviStudenti);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Error fetching students' });
    }
});
