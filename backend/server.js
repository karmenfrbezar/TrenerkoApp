// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const port = 3000;

// =======================
// MIDDLEWARE
// =======================
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================
// MYSQL CONNECTION
// =======================
const connection = mysql.createConnection({
  host: "ucka.veleri.hr",
  user: "kfrbezar",
  password: "11",
  database: "kfrbezar"
});

connection.connect(err => {
  if (err) {
    console.error("MySQL error:", err);
    return;
  }
  console.log("Connected to MySQL!");
});

// =======================
// TEST RUTA
// =======================
app.get("/", (req, res) => {
  res.send("API radi");
});

// ==================================================
// TERETANE ROUTES 
// ==================================================

// CREATE - unos nove teretane
app.post("/api/teretane", (req, res) => {
  const { name, address, description } = req.body;

  if (!name || !address) {
    return res.status(400).json({
      error: "Naziv i adresa su obavezni."
    });
  }

  const sql = `
    INSERT INTO Teretane (name, address, description)
    VALUES (?, ?, ?)
  `;

  connection.query(sql, [name, address, description], (err, result) => {
    if (err) {
      console.error("Greška pri unosu:", err);
      return res.status(500).json({
        error: "Greška pri unosu u bazu."
      });
    }

    res.status(201).json({
      id: result.insertId
    });
  });
});

// READ - dohvat svih teretana
app.get("/api/teretane", (req, res) => {
  const sql = "SELECT * FROM Teretane ORDER BY created_at DESC";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Greška pri dohvaćanju" });
    }
    res.json(results);
  });
});

// ==================================================
// SPORTSKI OBJEKTI 
// ==================================================

app.post("/api/unosobjekata", (req, res) => {
  const {
    naziv,
    adresa,
    opis,
    kontakt,
    lat,
    lng,
    vlasnikId
  } = req.body;

  // osnovna validacija
  if (!naziv || !adresa || !kontakt || lat === null || lng === null) {
    return res.status(400).json({
      error: "Nedostaju obavezna polja"
    });
  }

  const sql = `
    INSERT INTO ISportskiObjekt
      (NazivObjekta, Adresa, Opis, Kontakt, Lokacija, VlasnikID, DatumKreiranja)
    VALUES
      (?, ?, ?, ?, ST_PointFromText(?), ?, NOW())
  `;

  // POINT(lng lat)
  const location = `POINT(${lng} ${lat})`;

  connection.query(
    sql,
    [naziv, adresa, opis, kontakt, location, vlasnikId],
    (err, result) => {
      if (err) {
        console.error("Greška pri unosu objekta:", err);
        return res.status(500).json({
          error: "Greška pri unosu u bazu"
        });
      }

      res.json({
        success: true,
        insertedId: result.insertId
      });
    }
  );
});

// =======================
// START SERVER
// =======================
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
