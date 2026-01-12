const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: "ucka.veleri.hr",
  user: "kfrbezar",
  password: "11",
  database: "kfrbezar"
});

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// =======================
// REGISTRACIJA
// =======================
app.post("/api/register", (req, res) => {
  const { username, email, password, gender } = req.body;
  const sql = `
    INSERT INTO Korisnik (username, email, password, spol, vrijeme_reg)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(sql, [username, email, password, gender], (err, result) => {
    if (err) {
      return res.json({ error: err });
    }
    res.json({ id: result.insertId, username, email, gender });
  });
});

// =======================
// LOGIN
// =======================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM Korisnik WHERE username=? AND password=?";

  connection.query(sql, [username, password], (err, results) => {
    if (err) return res.json({ error: err });
    if (results.length === 0) {
      return res.json({ error: "Neispravan username ili lozinka" });
    }

    const user = results[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      gender: user.spol
    });
  });
});

// =======================
// EDIT USER
// =======================
app.put("/api/user/:id", (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;

  const sql = "UPDATE Korisnik SET username=?, email=? WHERE id=?";
  connection.query(sql, [username, email, id], (err) => {
    if (err) return res.json({ error: err });
    res.json({ success: true });
  });
});

// =======================
// DOHVAT OBJEKATA ZA KARTU
// =======================
app.get("/api/objects", (req, res) => {
  const sql = `
    SELECT
      ObjektID AS id,
      NazivObjekta AS naziv,
      Opis AS opis,
      ST_X(Lokacija) AS lat,
      ST_Y(Lokacija) AS lng
    FROM ISportskiObjekt
  `;

  connection.query(sql, (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
});

// =======================
// PRETRAGA TERETANA
// =======================
app.get("/api/teretane", (req, res) => {
  const { name, address } = req.query;

  let sql = `
    SELECT id, name, address, description
    FROM Teretane
    WHERE 1 = 1
  `;
  const params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  if (address) {
    sql += " AND address LIKE ?";
    params.push(`%${address}%`);
  }

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("SQL greška (teretane):", err);
      return res.status(500).json({ error: "Greška baze" });
    }
    res.json(results);
  });
});

// ==================================================
// SPORTSKI OBJEKTI - UNOS 
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

  if (!naziv || !adresa || !kontakt || lat === null || lng === null) {
    return res.status(400).json({
      error: "Nedostaju obavezna polja"
    });
  }

  // KORIGIRANO: Upit koristi .trim() za uklanjanje nevidljivih znakova 
  // koji su uzrokovali ER_PARSE_ERROR
  const sql = `
    INSERT INTO ISportskiObjekt
    (NazivObjekta, Adresa, Opis, Kontakt, Lokacija, VlasnikID, DatumKreiranja)
    VALUES (?, ?, ?, ?, ST_PointFromText(?), ?, NOW())
  `.trim();

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
app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
