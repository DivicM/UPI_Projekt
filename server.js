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

  app.get('/isLoggedIn', (req, res) => {
    // Ovo je samo test, ovdje bi išao pravi token check
    res.status(200).send({ loggedIn: true });
  });

  app.post('/updateProfile', async (req, res) => {
    const { fullName, email, password } = req.body;
  
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
  

mongoose.connect('mongodb://127.0.0.1:27017/e_Dnevnik')
  .then(() => {
    console.log('Connected to MongoDB:', mongoose.connection.name); // Logiraj ime baze
  })
  .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
