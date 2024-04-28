const express = require('express');
const cors = require('cors');
const app = express();
const path = require("path");
const db = require('../backend/db/db');

// ndiquez que les fichiers statiques sont enregistrés dans le dossier "public" et ses sous-répertoires
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration neccesaire pour utiliser req.
app.use(cors());

// Fonction de rappel pour afficher un message d'info lors de la connexion
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

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

const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
  methods: ['GET', 'POST'], // Autoriser uniquement la méthode POST
  allowedHeaders: ['Content-Type'], // Autoriser uniquement l'en-tête Content-Type
};

// Middleware de logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Precisions de l'endroit de nos vues 
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get('/register', (req, res) => {
    res.render('register');
  });

// >>> ROUTES API <<< //
app.get("/", (req, res) => {
    res.render('index');
});

// GET /delete/id  recup une reccource a delete
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Products WHERE Product_ID = ?;";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.log(err.message)
      }
      res.render("delete", { model: row });
    });
  });

app.get('/login', (req, res) => {
  res.render('login');
});

// GET /create route pour recuperer le formulaire
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
  });

// GET /edit affiche le formulaire edit  d'un produit
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Products WHERE Product_ID = ?";
    db.get(sql, id, (err, row) => {
      if (err) {
        return console.log(err.message)
      }
      res.render("edit", { model: row });
    });
  });

  // Creation de la seconde route pour recuperer les produits
app.get("/products", (req, res) => {
    const product = 'SELECT * FROM Products ORDER BY Libelle'
    db.all(product, [], (err, rows) => {
      if (err) {
        return console.log(err.message)
      }
      res.render('products', { model: rows})
    })
  });