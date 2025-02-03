process.env.NODE_ENV = 'test';

jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(),  // umjesto stvarne konekcije
    connection: { db: {} }
  };
});


jest.spyOn(console, 'log').mockImplementation(() => {});

const { app, subjectsData } = require('./server'); // prilagodi putanju po potrebi

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Dohvatamo User model (koji se kreira u server.js)
const User = mongoose.model('User');

// Za testove postavi tajnu za JWT
process.env.JWT_SECRET = 'testsecret';

// Pomoćna funkcija za generiranje JWT tokena
const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });


const Absence = require('./models/Absence');
Absence.find = jest.fn();
Absence.deleteMany = jest.fn();
Absence.insertMany = jest.fn();
Absence.findByIdAndDelete = jest.fn();

const Grade = require('./models/Grade');
Grade.find = jest.fn();
Grade.findOne = jest.fn();

describe('Unprotected Endpoints', () => {
  test('GET /isLoggedIn returns loggedIn true', async () => {
    const res = await request(app).get('/isLoggedIn');
    expect(res.statusCode).toBe(200);
    expect(res.body.loggedIn).toBe(true);
  });

  test('GET /subjects returns an array of subjects', async () => {
    const res = await request(app).get('/subjects');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('Protected Endpoints', () => {
  describe('GET /debug-token', () => {
    test('returns current user info when token is valid', async () => {
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);
      // Mockiraj User.findOne da vrati objekt s role-om
      jest.spyOn(User, 'findOne').mockResolvedValue({ username: payload.username, role: payload.role });
      
      const res = await request(app)
        .get('/debug-token')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.idUser).toEqual({ username: payload.username, role: payload.role });
    });
    
    test('returns 403 if token not provided', async () => {
      const res = await request(app).get('/debug-token');
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Niste prijavljeni/);
    });
  });

  describe('POST /register', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    test('registers a new user', async () => {
      // Simuliraj da korisnik ne postoji
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      // Mockiraj save metodu
      User.prototype.save = jest.fn().mockResolvedValue(true);
      
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        username: 'student@example.com',
        password: 'password123',
        role: 'student'
      };

      const res = await request(app)
        .post('/register')
        .send(newUser);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Registracija uspješna/);
      expect(User.findOne).toHaveBeenCalledWith({ username: newUser.username });
    });

    test('does not register if user already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ username: 'student@example.com' });
      
      const newUser = {
        firstName: 'Test',
        lastName: 'User',
        username: 'student@example.com',
        password: 'password123',
        role: 'student'
      };

      const res = await request(app)
        .post('/register')
        .send(newUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Korisnik s tim emailom već postoji/);
    });
  });

  describe('POST /login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('logs in with correct credentials', async () => {
      const user = { username: 'student@example.com', password: 'password123', role: 'student' };
      jest.spyOn(User, 'findOne').mockResolvedValue(user);

      const res = await request(app)
        .post('/login')
        .send({ username: 'student@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toMatch(/Uspješna prijava/);
    });

    test('does not login with incorrect password', async () => {
      const user = { username: 'student@example.com', password: 'password123', role: 'student' };
      jest.spyOn(User, 'findOne').mockResolvedValue(user);

      const res = await request(app)
        .post('/login')
        .send({ username: 'student@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Neispravna lozinka/);
    });

    test('does not login if user not found', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/login')
        .send({ username: 'nonexistent@example.com', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/Neispravan email ili lozinka/);
    });
  });

  // Primjeri testova za rute vezane uz izostanke (absences)
  describe('GET /absences', () => {
    test('returns absences for teacher when studentEmail provided', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const absencesData = [{ username: 'student@example.com', hours: 2 }];
      // Mockiraj Absence.find da vrati podatke
      const Absence = require('./models/Absence');
      Absence.find.mockResolvedValue(absencesData);

      const res = await request(app)
        .get('/absences')
        .query({ studentEmail: 'student@example.com' })
        .set('Authorization', `Bearer ${token}`);

      // Ako endpoint nije pokrenut (npr. nije definiran u tvom kodu), rezultat će biti 404;
      // Ovdje očekujemo 200 ako je ruta ispravno definirana.
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(absencesData);
    });

    test('returns absences for student when role is student', async () => {
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);
      const absencesData = [{ username: 'student@example.com', hours: 3 }];
      const Absence = require('./models/Absence');
      Absence.find.mockResolvedValue(absencesData);

      const res = await request(app)
        .get('/absences')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(absencesData);
    });
  });

  describe('POST /absences/update', () => {
    test('updates absences when role is teacher', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const updateData = { username: 'student@example.com', data: [{ hours: 2 }] };
      const Absence = require('./models/Absence');
      Absence.deleteMany.mockResolvedValue(true);
      Absence.insertMany.mockResolvedValue(updateData.data);

      const res = await request(app)
        .post('/absences/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Izostanci uspješno ažurirani/);
    });

    test('returns 403 if user is not teacher', async () => {
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);
      const updateData = { username: 'student@example.com', data: [{ hours: 2 }] };

      const res = await request(app)
        .post('/absences/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Nemate ovlasti za uređivanje izostanaka/);
    });
  });

  describe('DELETE /absences/delete/:id', () => {
    test('deletes absence when role is teacher', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const Absence = require('./models/Absence');
      Absence.findByIdAndDelete.mockResolvedValue(true);

      const res = await request(app)
        .delete('/absences/delete/123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Izostanak uspješno obrisan/);
    });

    test('returns 403 if user is not teacher', async () => {
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);

      const res = await request(app)
        .delete('/absences/delete/123')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Nemate ovlasti za brisanje izostanaka/);
    });
  });

  describe('GET /absences/total/:username', () => {
    test('returns total hours for absences', async () => {
      const absences = [{ hours: 2 }, { hours: 3 }];
      const Absence = require('./models/Absence');
      Absence.find.mockResolvedValue(absences);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);

      const res = await request(app)
        .get('/absences/total/student@example.com')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.totalHours).toBe(5);
    });

    test('returns totalHours 0 if no absences found', async () => {
      const Absence = require('./models/Absence');
      Absence.find.mockResolvedValue([]);
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);

      const res = await request(app)
        .get('/absences/total/student@example.com')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.totalHours).toBe(0);
    });
  });

  describe('GET /current-user', () => {
    test('returns current user info', async () => {
      const payload = { username: 'student@example.com', role: 'student' };
      const token = generateToken(payload);
      const fakeUser = { username: 'student@example.com', role: 'student', firstName: 'Test', lastName: 'User' };
      jest.spyOn(User, 'findOne').mockResolvedValue(fakeUser);

      const res = await request(app)
        .get('/current-user')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe(fakeUser.username);
    });
  });

  describe('GET /random-student', () => {
    test('returns a random student for teacher', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      jest.spyOn(User, 'find').mockResolvedValue([
        { firstName: 'Student', lastName: 'One', role: 'student' },
        { firstName: 'Student', lastName: 'Two', role: 'student' }
      ]);

      const res = await request(app)
        .get('/random-student')
        .set('Authorization', `Bearer ${token}`);

      // Očekujemo 200 ako ruta provjerava ulogu i vraća podatke
      expect(res.statusCode).toBe(200);
      expect(res.body.firstName).toBeDefined();
      expect(res.body.lastName).toBeDefined();
    });

    test('returns 404 if no students available', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      jest.spyOn(User, 'find').mockResolvedValue([]);

      const res = await request(app)
        .get('/random-student')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Nema dostupnih učenika/);
    });
  });

  // Dinamičke rute za predmete (primjer s "matematika")
  describe('Dynamic Subject Routes', () => {
    test('GET /matematika/grades returns an empty array if no data', async () => {
      // Ako za predmet nema podataka, očekujemo prazni niz
      const res = await request(app).get('/matematika/grades');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('POST /matematika/update updates subject data', async () => {
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const data = { dataType: 'grades', data: [{ grade: 5 }] };

      const res = await request(app)
        .post('/matematika/update')
        .set('Authorization', `Bearer ${token}`)
        .send(data);

      // Očekujemo 200 ako je ruta dostupna; u suprotnom (ako ruta nije definirana) dobit ćeš 403/404
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/grades za matematika su ažurirane/);
    });

    test('DELETE /matematika/delete/grades/0 deletes data', async () => {
      // Prije brisanja inicijaliziraj subjectsData (koji je exportiran iz server.js)
      subjectsData.matematika.grades = [{ grade: 5 }, { grade: 4 }];
      
      const res = await request(app).delete('/matematika/delete/grades/0');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/grades uspješno obrisano iz matematika/);
    });
  });

  // Rute vezane uz ocjene
  describe('Grades Endpoints', () => {
    test('GET /grades/average/student@example.com returns average grades', async () => {
      const grades = [
        { subject: 'matematika', grades: [{ grade: 4 }, { grade: 5 }] },
        { subject: 'fizika', grades: [] }
      ];
      const Grade = require('./models/Grade');
      Grade.find.mockResolvedValue(grades);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);

      const res = await request(app)
        .get('/grades/average/student@example.com')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.matematika).toBe("4.50");
      expect(res.body.fizika).toBe("Nema ocjena");
    });

    test('GET /grades/matematika/student@example.com returns subject grades', async () => {
      const subjectGrades = { grades: [{ grade: 5 }] };
      const Grade = require('./models/Grade');
      Grade.findOne.mockResolvedValue(subjectGrades);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);

      const res = await request(app)
        .get('/grades/matematika/student@example.com')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(subjectGrades.grades);
    });

    test('POST /grades/matematika/student@example.com creates new grades record when not existing', async () => {
      const Grade = require('./models/Grade');
      Grade.findOne.mockResolvedValue(null);
      // Mockiraj save metodu na instanci
      Grade.prototype.save = jest.fn().mockResolvedValue(true);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const gradesData = { grades: [{ grade: 5 }] };

      const res = await request(app)
        .post('/grades/matematika/student@example.com')
        .set('Authorization', `Bearer ${token}`)
        .send(gradesData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Ocjene za matematika su spremljene/);
    });

    test('POST /grades/matematika/student@example.com updates existing grades record', async () => {
      const existingRecord = { grades: [{ grade: 4 }], save: jest.fn().mockResolvedValue(true) };
      const Grade = require('./models/Grade');
      Grade.findOne.mockResolvedValue(existingRecord);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);
      const gradesData = { grades: [{ grade: 5 }] };

      const res = await request(app)
        .post('/grades/matematika/student@example.com')
        .set('Authorization', `Bearer ${token}`)
        .send(gradesData);

      expect(res.statusCode).toBe(200);
      expect(existingRecord.save).toHaveBeenCalled();
    });

    test('DELETE /grades/matematika/student@example.com/0 deletes a grade', async () => {
      const existingRecord = { grades: [{ grade: 4 }, { grade: 5 }], save: jest.fn().mockResolvedValue(true) };
      const Grade = require('./models/Grade');
      Grade.findOne.mockResolvedValue(existingRecord);
      const payload = { username: 'teacher@example.com', role: 'nastavnik' };
      const token = generateToken(payload);

      const res = await request(app)
        .delete('/grades/matematika/student@example.com/0')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Ocjena uspješno obrisana/);
    });
  });
});
