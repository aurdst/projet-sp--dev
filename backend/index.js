// La première ligne référence/importe le module Express.
//La méthode ".verbose()" permet d'avoir plus d'informations en cas de problème.
const express = require('express');
const cors = require('cors');
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');
const db = require('./db/db');

const path = require("path");
//La ligne suivante est utilisée pour instancier un serveur Express.
const app = express();

// Création de la table "users" dans la base de données SQLite
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
});

// Création de notre data products
const sql_create = `CREATE TABLE IF NOT EXISTS Products (
  Product_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Libelle VARCHAR(100) NOT NULL,
  Description VARCHAR(100) NOT NULL,
  Images TEXT,
  Price INTEGER,
  Category TEXT
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'Products' table");
});
app.set("views", path.join(__dirname, "frontend", "views"));
// Définir le moteur de modèle comme EJS
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false })); // <--- middleware configuration neccesaire pour utiliser req.
app.use(cors());
// Fonction de rappel pour afficher un message d'info lors de la connexion
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

const corsOptions = {
  origin: ['http://127.0.0.1:5000'],
  methods: ['GET', 'POST'], // Autoriser uniquement la méthode POST
  allowedHeaders: ['Content-Type'], // Autoriser uniquement l'en-tête Content-Type
};

// Middleware de logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// >>> ROUTES API <<< //

// POST /edit/:id route de mise a jour d'un produit
app.post("/edit/:id", (req, res) => {
  const id = req.params.id;
  const product = [req.body.Libelle, req.body.Category, req.body.Description, req.body.Price, id];
  const sql = "UPDATE Products SET Libelle = ?, Category = ?, Description = ?, Price = ? WHERE (Product_ID = ?)";
  db.run(sql, product, err => {
    if (err) {
      return console.log(err.message)
    }
    res.redirect("http://127.0.0.1:3000/products");
  });
});

// POST /create
app.post("/create", cors(corsOptions), (req, res) => {
  const sql = "INSERT INTO Products (Libelle, Category, Description, Price) VALUES (?, ?, ?, ?)";
  const book = [req.body.Libelle, req.body.Category, req.body.Description, req.body.Price];
  db.run(sql, book, err => {
    if (err) {
      return console.log(err.message)
    }
    res.redirect("http://127.0.0.1:3000/products");
  });
});

// POST /delete/id  supprimer une reccource de la bdd 
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM Products WHERE Product_ID = ?;";
  db.run(sql, id, err => {
    if (err) {
      return console.log(err.message)
    }
    res.redirect("http://127.0.0.1:3000/products");
  });
});

// Définir les règles de validation du mot de passe
const schema = new passwordValidator();
schema
  .is().min(12)                                    // Longueur minimale de 12 caractères
  .is().max(64)                                    // Longueur maximale de 64 caractères
  .has().uppercase()                               // Au moins une lettre majuscule
  .has().lowercase()                               // Au moins une lettre minuscule
  .has().digits()                                  // Au moins un chiffre
  .has().not().spaces()                            // Ne pas contenir d'espaces
  .is().not().oneOf(['Passw0rd', 'Password123']);  // Ne pas utiliser de mots de passe courants

// Route pour créer un nouvel utilisateur
app.post('../frontend/register', async (req, res) => {
  const { username, password } = req.body;

  // Vérifier si le mot de passe satisfait aux règles de validation
  if (!schema.validate(password)) {
    return res.status(400).json({ error: 'Le mot de passe ne respecte pas les règles de sécurité.' });
  }

  try {
    // Hasher le mot de passe avant de l'insérer dans la base de données
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insérer l'utilisateur dans la base de données avec le mot de passe hashé
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send();
      } else {
        return res.status(201).send();
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

// Route pour se connecter (authentification)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
      if (err) {
          return res.status(500).send();
      }
      if (!row) {
          return res.status(400).send('Utilisateur non trouvé');
      }
      try {
          if (await bcrypt.compare(password, row.password)) {
              const accessToken = jwt.sign({ username: row.username }, process.env.ACCESS_TOKEN_SECRET);
              res.json({ accessToken: accessToken });
          } else {
              res.status(401).send('Mot de passe incorrect');
          }
      } catch {
          res.status(500).send();
      }
  });
});

// Fonction pour vérifier un JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}

// Route protégée qui nécessite un JWT valide
app.get('/protected', authenticateToken, (req, res) => {
  res.send('Vous êtes authentifié');
});
