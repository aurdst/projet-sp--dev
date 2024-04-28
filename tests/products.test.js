const request = require('supertest');
const app = require('../backend/index'); // Chemin vers votre fichier d'API

// Test de création d'un produit
describe('POST /create', () => {
  it('devrait créer un nouveau produit', async () => {
    const response = await request(app)
      .post('/create')
      .send({
        Libelle: 'Nouveau produit',
        Category: 'Catégorie',
        Description: 'Description du produit',
        Price: 50
      });
      
    expect(response.status).toBe(200);
    // Ajoutez des assertions supplémentaires si nécessaire
  });
});

// Test de mise à jour d'un produit
describe('POST /edit/:id', () => {
  it('devrait mettre à jour un produit existant', async () => {
    const response = await request(app)
      .post('/edit/1') // Remplacez 1 par l'ID d'un produit existant dans votre base de données
      .send({
        Libelle: 'Produit mis à jour',
        Category: 'Nouvelle catégorie',
        Description: 'Nouvelle description',
        Price: 60
      });
      
    expect(response.status).toBe(200);
    // Ajoutez des assertions supplémentaires si nécessaire
  });
});

// Test de suppression d'un produit
describe('POST /delete/:id', () => {
  it('devrait supprimer un produit existant', async () => {
    const response = await request(app)
      .post('/delete/1') // Remplacez 1 par l'ID d'un produit existant dans votre base de données
      .send();
      
    expect(response.status).toBe(200);
    // Ajoutez des assertions supplémentaires si nécessaire
  });
});
