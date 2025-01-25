const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB povezivanje
mongoose.connect('mongodb://127.0.0.1:27017/e_Dnevnik')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Schema za korisnika
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Ruta za registraciju
app.post('/register', async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  const user = new User({ firstName, lastName, username, password });
  await user.save();
  console.log('User saved:', user); // Logiraj korisnika
  res.send({ message: 'User registered!' });
});

// Ruta za login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      // Login uspješan - šaljemo potvrdu
      res.send({ message: 'Login successful!', loggedIn: true });
    } else {
      res.status(400).send({ message: 'Invalid credentials!' });
    }

});
  /*app.post('/update-grade', async (req, res) => {
  const { role } = req.headers; // Pretpostavljamo da je uloga prosleđena kroz zaglavlje
  const { index, grade } = req.body;

  if (role !== 'teacher') {
    return res.status(403).json({ message: 'Nemate dozvolu za ovu akciju' });
  }

  // Ažuriraj ocenu samo ako je korisnik nastavnik
  grades[index].grade = grade;
  res.status(200).json({ message: 'Ocjena uspešno ažurirana!' });
});*/
  

  app.get('/isLoggedIn', (req, res) => {
    // Ovo je samo test, ovdje bi išao pravi token check
    res.status(200).send({ loggedIn: true });
  });

  app.post('/updateProfile', async (req, res) => {
    const { fullName, email, password } = req.body;

     // Provjeri jesu li svi podaci poslani
    if (!fullName || !email || !password) {
        return res.status(400).send({ message: 'Svi podaci su obavezni!' });
    }

    try {
      // Primjer ažuriranja u MongoDB
      const updatedUser = await User.updateOne(
        { email }, // Pretražuje korisnika po emailu
        { $set: { fullName, email, password } } // Ažurira korisničke podatke
      );
  
      if (updatedUser.modifiedCount > 0) {
        res.status(200).send({ message: 'Podaci su uspješno ažurirani!' });
      } else {
        res.status(400).send({ message: 'Nema promjena.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Greška na serveru.' });
    }
  });

// Ruta za dohvaćanje predmeta
app.get('/subjects', async (req, res) => {
    try {
      const subjects = [
        { name: 'Matematika', teacher: 'Prof. Perić',icon:"🔢"},
        { name: 'Hrvatski jezik', teacher: 'Prof. Horvat', icon: "📚" },
        { name: 'Engleski jezik', teacher: 'Prof. Matić', icon:"🗣️" },
        { name: 'Informatika', teacher: 'Prof. Novak', icon: "🖥️" },
        { name: 'Biologija', teacher: 'Prof. Babić', icon: "🌱" },
        { name: 'Kemija', teacher: 'Prof. Lovrić' , icon: "🔬"},
        { name: 'Fizika', teacher: 'Prof. Šarić' , icon: "🌌"},
        { name: 'Povijest', teacher: 'Prof. Tomić', icon: "📜" },
        { name: 'Geografija', teacher: 'Prof. Jurić', icon: "🌎"},
        { name: 'Tehnička kultura', teacher: 'Prof. Maričić', icon:"🛠️"},
        { name: 'Njemački jezik', teacher: 'Prof. Kovač', icon: "🍺"},
        { name: 'Vjeronauk', teacher: 'Prof. Zorić', icon: "🙏"},
        { name: 'TZK', teacher: 'Prof. Vuković', icon: "⚽" },
        { name: 'Likovna kultura', teacher: 'Prof. Đukić', icon: "🎨" },
        { name: 'Glazbena kultura', teacher: 'Prof. Pavlović', icon: "🎼" },
      ];
      res.status(200).json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Greška na serveru.' });
    }
  });

  app.get('/subjects/matematika', (req, res) => {
    const subjectsData = {
      matematika: {
        grades: [
          { date: "2023-09-15", grade: 5, note: "Odličan rezultat na testu" },
          { date: "2023-10-05", grade: 4, note: "Domaća zadaća" },
        ],
        notes: ["Priprema za test iz trigonometrije", "Ponoviti funkcije"],
      },
      hrvatski: {
        grades: [
          { date: "2023-09-10", grade: 4, note: "Esej na temu domovine" },
          { date: "2023-10-01", grade: 5, note: "Usmeni odgovor" },
        ],
        notes: ["Pročitati lektiru 'Zlatarovo zlato'", "Ponoviti padeže"],
      },
    };
  
    const subjectName = req.params.name.toLowerCase();
    res.json(subjectsData[subjectName] || { grades: [], notes: [] });
  });
  
  

// Ruta za logout
app.post('/logout', (req, res) => {
    res.status(200).send({ message: 'Uspješna odjava!' });
  });
  
mongoose.connect('mongodb://127.0.0.1:27017/e_Dnevnik')
  .then(() => {
    console.log('Connected to MongoDB:', mongoose.connection.name); // Logiraj ime baze
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
