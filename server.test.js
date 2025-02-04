// app.test.js
const request = require('supertest');
const { app } = require('./server'); // pretpostavljamo da je glavni fajl nazvan app.js i da exporta { app }
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = mongoose.model('User');
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fakeSignedToken'),
  verify: jest.fn((token, secret) => {
    if (token === 'validStudentToken') {
      return { username: 'student1', role: 'student' };
    }
    if (token === 'validTeacherToken') {
      return { username: 'nastavnik1', role: 'nastavnik' };
    }
    throw new Error('Invalid token');
  }),
}));

// Resetiraj sve mockove između testova
afterEach(() => {
  jest.clearAllMocks();
});

// ------------------ TESTOVI ZA RUTE KOJE NE KORISTE absence.js I grade.js ------------------

describe('Public endpoints', () => {
  it('GET /isLoggedIn should return { loggedIn: true }', async () => {
    const res = await request(app).get('/isLoggedIn');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ loggedIn: true });
  });

  it('GET /subjects should return array of subjects', async () => {
    const res = await request(app).get('/subjects');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Primjer provjere – očekujemo 14 predmeta
    expect(res.body.length).toBe(14);
  });

  it('POST /logout should return logout message', async () => {
    const res = await request(app).post('/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Uspješna odjava!');
  });
});

// ------------------ TESTOVI ZA RUTE KOJE ZAHTJEVAJU TOKEN ------------------

describe('Protected endpoints', () => {
  // Za potrebe testiranja, “mockat ćemo” metode baze (User.findOne, save, findOneAndUpdate itd.)
  // Kako bismo spriječili stvarne pozive na bazu, koristimo jest.spyOn

  describe('GET /debug-token', () => {
    it('bez Authorization zaglavlja vraća 403', async () => {
      const res = await request(app).get('/debug-token');
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Niste prijavljeni!');
    });

    it('s neispravnim tokenom vraća 401', async () => {
      const res = await request(app)
        .get('/debug-token')
        .set('Authorization', 'Bearer invalidToken');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Neispravan token');
    });

    it('s valjanim tokenom vraća podatke korisnika', async () => {
      // Mokiraj User.findOne da vrati fiktivnog korisnika
      jest.spyOn(User, 'findOne').mockResolvedValue({
        username: 'student1',
        role: 'student',
      });
      const res = await request(app)
        .get('/debug-token')
        .set('Authorization', 'Bearer validStudentToken');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('idUser');
      expect(res.body.idUser).toEqual({ username: 'student1', role: 'student' });
    });
  });

  describe('POST /register', () => {
    it('ako korisnik već postoji, vraća 400', async () => {
      // Mokiraj User.findOne da simulira da korisnik postoji
      jest.spyOn(User, 'findOne').mockResolvedValue({ username: 'postojeci@primjer.hr' });
      const res = await request(app)
        .post('/register')
        .send({
          firstName: 'Ana',
          lastName: 'Anić',
          username: 'postojeci@primjer.hr',
          password: 'lozinka123',
          role: 'student',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Korisnik s tim emailom već postoji.');
    });

    it('uspješna registracija vraća poruku', async () => {
      // Mokiraj User.findOne da simulira da korisnik ne postoji
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      // Mokiraj metodu save na instanci korisnika
      const saveMock = jest.fn().mockResolvedValue(true);
      jest.spyOn(User.prototype, 'save').mockImplementation(saveMock);

      const res = await request(app)
        .post('/register')
        .send({
          firstName: 'Marko',
          lastName: 'Markić',
          username: 'novi@primjer.hr',
          password: 'lozinka123!',
          role: 'student',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Registracija uspješna!');
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe('POST /login', () => {
    it('ako korisnik ne postoji, vraća 401', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .post('/login')
        .send({
          username: 'nepostojeci@primjer.hr',
          password: 'lozinka123',
        });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
      // Poruka u kodu je " Neispravan email ili lozinka!"
      expect(res.body.message).toMatch(/Neispravan email ili lozinka/);
    });

    it('ako je lozinka neispravna, vraća 401', async () => {
      // Mokiraj User.findOne da vrati korisnika s određenom lozinkom
      jest.spyOn(User, 'findOne').mockResolvedValue({
        username: 'student1@primjer.hr',
        password: 'tocnaLozinka',
        role: 'student',
      });
      const res = await request(app)
        .post('/login')
        .send({
          username: 'student1@primjer.hr',
          password: 'netocnaLozinka',
        });
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Neispravna lozinka/);
    });

    it('uspješna prijava vraća token', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({
        username: 'student1@primjer.hr',
        password: 'tocnaLozinka',
        role: 'student',
      });
      const res = await request(app)
        .post('/login')
        .send({
          username: 'student1@primjer.hr',
          password: 'tocnaLozinka',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'fakeSignedToken');
      expect(res.body).toHaveProperty('message', expect.stringContaining('Uspješna prijava'));
    });
  });

  describe('POST /updateProfile', () => {
    it('ako korisnik nije pronađen, vraća 404', async () => {
      // Mokiraj User.findOne da vrati null
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .post('/updateProfile')
        .set('Authorization', 'Bearer validStudentToken')
        .send({
          fullName: 'Novo Ime',
          username: 'novi@primjer.hr',
          password: 'novaLozinka123!',
        });
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Korisnik nije pronađen!');
    });

    it('uspješno ažuriranje profila vraća poruku', async () => {
      // Kreiraj fiktivnog korisnika
      const fakeUser = {
        username: 'student1',
        firstName: 'Stari',
        lastName: 'Naziv',
        password: 'staraLozinka',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(fakeUser);

      const res = await request(app)
        .post('/updateProfile')
        .set('Authorization', 'Bearer validStudentToken')
        .send({
          fullName: 'Novi Ime Prezime',
          username: 'student1',
          password: 'novaLozinka123!',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Profil uspješno ažuriran!');
      expect(fakeUser.save).toHaveBeenCalled();
    });
  });

  describe('GET /current-user', () => {
    it('ako korisnik nije pronađen, vraća 404', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      const res = await request(app)
        .get('/current-user')
        .set('Authorization', 'Bearer validStudentToken');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Korisnik nije pronađen!');
    });

    it('uspješno vraća podatke o trenutnom korisniku', async () => {
      const fakeUser = {
        username: 'student1',
        firstName: 'Student',
        lastName: 'Test',
        role: 'student',
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(fakeUser);
      const res = await request(app)
        .get('/current-user')
        .set('Authorization', 'Bearer validStudentToken');
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(fakeUser);
    });
  });
});

// ------------------ TESTOVI ZA RUTE KOJE NE ZAHTJEVAJU TOKEN (dinamične rute) ------------------

describe('Dinamičke rute za predmete', () => {
  it('GET /matematika/notes vraća prazan niz (po defaultu)', async () => {
    const res = await request(app).get('/matematika/notes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Po defaultu su inicijalno postavljeni kao prazni nizovi
    expect(res.body).toEqual([]);
  });

  it('GET /nepostojeciPredmet/notes vraća 404', async () => {
    const res = await request(app).get('/nepostojeciPredmet/notes');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Predmet ili tip podataka nije pronađen!');
  });
});







