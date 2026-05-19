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

app.post("/api/register", (req, res) => {
  const { ime, prezime, email, password, spol, datumRodenja } = req.body;

  const sql = `
    INSERT INTO PI_Korisnik
    (Ime, Prezime, Email, Lozinka, Spol, Uloga, status_racuna, DatumRodenja)
    VALUES (?, ?, ?, ?, ?, 'Korisnik', 'Aktivan', ?)
  `;

  connection.query(
    sql,
    [ime, prezime, email, password, spol, datumRodenja],
    (err, result) => {
      if (err) {
        console.error("REGISTER ERROR:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: result.insertId });
    }
  );
});

app.post("/api/login", (req, res) => {
  const { email, lozinka } = req.body;

  const sql = `
    SELECT * FROM PI_Korisnik 
    WHERE Email=? AND Lozinka=?
  `;

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
  const { ime, prezime, email } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE PI_Korisnik 
    SET Ime=?, Prezime=?, Email=? 
    WHERE KorisnikID=?
  `;

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

app.delete("/api/objects/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM PI_SportskiObjekt WHERE ObjektID = ?";
  connection.query(sql, [id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

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

app.get("/api/recenzije", (req, res) => {
  const sql = `
    SELECT 
      r.RecenzijaID,
      r.ObjektID,
      o.NazivObjekta,
      r.Ocjena,
      r.Komentar,
      r.DatumObjave,
      k.Ime,
      k.Prezime
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

app.post("/api/recenzije", (req, res) => {
  const { Komentar, Ocjena, ObjektID, KorisnikID } = req.body;

  const sql = `
    INSERT INTO PI_Recenzija
    (KorisnikID, ObjektID, Ocjena, Komentar, DatumObjave)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(sql, [KorisnikID, ObjektID, Ocjena, Komentar], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId });
  });
});

app.delete("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { KorisnikID } = req.body;

  const checkSql = "SELECT KorisnikID FROM PI_Recenzija WHERE RecenzijaID=?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    if (results[0].KorisnikID !== KorisnikID) return res.status(403).json({ error: "No permission" });

    const delSql = "DELETE FROM PI_Recenzija WHERE RecenzijaID=?";
    connection.query(delSql, [id], err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
  });
});

app.put("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { Komentar, Ocjena, KorisnikID } = req.body;

  const checkSql = "SELECT KorisnikID FROM PI_Recenzija WHERE RecenzijaID=?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ error: "Not found" });
    if (results[0].KorisnikID !== KorisnikID) return res.status(403).json({ error: "No permission" });

    const sql = `
      UPDATE PI_Recenzija 
      SET Komentar=?, Ocjena=? 
      WHERE RecenzijaID=?
    `;

    connection.query(sql, [Komentar, Ocjena, id], err => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    });
  });
});

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

  const sql = `INSERT INTO PI_Favoriti (KorisnikID, ObjektID, DatumDodavanja) VALUES (?, ?, NOW())`;

  connection.query(sql, [KorisnikID, ObjektID], (err, result) => {
    if (err) {
      console.error("POST FAVORITI ERROR:", err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: "Već u favoritima" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId });
  });
});

app.delete("/api/favoriti", (req, res) => {
  const { KorisnikID, ObjektID } = req.body;

  const sql = `DELETE FROM PI_Favoriti WHERE KorisnikID = ? AND ObjektID = ?`;

  connection.query(sql, [KorisnikID, ObjektID], (err) => {
    if (err) {
      console.error("DELETE FAVORITI ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});