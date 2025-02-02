const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
require("dotenv").config();

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Za HTML forme




mongoose.connect("mongodb+srv://anetakalabric65:gnOg26vktfpBzjxx@cluster0.xsqni.mongodb.net/e_Dnevnik?retryWrites=true&w=majority&appName=Cluster0"
).then(() => {
  console.log("✅ Uspješno spojeno na MongoDB Atlas");
}).catch((error) => {
  console.error("❌ Greška pri povezivanju s MongoDB Atlasom:", error);
});
// Schema za korisnika
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  role: { type: String, enum: ["student", "nastavnik"], default: "student" }, // Dodano polje role
  resetToken: String,          // Token za resetiranje lozinke
  tokenExpiration: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;


// Kreiraj model za izostanke ako ne postoji
const absenceSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  note: { type: String },
}, { timestamps: true });

const Absence = mongoose.model("Absence", absenceSchema);
const provjeriToken = async (req, res, next) => {
  const authZaglavlje = req.headers["authorization"];

  if (!authZaglavlje) {
    console.error("❌ Ne postoji autorizacijsko zaglavlje!");
    return res.status(403).json({ message: "Niste prijavljeni!" });
  }

  const token = authZaglavlje.split(' ')[1];

  if (!token) {
    console.error("❌ Bearer token nije pronađen!");
    return res.status(403).json({ message: "Niste prijavljeni!" });
  }

  try {
    const dekodiraniToken = jwt.verify(token, process.env.JWT_SECRET);
    //  Dohvati korisnika iz baze pomoću emaila iz tokena
    const user = await User.findOne({ username: dekodiraniToken.username });

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }
    //  Postavi korisnika u req objekt da se može koristiti dalje u rutama
    req.korisnik = { username: user.username, role: user.role };

    ///req.korisnik = dekodiraniToken;
    console.log("✅ Korisnik je prijavljen kao:", req.korisnik);
  } catch (err) {
    console.error("❌ Neispravan token:", err.message);
    return res.status(401).json({ message: "Neispravan token" });
  }
  return next();
};

app.get('/debug-token', provjeriToken, (req, res) => {
  res.json({ idUser: req.korisnik });
});


app.get("/absences", provjeriToken, async (req, res) => {
  try {
    const loggedInUser = req.korisnik.username;
    const role = req.korisnik.role;

    let absences;
    if (role === "nastavnik") {
      absences = await Absence.find(); // Nastavnici vide sve
    } else {
      absences = await Absence.find({ username: loggedInUser }); // Učenici vide samo svoje
    }

    res.json(absences);
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru!" });
  }
});


app.post("/absences/update", provjeriToken, async (req, res) => {
  if (req.korisnik.role !== "nastavnik") {
    return res.status(403).json({ message: "Nemate ovlasti za uređivanje izostanaka." });
  }

  const { username, data } = req.body;
  await Absence.deleteMany({ username: username }); // Brišemo stare podatke
  await Absence.insertMany(data.map(item => ({ ...item, username: username }))); // Ubacujemo nove

  res.json({ message: "Izostanci uspješno ažurirani!" });
})




app.delete("/absences/delete/:id", provjeriToken, async (req, res) => {
  try {
    //  Samo nastavnik može brisati izostanke
    if (req.korisnik.role !== "nastavnik") {
      return res.status(403).json({ message: "Nemate ovlasti za brisanje izostanaka." });
    }

    const absenceId = req.params.id;

    //  Provjeri je li `id` ispravan MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(absenceId)) {
      return res.status(400).json({ message: "Neispravan ID izostanka!" });
    }

    console.log(`📌 Nastavnik ${req.korisnik.username} briše izostanak s ID: ${absenceId}`);

    //  Pronađi i obriši izostanak
    const deletedAbsence = await Absence.findByIdAndDelete(absenceId);

    if (!deletedAbsence) {
      return res.status(404).json({ message: "Izostanak nije pronađen!" });
    }

    console.log(`✅ Izostanak s ID ${absenceId} uspješno obrisan.`);
    res.json({ message: "Izostanak uspješno obrisan!" });

  } catch (error) {
    console.error("❌ Greška pri brisanju izostanka:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});



app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, password, role } = req.body;

    //  Provjeri postoji li korisnik s istim emailom
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Korisnik s tim emailom već postoji." });
    }

    //  Ako `role` nije postavljen, postavi ga na `"student"`
    const userRole = role || "student";

    //  Kreiraj novog korisnika
    const user = new User({
      firstName,
      lastName,
      username,
      password, //  Dodaj hashiranje lozinke ako treba
      role: userRole //  Sprema ulogu u bazu
    });

    await user.save();
    res.json({ message: "Registracija uspješna!" });

  } catch (error) {
    console.error("❌ Greška pri registraciji:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Pronađi korisnika u bazi
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: " Neispravan email ili lozinka!" });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: " Neispravna lozinka!" });
    }

    //  Generiraj token i prijavi korisnika
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Uspješna prijava!", token });

  } catch (error) {
    console.error(" Greška pri prijavi:", error);
    res.status(500).json({ message: " Greška na serveru!" });
  }
});


app.get('/isLoggedIn', (req, res) => {
  // Ovo je samo test, ovdje bi išao pravi token check
  res.status(200).send({ loggedIn: true });
});

const multer = require("multer");

// Konfiguracija gdje se spremaju slike
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, req.korisnik.username + "-" + Date.now() + ".jpg");
  }
});

const upload = multer({ storage: storage });
app.post('/updateProfile', async (req, res) => {
  const { fullName, username, password } = req.body;

  // Provjeri jesu li svi podaci poslani
  if (!fullName || !username || !password) {
    return res.status(400).send({ message: 'Svi podaci su obavezni!' });
  }

  try {
    // Primjer ažuriranja u MongoDB
    const updatedUser = await User.updateOne(
      { username }, // Pretražuje korisnika po emailu
      { $set: { fullName, username, password } } // Ažurira korisničke podatke
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
// Ruta za ažuriranje profilne slike
app.post("/update-profile", provjeriToken, upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Nema odabrane slike!" });
  }

  const profileImage = req.file.filename;

  // Ažuriraj korisnika u bazi podataka (ovisi kako čuvaš podatke)
  req.korisnik.profileImage = profileImage;

  res.json({ message: "Profilna slika uspješno ažurirana!", profileImage });
});

// Ruta za dohvaćanje predmeta
app.get('/subjects', async (req, res) => {
  try {
    const subjects = [
      { name: 'Matematika', teacher: 'Prof. Perić', icon: "🔢" },
      { name: 'Hrvatski jezik', teacher: 'Prof. Horvat', icon: "📚" },
      { name: 'Engleski jezik', teacher: 'Prof. Matić', icon: "🗣️" },
      { name: 'Informatika', teacher: 'Prof. Novak', icon: "🖥️" },
      { name: 'Biologija', teacher: 'Prof. Babić', icon: "🌱" },
      { name: 'Kemija', teacher: 'Prof. Lovrić', icon: "🔬" },
      { name: 'Fizika', teacher: 'Prof. Šarić', icon: "🌌" },
      { name: 'Povijest', teacher: 'Prof. Tomić', icon: "📜" },
      { name: 'Geografija', teacher: 'Prof. Jurić', icon: "🌎" },
      { name: 'Tehnička kultura', teacher: 'Prof. Maričić', icon: "🛠️" },
      { name: 'Njemački jezik', teacher: 'Prof. Kovač', icon: "🍺" },
      { name: 'Vjeronauk', teacher: 'Prof. Zorić', icon: "🙏" },
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



const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Ruta za zahtjev za resetiranje lozinke
app.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ username: email });
  if (!user) {
    return res.status(404).send({ message: 'User not found!' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.tokenExpiration = Date.now() + 864000000; // Token vrijedi 1 dan
  await user.save();
  console.log('User updated with resetToken:', user); // Provjera je li token spremljen

  const resetLink = `https://9bbd-46-188-239-39.ngrok-free.app/reset-password?token=${resetToken}`;
  console.log('Generated reset link:', resetLink);
  

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'anetakalabric65@gmail.com', // Tvoj Gmail
      pass: 'phcx hiyn opkp ouwz', // Zamijeni s Google App Password
    },
  });

  const mailOptions = {
    from: 'anetakalabric65@gmail.com',
    to: email,
    subject: 'Password Reset',
    html: <p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send({ message: 'Failed to send email.' });
    }
    res.status(200).send({ message: 'Reset link sent!' });
  });
});

const validator = require('validator');

app.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  console.log('Token received in POST request:', token); // Provjera

  if (!token) {
    return res.status(400).send('Missing token!');
  }

  // Provjeri jesu li lozinke iste
  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match!');
  }
  // **Provjera jačine lozinke**
  if (!validator.isStrongPassword(newPassword, { minLength: 8, minSymbols: 1 })) {
    return res.status(400).send('Password is too weak! Use at least 8 characters, 1 symbol, and 1 uppercase letter.');
  }


  console.log('Token received in POST request:', token);
  console.log('Current time:', Date.now());
  try {
    // Pronađi korisnika s odgovarajućim tokenom
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() }, // Provjeri je li token još važeći
    });



    if (!user) {
      return res.status(400).send('Invalid or expired token!');
    }

    // Ažuriraj lozinku i očisti token
    user.password = newPassword;
    user.resetToken = null;
    user.tokenExpiration = null;
    await user.save();

    res.send('Password reset successful! You can now log in.');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while resetting the password.');
  }
});

const path = require('path');
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

app.get('/reset-password', (req, res) => {
  const { token } = req.query; // Preuzimanje tokena iz URL-a
  console.log('Token received in URL:', token);

  // Provjeri je li token prisutan
  if (!token) {
    return res.status(400).send('Invalid or missing token!');
  }
  res.sendFile(path.join(__dirname, 'frontend', 'pages', 'reset-password.html'));


});

const gradeSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true }, // Svaka ocjena je vezana za učenikov email
  subject: { type: String, required: true },
  date: { type: String, required: true },
  grade: { type: Number, required: true },
  note: String
});

const Grade = mongoose.model("Grade", gradeSchema);

// Middleware za provjeru uloge nastavnika
function provjeriNastavnika(req, res, next) {
  if (req.korisnik.role !== "nastavnik") {
    return res.status(403).json({ message: "Nemate ovlasti za ovu radnju!" });
  }
  next(); // Ako je nastavnik, nastavi s izvršenjem rute
}

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
