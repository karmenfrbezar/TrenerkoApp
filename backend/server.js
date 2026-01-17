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
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  }
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
      console.error('Register error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
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
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Neispravan username ili lozinka" });
    }

    const user = results[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      gender: user.spol,
      role: user.uloga,
      vrijeme_reg: user.vrijeme_reg
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
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }
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
    if (err) {
      console.error('/api/objects error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }
    res.json(results);
  });
});



// =======================
// RECENZIJE DOHVAT
// ======================= 
app.get("/api/recenzije", (req, res) => {
  const sql = `
    SELECT 
      r.id AS RecenzijaID,
      r.gym_id AS ObjektID,
      o.NazivObjekta,
      r.rating AS Ocjena,
      r.comment AS Komentar,
      r.created_at,
      r.user_id,
      k.username
    FROM Recenzije r
    JOIN ISportskiObjekt o ON o.ObjektID = r.gym_id
    JOIN Korisnik k ON k.id = r.user_id
    ORDER BY r.created_at DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('/api/recenzije error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }
    res.json(results);
  });
});

// RECENZIJE - DODAVANJE
app.post("/api/recenzije", (req, res) => {
  const { Komentar, Ocjena, ObjektID, user_id } = req.body;

  if (!Komentar || Ocjena == null || !ObjektID || !user_id) {
    return res.status(400).json({ error: "Sva polja su obavezna (Komentar, Ocjena, ObjektID, user_id)" });
  }

  const sql = `
    INSERT INTO Recenzije (comment, rating, gym_id, user_id, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  connection.query(sql, [Komentar, Ocjena, ObjektID, user_id], (err, result) => {
    if (err) {
      console.error('DB error inserting recenziju:', err);
      return res.status(500).json({ error: err.message || 'Greška pri unosu u bazu' });
    }
    res.json({ success: true, insertedId: result.insertId });
  });
});

// RECENZIJE - BRISANJE
app.delete("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body; // korisnički ID mora doći iz frontenda

  if (!user_id) {
    return res.status(400).json({ error: "Nedostaje user_id za provjeru prava brisanja" });
  }

  // Provjera je li recenzija pripada korisniku
  const provjeraSql = "SELECT user_id FROM Recenzije WHERE id = ?";
  connection.query(provjeraSql, [id], (err, results) => {
    if (err) {
      console.error('Error provjere vlasništva recenzije:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Recenzija ne postoji' });
    }

    if (results[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Nemate pravo brisati ovu recenziju' });
    }

    // Ako je vlasnik može obrisati
    const deleteSql = "DELETE FROM Recenzije WHERE id = ?";
    connection.query(deleteSql, [id], (err) => {
      if (err) {
        console.error('Delete recenzije error:', err);
        return res.status(500).json({ error: err.message || 'DB error' });
      }
      res.json({ success: true });
    });
  });
});

// RECENZIJE - UREĐIVANJE
app.put("/api/recenzije/:id", (req, res) => {
  const { id } = req.params;
  const { Komentar, Ocjena, user_id } = req.body;

  if (!Komentar || Ocjena == null || !user_id) {
    return res.status(400).json({ error: "Sva polja su obavezna (Komentar, Ocjena, user_id)" });
  }

  // Provjera vlasništva recenzije
  const provjeraSql = "SELECT user_id FROM Recenzije WHERE id = ?";
  connection.query(provjeraSql, [id], (err, results) => {
    if (err) {
      console.error('Error provjere vlasništva recenzije:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Recenzija ne postoji' });
    }
    if (results[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Nemate pravo uređivati ovu recenziju' });
    }

    const updateSql = "UPDATE Recenzije SET comment = ?, rating = ? WHERE id = ?";
    connection.query(updateSql, [Komentar, Ocjena, id], (err) => {
      if (err) {
        console.error('Update recenzije error:', err);
        return res.status(500).json({ error: err.message || 'DB error' });
      }
      res.json({ success: true });
    });
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
// =======================
// DOHVAT KORISNIKA (ADMIN)
// =======================
app.get("/api/users", (req, res) => {
  const sql = `
    SELECT id, username, email, spol AS gender, uloga AS role, vrijeme_reg
    FROM Korisnik
    ORDER BY id DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('/api/users error:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }
    res.json(results);
  });
});


app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;

  // 1) prvo dohvatimo korisnika
  const checkSql = "SELECT uloga FROM Korisnik WHERE id = ?";
  connection.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('Error checking user role:', err);
      return res.status(500).json({ error: err.message || 'DB error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Korisnik ne postoji' });
    }

    // 2) ako je admin, ne dozvoljavamo brisanje
    if (results[0].uloga === 'admin') {
      return res.status(403).json({ error: 'Ne možete obrisati admin korisnika' });
    }

    // 3) ako nije admin, brišemo
    const deleteSql = "DELETE FROM Korisnik WHERE id = ?";
    connection.query(deleteSql, [id], (err) => {
      if (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({ error: err.message || 'DB error' });
      }
      res.json({ success: true });
    });
  });
});




app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
