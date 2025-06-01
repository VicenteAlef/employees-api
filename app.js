const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const authMiddleware = require("./authMiddleware");
const tokenBlacklist = require("./tokenBlacklist");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

//===============================MANAGERS===============================
//RESGITRO-SIGN IN
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Todos os campos devem ser preenchidos" });

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

//EDITAR GERENTE =
app.put("/managers/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!username && !password) {
    return res
      .status(400)
      .json({ message: "Informe ao menos um campo para atualizar." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM managers WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Gerente não encontrado." });
    }

    let updateFields = [];
    let values = [];

    if (username) {
      updateFields.push("username=?");
      values.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push("senha=?");
      values.push(hashedPassword);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE managers SET ${updateFields.join(", ")} WHERE id=?`,
      values
    );

    res.json({ message: "Gerente atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

//DELETAR GERENTE
app.delete("/managers/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM managers WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Gerente não encontrado." });
    }

    await pool.query("DELETE FROM managers WHERE id=?", [id]);

    res.json({ message: "Gerente excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

//LOGIN - CONCESSÃO DE TOKEN JWT
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Todos os campos devem ser preenchidos" });

  try {
    const [rows] = await pool.query("SELECT * FROM managers WHERE username=?", [
      username,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const manager = rows[0];
    const validPassword = await bcrypt.compare(password, manager.senha);
    if (!validPassword) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: manager.id, username: manager.username },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor!", error: err.message });
  }
});

//LOGOUT GERENTE
app.post("/logout", authMiddleware, (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    tokenBlacklist.add(token);
  }
  res.json({ message: "Logout realizado com sucesso!" });
});

//LISTAR GERENTES
app.get("/managers-list", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username FROM managers");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

//==============================EMPLOYEES==============================
//LISTAR FUNCIONÁRIOS
app.get("/get-employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//REGISTRAR NOVO FUNCIONÁRIO
app.post("/new-employee", authMiddleware, async (req, res) => {
  const { name, cpf, email, phone } = req.body;
  if (!name || !cpf || !email || !phone) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios" });
  }
  try {
    await pool.query(
      "INSERT INTO employees (name, cpf, email, phone) VALUES (?, ?, ?, ?)",
      [name, cpf, email, phone]
    );
    res.status(201).json({ message: "Funcionário cadastrado com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//EDITAR DADOS DO FUNCIONÀRIO
app.put("/employee/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, cpf, email, phone } = req.body;

  if (!name || !cpf || !email || !phone) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    await pool.query(
      "UPDATE employees SET name=?, cpf=?, email=?, phone=? WHERE id=?",
      [name, cpf, email, phone, id]
    );

    res.json({ message: "Funcionário atualizado com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

//EXCLUIR FUNCIONÁRIO
app.delete("/employee/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id=?", [id]);
    if (id.length === 0) {
      return res.status(404).json({ message: "Funcionário não encontrado!" });
    }

    await pool.query("DELETE FROM employees WHERE id=?", [id]);

    res.status(200).json({ message: "Funcionário removido com sucesso!" });
  } catch (err) {
    res.status(500).json({ message: "Erro no servidor", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
