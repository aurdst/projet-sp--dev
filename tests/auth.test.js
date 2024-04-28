const request = require('supertest');
const app = require('../backend/index'); // Chemin vers votre fichier d'API

// Test de connexion avec des identifiants valides
describe('POST /login', () => {
  it('devrait permettre la connexion avec des identifiants valides', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'utilisateur',
        password: 'motdepasse'
      });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    // Ajoutez des assertions supplémentaires si nécessaire
  });
});

// Test de création d'un nouvel utilisateur
describe('POST /frontend/register', () => {
  it('devrait créer un nouvel utilisateur', async () => {
    const response = await request(app)
      .post('/frontend/register')
      .send({
        username: 'nouvel_utilisateur',
        password: 'nouveau_motdepasse'
      });
      
    expect(response.status).toBe(201);
    // Ajoutez des assertions supplémentaires si nécessaire
  });
});
