// server.js
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
  host: "ucka.veleri.hr",      // ili tvoj host
  user: "kfrbezar",           // ili tvoj user
  password: "11",           // ili tvoja lozinka
  database: "kfrbezar"    // ime tvoje baze
});

connection.connect(err => {
  if(err) throw err;
  console.log("Connected to MySQL!");
});

// REGISTRACIJA
app.post("/api/register", (req, res) => {
  const { username, email, password, gender } = req.body;
  const sql = "INSERT INTO Korisnik (username,email,password,spol, vrijeme_reg) VALUES (?,?,?,?,NOW())";
  connection.query(sql, [username, email, password, gender], (err, result) => {
    if(err) {
      res.json({ error: err });
    } else {
      res.json({ id: result.insertId, username, email, gender });
    }
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM Korisnik WHERE username=? AND password=?";
  connection.query(sql, [username, password], (err, results) => {
    if(err) return res.json({ error: err });
    if(results.length === 0) return res.json({ error: "Neispravan username ili lozinka" });
    const user = results[0];
    res.json({ id: user.id, username: user.username, email: user.email, gender: user.spol });
  });
});

// EDIT USER
app.put("/api/user/:id", (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;
  const sql = "UPDATE Korisnik SET username=?, email=? WHERE id=?";
  connection.query(sql, [username, email, id], (err) => {
    if(err) return res.json({ error: err });
    res.json({ success: true });
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
