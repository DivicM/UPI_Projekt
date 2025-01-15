
const { validPassword } = require('../login/validPassword')


describe('validPassword', () => {
    test('vraca true ako lozinka ispuni sve uvjete', () => {
        expect(validPassword('Password123!')).toBe(true);
    });

    test('vraca false ako sifra nema brojeva', () => {
        expect(validPassword('Password!')).toBe(false);
    });

    test('vraca false ako lozinka nema posebnih znakova', () => {
        expect(validPassword('Password123')).toBe(false);
    });

    test('vraca false ako je duljina lozinke <= 8', () => {
        expect(validPassword('Pass12!')).toBe(false);
    });

    test('returns true for a password with multiple special characters', () => {
        expect(validPassword('Pass123!!@@')).toBe(true);
    });

    test('vraca false ako je sifra prazna', () => {
        expect(validPassword('')).toBe(false);
    });
});


 