console.log("🔥 SERVER CARREGOS CARREGADO");

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// =============================
// MIDDLEWARES
// =============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================
// FRONTEND
// =============================
const pathFront = path.join(__dirname, "..", "frontend");
app.use(express.static(pathFront));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve imagens

// =============================
// JSON PATHS
// =============================
const DB_CARROS = path.join(__dirname, "..", "database", "carros.json");
console.log("📂 Caminho do carros.json:", DB_CARROS);
const DB_USUARIOS = path.join(__dirname, "..", "database", "usuarios.json");

// =============================
// GARANTIR ARQUIVOS
// =============================
function garantirArquivo(caminho) {
    if (!fs.existsSync(caminho)) fs.writeFileSync(caminho, "[]");
}
garantirArquivo(DB_CARROS);
garantirArquivo(DB_USUARIOS);

// =============================
// MULTER CONFIG
// =============================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nomeSeguro = file.originalname.replace(/\s/g, "_");
        cb(null, Date.now() + "-" + nomeSeguro);
    }
});
const upload = multer({ storage });

// =============================
// ROTAS DE CARROS
// =============================

// Criar carro com fotos
app.post("/carros", upload.array("fotos", 10), (req, res) => {
    try {
        const carros = JSON.parse(fs.readFileSync(DB_CARROS, "utf-8") || "[]");

        const {
            marca, modelo, ano, quilometragem,
            motor, versao, cambio, combustivel,
            preco, descricao, contatoNome,
            contatoTelefone, contatoEmail,
            contatoCidade, anunciante
        } = req.body;

        // Cria URLs completas para o frontend
        const fotos = req.files.map(f => `http://localhost:${PORT}/uploads/${f.filename}`);

        const novoCarro = {
            id: Date.now() + Math.floor(Math.random() * 1000), // garante unicidade
            marca,
            modelo,
            ano: Number(ano),
            quilometragem: Number(quilometragem),
            motor,
            versao,
            cambio,
            combustivel,
            preco: Number(preco),
            descricao,
            contatoNome,
            contatoTelefone,
            contatoEmail,
            contatoCidade,
            anunciante,
            fotos
        };

        carros.push(novoCarro);
        fs.writeFileSync(DB_CARROS, JSON.stringify(carros, null, 2));

        res.status(200).json({ mensagem: "Carro cadastrado com sucesso!", carro: novoCarro });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao cadastrar carro" });
    }
});

// Listar carros
app.get("/carros", (req, res) => {
    try {
        const carros = JSON.parse(fs.readFileSync(DB_CARROS, "utf-8") || "[]");
        res.json(carros);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao listar carros" });
    }
});

// =============================
// ROTAS DE USUÁRIOS
// =============================

app.post("/cadastrar", (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ erro: "Dados incompletos" });

    const usuarios = JSON.parse(fs.readFileSync(DB_USUARIOS, "utf-8") || "[]");
    if (usuarios.find(u => u.email === email)) return res.status(400).json({ erro: "Email já cadastrado!" });

    const novoUsuario = { id: Date.now(), nome, email, senha };
    usuarios.push(novoUsuario);
    fs.writeFileSync(DB_USUARIOS, JSON.stringify(usuarios, null, 2));

    res.status(200).json({ mensagem: "Conta criada com sucesso!" });
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const usuarios = JSON.parse(fs.readFileSync(DB_USUARIOS, "utf-8") || "[]");
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (!usuario) return res.status(401).json({ erro: "Email ou senha incorretos!" });
    res.status(200).json({ mensagem: "Login bem-sucedido!", usuario });
});

// =============================
// INICIAR SERVIDOR
// =============================
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));