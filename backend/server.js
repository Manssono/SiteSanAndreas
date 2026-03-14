console.log("🔥 SERVER CERTO CARREGADO");

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// =============================
// MIDDLEWARES
// =============================
app.use(express.json());
app.use(cors());

// =============================
// SERVIR FRONTEND
// =============================
const pathFront = path.join(__dirname, "..", "frontend");
app.use(express.static(pathFront)); // Agora todos os HTML/CSS/JS são servidos pelo Express

// =============================
// CAMINHOS DOS ARQUIVOS JSON
// =============================
const DB_CARROS = path.join(__dirname, "..", "database", "carros.json");
const DB_USUARIOS = path.join(__dirname, "..", "database", "usuarios.json");

// =============================
// GARANTIR QUE ARQUIVOS EXISTEM
// =============================
function garantirArquivo(caminho) {
    if (!fs.existsSync(caminho)) {
        fs.writeFileSync(caminho, "[]");
    }
}
garantirArquivo(DB_CARROS);
garantirArquivo(DB_USUARIOS);

// =============================
// FUNÇÕES AUXILIARES
// =============================
function lerJSON(caminho) {
    try {
        const data = fs.readFileSync(caminho, "utf-8");
        return JSON.parse(data);
    } catch (erro) {
        console.error("Erro ao ler JSON:", erro);
        return [];
    }
}

function salvarJSON(caminho, dados) {
    fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
}

// =============================
// ROTAS TESTE
// =============================
app.get("/", (req, res) => {
    res.sendFile(path.join(pathFront, "index.html"));
});

// =============================
// USUÁRIOS
// =============================

// Cadastro de usuário
app.post("/cadastrar", (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    const usuarios = lerJSON(DB_USUARIOS);
    const existe = usuarios.find(u => u.email === email);

    if (existe) {
        return res.status(400).json({ erro: "Email já cadastrado!" });
    }

    const novoUsuario = { id: Date.now(), nome, email, senha };
    usuarios.push(novoUsuario);
    salvarJSON(DB_USUARIOS, usuarios);

    // sucesso, envia mensagem para o frontend redirecionar
    res.status(200).json({ mensagem: "Conta criada com sucesso!" });
});

// Login de usuário
app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ erro: "Dados incompletos" });
    }

    const usuarios = lerJSON(DB_USUARIOS);
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ erro: "Email ou senha incorretos!" });
    }

    res.status(200).json({ mensagem: "Login bem-sucedido!" });
});

// Listar todos os usuários (debug)
app.get("/usuarios", (req, res) => {
    res.json(lerJSON(DB_USUARIOS));
});

// =============================
// CARROS
// =============================

// Listar carros
app.get("/carros", (req, res) => {
    res.json(lerJSON(DB_CARROS));
});

// Cadastrar carro
app.post("/carros", (req, res) => {
    const carros = lerJSON(DB_CARROS);
    const novoCarro = { id: Date.now(), ...req.body };
    carros.push(novoCarro);
    salvarJSON(DB_CARROS, carros);
    res.status(200).json({ mensagem: "Carro cadastrado com sucesso!" });
});

// =============================
// START SERVER
// =============================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});