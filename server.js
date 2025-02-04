const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
require("dotenv").config();
const Grade = require("./models/Grade"); // Model za ocjene

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Za HTML forme


let db;  //  Definiraj varijablu db

mongoose.connect("mongodb+srv://anetakalabric65:gnOg26vktfpBzjxx@cluster0.xsqni.mongodb.net/e_Dnevnik?retryWrites=true&w=majority&appName=Cluster0"
).then(() => {
  console.log("✅ Uspješno spojeno na MongoDB Atlas");

  db = mongoose.connection.db;  //  Sada db pokazuje na bazu

}).catch((error) => {
  console.error("❌ Greška pri povezivanju s MongoDB Atlasom:", error);
});


// Schema za korisnika
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  role: { type: String, enum: ["student", "nastavnik"], default: "student" }, // ✅ Dodano polje role
  resetToken: String,          // Token za resetiranje lozinke
  tokenExpiration: Date,
});

const User = mongoose.model("User", userSchema);
module.exports = User;



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
    // 📌 Dohvati korisnika iz baze pomoću emaila iz tokena
    const user = await User.findOne({ username: dekodiraniToken.username });

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }
    // 📌 Postavi korisnika u req objekt da se može koristiti dalje u rutama
    req.korisnik = { username: user.username, role: user.role };

    //req.korisnik = dekodiraniToken;
    console.log("✅ Korisnik je prijavljen kao:", req.korisnik);
    next();
  } catch (err) {
    console.error("❌ Neispravan token:", err.message);
    return res.status(401).json({ message: "Neispravan token" });
  }
  //return next();
};

app.get('/debug-token', provjeriToken, (req, res) => {
  res.json({ idUser: req.korisnik });
});


const Absence = require("./models/Absence");


app.get("/absences", provjeriToken, async (req, res) => {
  try {
    const { studentEmail } = req.query;
    const role = req.korisnik.role;

    let absences;
    if (role === "nastavnik") {
      absences = await Absence.find({ username: studentEmail });
    } else {
      absences = await Absence.find({ username: req.korisnik.username });
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
  await Absence.deleteMany({ username });
  await Absence.insertMany(data.map(item => ({ ...item, username })));

  res.json({ message: "Izostanci uspješno ažurirani!" });
});

app.delete("/absences/delete/:id", provjeriToken, async (req, res) => {
  if (req.korisnik.role !== "nastavnik") {
    return res.status(403).json({ message: "Nemate ovlasti za brisanje izostanaka." });
  }

  await Absence.findByIdAndDelete(req.params.id);
  res.json({ message: "Izostanak uspješno obrisan!" });
});

app.get("/absences/total/:username", provjeriToken, async (req, res) => {
  const { username } = req.params;

  try {
    //  Pronađi sve izostanke za danog učenika
    const absences = await Absence.find({ username });

    if (!absences.length) {
      return res.json({ totalHours: 0 }); // Ako nema izostanaka, vrati 0
    }

    //  Izračunaj ukupan broj sati izostanaka
    const totalHours = absences.reduce((sum, entry) => sum + (entry.hours || 0), 0);

    res.json({ totalHours });
  } catch (error) {
    console.error("❌ Greška pri dohvaćanju izostanaka:", error);
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
      password, // Dodaj hashiranje lozinke ako treba
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

    // Usporedi lozinku (bez bcrypt-a)
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
app.post("/updateProfile", provjeriToken, async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    // Podijeli fullName u firstName i lastName
    const [firstName, ...lastNameArr] = fullName.split(" ");
    const lastName = lastNameArr.join(" ");

    // Pronađi korisnika u bazi
    const user = await User.findOne({ username: req.korisnik.username });

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    // Ažuriraj podatke
    user.firstName = firstName;
    user.lastName = lastName;
    user.username = username;
    user.password = password; // Ako koristiš bcrypt, ovdje trebaš hashirati lozinku

    await user.save();
    res.json({ message: "Profil uspješno ažuriran!" });

  } catch (error) {
    console.error("❌ Greška pri ažuriranju profila:", error);
    res.status(500).json({ message: "Greška pri ažuriranju!" });
  }
});

const multer = require("multer");

// Konfiguracija gdje se spremaju slike
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    if (!req.korisnik || !req.korisnik.username) {
      return cb(new Error("Korisnik nije pronađen u zahtjevu!"));
    }
    const fileName = req.korisnik.username + path.extname(file.originalname);
    cb(null, req.korisnik.username + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post("/update-profile", provjeriToken, upload.single("profileImage"), async (req, res) => {
  try {
    const korisnik = req.korisnik.username;

    const updateData = {};
    if (req.file) {
      updateData.profileImage = req.file.filename; //  Spremi novo ime slike
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: korisnik },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    res.json({ message: "Profil uspješno ažuriran!", profileImage: updatedUser.profileImage });

  } catch (error) {
    console.error("❌ Greška pri ažuriranju profila:", error);
    res.status(500).json({ message: "Greška pri ažuriranju profila." });
  }
});


// Omogući Expressu da servira slike iz "uploads" direktorija
app.use("/uploads", express.static("uploads"));

// Ruta za ažuriranje profilne slike

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
    html: `<p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
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

// Middleware za provjeru uloge nastavnika
function provjeriNastavnika(req, res, next) {
  if (req.korisnik.role !== "nastavnik") {
    return res.status(403).json({ message: "Nemate ovlasti za ovu radnju!" });
  }
  next(); // Ako je nastavnik, nastavi s izvršenjem rute
}

//  Struktura podataka za sve predmete
const subjectsData = {
  biologija: { grades: [], notes: [], curriculum: [], finalExam: [] },
  engleskijezik: { grades: [], notes: [], curriculum: [], finalExam: [] },
  matematika: { grades: [], notes: [], curriculum: [], finalExam: [] },
  fizika: { grades: [], notes: [], curriculum: [], finalExam: [] },
  geografija: { grades: [], notes: [], curriculum: [], finalExam: [] },
  glazbenakultura: { grades: [], notes: [], curriculum: [], finalExam: [] },
  hrvatskijezik: { grades: [], notes: [], curriculum: [], finalExam: [] },
  informatika: { grades: [], notes: [], curriculum: [], finalExam: [] },
  kemija: { grades: [], notes: [], curriculum: [], finalExam: [] },
  likovnakultura: { grades: [], notes: [], curriculum: [], finalExam: [] },
  povijest: { grades: [], notes: [], curriculum: [], finalExam: [] },
  tehničkakultura: { grades: [], notes: [], curriculum: [], finalExam: [] },
  tzk: { grades: [], notes: [], curriculum: [], finalExam: [] },
  vjeronauk: { grades: [], notes: [], curriculum: [], finalExam: [] }
};

//  Dinamička ruta za dohvaćanje podataka bilo kojeg predmeta
app.get("/:subject/:dataType", (req, res) => {
  const { subject, dataType } = req.params;

  if (!subjectsData[subject] || !subjectsData[subject][dataType]) {
    return res.status(404).json({ message: "Predmet ili tip podataka nije pronađen!" });
  }
  const studentData = subjectsData[subject][dataType];

  if (!studentData) {
    return res.status(404).json({ message: "Podaci za ovog učenika nisu pronađeni!" });
  }

  res.json(studentData);
  //res.json(subjectsData[subject][dataType]);
});


//  Ažuriranje podataka bilo kojeg predmeta
app.post("/:subject/update", provjeriToken, provjeriNastavnika, (req, res) => {
  const { subject } = req.params;
  const { dataType, data } = req.body;

  if (!subjectsData[subject] || !subjectsData[subject][dataType]) {
    return res.status(404).json({ message: "Predmet ili tip podataka nije pronađen!" });
  }

  subjectsData[subject][dataType] = data; // Ažuriraj podatke
  res.json({ message: `${dataType} za ${subject} su ažurirane!` });
});

//  Brisanje podataka za bilo koji predmet
app.delete("/:subject/delete/:dataType/:index", (req, res) => {
  const { subject, dataType, index } = req.params;

  if (!subjectsData[subject] || !subjectsData[subject][dataType]) {
    return res.status(404).json({ message: "Predmet ili tip podataka nije pronađen!" });
  }

  const studentData = subjectsData[subject][dataType];
  if (!studentData) {
    return res.status(404).json({ message: "Podaci za ovog učenika nisu pronađeni!" });
  }
  const itemIndex = parseInt(index, 10);

  if (itemIndex >= 0 && itemIndex < studentData.length) {
    studentData.splice(itemIndex, 1);
    res.json({ message: `${dataType} uspješno obrisano iz ${subject}!` });
  } else {
    res.status(404).json({ message: "Podatak nije pronađen!" });
  }
});

app.get("/grades/average/:studentEmail", provjeriToken, async (req, res) => {
  const { studentEmail } = req.params;

  try {
    console.log("📌 Tražim ocjene za:", studentEmail); //  Debugging

    const grades = await Grade.find({ studentEmail });
    console.log("📌 Dohvaćene ocjene iz baze:", grades);

    if (!grades || grades.length === 0) {
      return res.status(404).json({ message: "Nema ocjena za ovog učenika!" });
    }

    const averageGrades = {};

    grades.forEach(subjectEntry => {
      if (subjectEntry.grades.length > 0) {
        const sum = subjectEntry.grades.reduce((acc, g) => acc + g.grade, 0);
        const avg = sum / subjectEntry.grades.length;
        averageGrades[subjectEntry.subject] = avg.toFixed(2);
      } else {
        averageGrades[subjectEntry.subject] = "Nema ocjena";
      }
    });

    console.log("📊 Prosjek ocjena:", averageGrades); // Debugging

    res.json(averageGrades);
  } catch (error) {
    console.error("❌ Greška pri dohvaćanju prosjeka ocjena:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

app.get("/grades/:subject/:studentEmail", provjeriToken, async (req, res) => {
  const { subject, studentEmail } = req.params;

  try {
    const studentGrades = await Grade.findOne({ studentEmail, subject });

    if (!studentGrades) {
      return res.status(404).json({ message: "Nema ocjena za ovog učenika!" });
    }

    res.json(studentGrades.grades);
  } catch (error) {
    console.error("❌ Greška pri dohvaćanju ocjena:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

app.post("/grades/:subject/:studentEmail", provjeriToken, provjeriNastavnika, async (req, res) => {
  const { subject, studentEmail } = req.params;
  const { grades } = req.body; // Očekuje se niz ocjena [{date, grade, note}]

  if (!grades || !Array.isArray(grades)) {
    return res.status(400).json({ message: "Neispravni podaci za ocjene!" });
  }

  try {
    let studentGrades = await Grade.findOne({ studentEmail, subject });

    if (!studentGrades) {
      // 2️ Ako NE postoji, stvori novi dokument u kolekciji `grades`
      studentGrades = new Grade({
        studentEmail,
        subject,
        grades: grades, // Sprema niz ocjena [{ date, grade, note }]
      });

      await studentGrades.save();
      console.log("✅ Novi zapis ocjena spremljen:", studentGrades);
    } else {
      // Ako već postoji, ažuriraj ocjene
      studentGrades.grades = grades;
      await studentGrades.save();
      console.log("✏️ Ažurirane ocjene:", studentGrades);
    }

    res.json({ message: `Ocjene za ${subject} su spremljene!` });
  } catch (error) {
    console.error("❌ Greška pri spremanju ocjena:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});
app.delete("/grades/:subject/:studentEmail/:index", provjeriToken, provjeriNastavnika, async (req, res) => {
  const { subject, studentEmail, index } = req.params;

  try {
    let studentGrades = await Grade.findOne({ studentEmail, subject });

    if (!studentGrades || !studentGrades.grades.length) {
      return res.status(404).json({ message: "Nema ocjena za ovog učenika!" });
    }

    const itemIndex = parseInt(index, 10);

    if (itemIndex >= 0 && itemIndex < studentGrades.grades.length) {
      studentGrades.grades.splice(itemIndex, 1);
      await studentGrades.save();
      res.json({ message: "Ocjena uspješno obrisana!" });
    } else {
      res.status(404).json({ message: "Ocjena nije pronađena!" });
    }
  } catch (error) {
    console.error("❌ Greška pri brisanju ocjene:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

app.get('/current-user', provjeriToken, async (req, res) => {
  try {
    console.log("📌 Trenutni korisnik iz tokena:", req.korisnik);

    //  Pronađi korisnika u bazi prema emailu iz tokena
    const user = await User.findOne({ username: req.korisnik.username });

    if (!user) {
      return res.status(404).json({ message: "Korisnik nije pronađen!" });
    }

    console.log("✅ Pronađen korisnik u bazi:", user);

    //  Pošalji ispravan `role` natrag klijentu

    res.json(user);
  } catch (error) {
    console.error("❌ Greška pri dohvaćanju korisnika:", error);
    res.status(500).json({ message: "Greška na serveru!" });
  }
});

app.get("/random-student", provjeriToken, async (req, res) => {
  try {
    if (req.korisnik.role !== "nastavnik") {
      return res.status(403).json({ message: "Nemate ovlasti za ovu akciju!" });
    }

    const students = await User.find({ role: "student" }); // Dohvati samo studente

    if (students.length === 0) {
      return res.status(404).json({ message: "Nema dostupnih učenika!" });
    }

    const randomStudent = students[Math.floor(Math.random() * students.length)];

    res.json({ firstName: randomStudent.firstName, lastName: randomStudent.lastName });

  } catch (error) {
    console.error("❌ Greška pri odabiru učenika:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
});

if (require.main === module) {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app };





