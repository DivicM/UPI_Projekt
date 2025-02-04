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

const { app } = require('./server'); // prilagodi putanju po potrebi

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Dohvatamo User model (koji se kreira u server.js)
const User = mongoose.model('User');

// Za testove postavi tajnu za JWT
process.env.JWT_SECRET = 'testsecret';

afterEach(() => {
  jest.restoreAllMocks();
});

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

  // Dinamičke rute za predmete (primjer s "matematika")
  describe('Dynamic Subject Routes', () => {
    test('GET /matematika/grades returns an empty array if no data', async () => {
      // Ako za predmet nema podataka, očekujemo prazni niz
      const res = await request(app).get('/matematika/grades');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

  });
});


