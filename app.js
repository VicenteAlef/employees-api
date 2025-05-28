const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authMiddleware = require("./authMiddleware");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const blacklistedTokens = [];

//RESGITER>>>>>>>>>>>>>>>>>>>
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM managers WHERE username=?", [
      username,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Usuário já existente" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO managers (username, senha) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({
      message: "Usuario criado com sucesso",
      id: result.insertID,
      username,
    });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

app.get("/managers-list", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username FROM managers");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
