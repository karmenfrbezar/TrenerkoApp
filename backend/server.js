const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
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

// =====================================================
// KORISNICI
// =====================================================

app.post("/api/register", (req, res) => {
  const { ime, prezime, email, password, spol, datumRodenja } = req.body;

  const sql = `
    INSERT INTO PI_Korisnik
    (Ime, Prezime, Email, Lozinka, Spol, Uloga, status_racuna, DatumRodenja)
    VALUES (?, ?, ?, ?, ?, 'Korisnik', 'Aktivan', ?)
  `;

  connection.query(sql, [ime, prezime, email, password, spol, datumRodenja], (err, result) => {
    if (err) {
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.post("/api/login", (req, res) => {
  const { email, lozinka } = req.body;

  const sql = "SELECT * FROM PI_Korisnik WHERE Email=? AND Lozinka=?";

  connection.query(sql, [email, lozinka], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(401).json({ error: "Neispravni podaci" });

    const user = results[0];
    res.json({
      id: user.KorisnikID,
      email: user.Email,
      ime: user.Ime,
      prezime: user.Prezime,
      spol: user.Spol,
      role: user.Uloga,
      status: user.status_racuna
    });
  });
});

app.get("/api/users", (req, res) => {
  const sql = `
    SELECT KorisnikID, Ime, Prezime, Email, Spol, Uloga, status_racuna, DatumRodenja
    FROM PI_Korisnik
    ORDER BY KorisnikID DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/api/users/:id", (req, res) => {
  const { ime, prezime, email, status_racuna } = req.body;
  const { id } = req.params;

  // Samo status update (blokiranje/aktiviranje)
  if (status_racuna && !ime) {
    const sql = "UPDATE PI_Korisnik SET status_racuna=? WHERE KorisnikID=?";
    connection.query(sql, [status_racuna, id], err => {
      if (err) return res.status(500).json(err);
      return res.json({ success: true });
    });
    return;
  }

  const sql = "UPDATE PI_Korisnik SET Ime=?, Prezime=?, Email=? WHERE KorisnikID=?";
  connection.query(sql, [ime, prezime, email, id], err => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  const checkSql = "SELECT Uloga FROM PI_Korisnik WHERE KorisnikID=?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    if (results[0].Uloga === "Admin") return res.status(403).json({ error: "Ne može admin" });

    const delSql = "DELETE FROM PI_Korisnik WHERE KorisnikID=?";
    connection.query(delSql, [id], err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
  });
});

// =====================================================
// SPORTSKI OBJEKTI
// =====================================================

app.get("/api/objects-map", (req, res) => {
  const sql = `
    SELECT
      o.ObjektID AS id,
      o.NazivObjekta AS naziv,
      o.Adresa AS adresa,
      o.Opis AS opis,
      o.Kontakt AS kontakt,
      o.Lat AS lat,
      o.Lng AS lng,
      ROUND(AVG(r.Ocjena), 1) AS prosjekOcjena,
      COUNT(r.RecenzijaID) AS brojRecenzija
    FROM PI_SportskiObjekt o
    LEFT JOIN PI_Recenzija r ON r.ObjektID = o.ObjektID
    GROUP BY o.ObjektID
  `;
  connection.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/api/objects", (req, res) => {
  const sql = `
    SELECT ObjektID AS id, NazivObjekta, Adresa, Opis, Lat, Lng, VlasnikID
    FROM PI_SportskiObjekt
  `;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get("/api/objects/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT
      o.ObjektID AS id,
      o.NazivObjekta,
      o.Adresa,
      o.Opis,
      o.Kontakt,
      o.Lat,
      o.Lng,
      o.VlasnikID,
      ROUND(AVG(r.Ocjena), 1) AS prosjecnaOcjena,
      COUNT(r.RecenzijaID) AS brojRecenzija
    FROM PI_SportskiObjekt o
    LEFT JOIN PI_Recenzija r ON r.ObjektID = o.ObjektID
    WHERE o.ObjektID = ?
    GROUP BY o.ObjektID
  `;
  connection.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Objekt nije pronađen" });
    res.json(results[0]);
  });
});

app.post("/api/objects", (req, res) => {
  const { naziv, adresa, opis, kontakt, lat, lng, vlasnikId } = req.body;

  const sql = `
    INSERT INTO PI_SportskiObjekt
    (NazivObjekta, Adresa, Opis, Kontakt, Lat, Lng, VlasnikID)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, [naziv, adresa, opis, kontakt, lat, lng, vlasnikId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

app.put("/api/objects/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = "UPDATE PI_SportskiObjekt SET Status=? WHERE ObjektID=?";
  connection.query(sql, [status, id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/objects/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM PI_SportskiObjekt WHERE ObjektID = ?";
  connection.query(sql, [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// =====================================================
// DOGAĐAJI
// =====================================================

app.get("/api/dogadjaji", (req, res) => {
  const sql = `
    SELECT
      d.DogadajID,
      d.ObjektID,
      d.NazivDogadaja,
      d.OpisDogadaja,
      d.DatumDogadaja,
      d.Status,
      o.NazivObjekta,
      o.VlasnikID
    FROM PI_Dogadaj d
    JOIN PI_SportskiObjekt o ON o.ObjektID = d.ObjektID
    ORDER BY d.DatumDogadaja DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("DOGADAJI ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get("/api/dogadjaji/objekt/:objektId", (req, res) => {
  const { objektId } = req.params;
  const sql = `
    SELECT
      d.DogadajID,
      d.ObjektID,
      d.NazivDogadaja,
      d.OpisDogadaja,
      d.DatumDogadaja,
      d.Status,
      o.NazivObjekta
    FROM PI_Dogadaj d
    JOIN PI_SportskiObjekt o ON o.ObjektID = d.ObjektID
    WHERE d.ObjektID = ?
    ORDER BY d.DatumDogadaja ASC
  `;
  connection.query(sql, [objektId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/dogadjaji", (req, res) => {
  const { ObjektID, NazivDogadaja, OpisDogadaja, DatumDogadaja } = req.body;
  const sql = `
    INSERT INTO PI_Dogadaj (ObjektID, NazivDogadaja, OpisDogadaja, DatumDogadaja, Status)
    VALUES (?, ?, ?, ?, 'Aktivan')
  `;
  connection.query(sql, [ObjektID, NazivDogadaja, OpisDogadaja, DatumDogadaja], (err, result) => {
    if (err) {
      console.error("POST DOGADAJ ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId });
  });
});

app.delete("/api/dogadjaji/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM PI_Dogadaj WHERE DogadajID = ?";
  connection.query(sql, [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// =====================================================
// RECENZIJE
// =====================================================

app.get("/api/recenzije", (req, res) => {
  const sql = `
    SELECT
      r.RecenzijaID,
      r.KorisnikID,
      r.ObjektID,
      o.NazivObjekta,
      r.Ocjena,
      r.Komentar,
      r.DatumObjave,
      CONCAT(k.Ime, ' ', k.Prezime) AS username
    FROM PI_Recenzija r
    JOIN PI_SportskiObjekt o ON o.ObjektID = r.ObjektID
    JOIN PI_Korisnik k ON k.KorisnikID = r.KorisnikID
    ORDER BY r.DatumObjave DESC
  `;
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.get("/api/recenzije/objekt/:objektId", (req, res) => {
  const { objektId } = req.params;
  const sql = `
    SELECT
      r.RecenzijaID,
      r.KorisnikID,
      r.ObjektID,
      r.Ocjena,
      r.Komentar,
      r.DatumObjave,
      CONCAT(k.Ime, ' ', k.Prezime) AS username
    FROM PI_Recenzija r
    JOIN PI_Korisnik k ON k.KorisnikID = r.KorisnikID
    WHERE r.ObjektID = ?
    ORDER BY r.DatumObjave DESC
  `;
  connection.query(sql, [objektId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/recenzije", (req, res) => {
  const { Komentar, Ocjena, ObjektID, KorisnikID, user_id } = req.body;
  const korisnik = KorisnikID || user_id;

  const sql = `
    INSERT INTO PI_Recenzija (KorisnikID, ObjektID, Ocjena, Komentar, DatumObjave)
    VALUES (?, ?, ?, ?, NOW())
  `;
  connection.query(sql, [korisnik, ObjektID, Ocjena, Komentar], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

app.put("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { Komentar, Ocjena, KorisnikID, user_id } = req.body;
  const korisnik = KorisnikID || user_id;

  const checkSql = "SELECT KorisnikID FROM PI_Recenzija WHERE RecenzijaID=?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    if (results[0].KorisnikID != korisnik) return res.status(403).json({ error: "No permission" });

    const sql = "UPDATE PI_Recenzija SET Komentar=?, Ocjena=? WHERE RecenzijaID=?";
    connection.query(sql, [Komentar, Ocjena, id], err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
  });
});

app.delete("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { KorisnikID, user_id } = req.body;
  const korisnik = KorisnikID || user_id;

  const checkSql = "SELECT KorisnikID FROM PI_Recenzija WHERE RecenzijaID=?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    if (results[0].KorisnikID != korisnik) return res.status(403).json({ error: "No permission" });

    const delSql = "DELETE FROM PI_Recenzija WHERE RecenzijaID=?";
    connection.query(delSql, [id], err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
  });
});

// =====================================================
// FAVORITI
// =====================================================

app.get("/api/favoriti/:korisnikId", (req, res) => {
  const { korisnikId } = req.params;
  const sql = `
    SELECT
      f.FavoritID,
      f.ObjektID,
      f.DatumDodavanja,
      o.NazivObjekta,
      o.Adresa,
      o.Opis
    FROM PI_Favoriti f
    JOIN PI_SportskiObjekt o ON o.ObjektID = f.ObjektID
    WHERE f.KorisnikID = ?
    ORDER BY f.DatumDodavanja DESC
  `;
  connection.query(sql, [korisnikId], (err, results) => {
    if (err) {
      console.error("FAVORITI ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post("/api/favoriti", (req, res) => {
  const { KorisnikID, ObjektID } = req.body;

  if (!KorisnikID || !ObjektID) {
    return res.status(400).json({ error: "KorisnikID i ObjektID su obavezni" });
  }

  const sql = "INSERT INTO PI_Favoriti (KorisnikID, ObjektID, DatumDodavanja) VALUES (?, ?, NOW())";
  connection.query(sql, [KorisnikID, ObjektID], (err, result) => {
    if (err) {
      console.error("POST FAVORITI ERROR:", err);
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "Već u favoritima" });
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId });
  });
});

app.delete("/api/favoriti", (req, res) => {
  const { KorisnikID, ObjektID } = req.body;

  const sql = "DELETE FROM PI_Favoriti WHERE KorisnikID = ? AND ObjektID = ?";
  connection.query(sql, [KorisnikID, ObjektID], err => {
    if (err) {
      console.error("DELETE FAVORITI ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// =====================================================
// SPORTOVI (katalog)
// =====================================================

app.get("/api/sportovi", (req, res) => {
  const sql = "SELECT SportID, NazivSporta FROM PI_Sport ORDER BY NazivSporta ASC";
  connection.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/sportovi", (req, res) => {
  const { NazivSporta } = req.body;
  if (!NazivSporta) return res.status(400).json({ error: "Naziv je obavezan" });

  const sql = "INSERT INTO PI_Sport (NazivSporta) VALUES (?)";
  connection.query(sql, [NazivSporta], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "Sport već postoji" });
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId });
  });
});

app.delete("/api/sportovi/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM PI_Sport WHERE SportID = ?";
  connection.query(sql, [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// =====================================================
// INTERESI KORISNIKA
// =====================================================

app.get("/api/interesi/:korisnikId", (req, res) => {
  const { korisnikId } = req.params;
  const sql = `
    SELECT i.SportID, s.NazivSporta
    FROM PI_Interes i
    JOIN PI_Sport s ON s.SportID = i.SportID
    WHERE i.KorisnikID = ?
    ORDER BY s.NazivSporta ASC
  `;
  connection.query(sql, [korisnikId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/api/interesi/:korisnikId", (req, res) => {
  const { korisnikId } = req.params;
  const { sportovi } = req.body;

  const deleteSql = "DELETE FROM PI_Interes WHERE KorisnikID = ?";
  connection.query(deleteSql, [korisnikId], err => {
    if (err) return res.status(500).json({ error: err.message });

    if (!sportovi || sportovi.length === 0) {
      return res.json({ success: true });
    }

    const values = sportovi.map(sportId => [korisnikId, sportId]);
    const insertSql = "INSERT INTO PI_Interes (KorisnikID, SportID) VALUES ?";
    connection.query(insertSql, [values], err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

// =====================================================

app.listen(port, () => {
  console.log("Server running on port " + port);
});