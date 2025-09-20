const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Importar rotas
const systemsRoutes = require("./routes/systems");
const agentsRoutes = require("./routes/agents");
const checklistRoutes = require("./routes/checklist");
const exportRoutes = require("./routes/export");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

global.db = require('./db');

// Rotas da API
app.use("/api/systems", systemsRoutes);
app.use("/api/agents", agentsRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/export", exportRoutes);

app.use(express.static(path.join(__dirname, 'frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start
app.listen(PORT, () => {
  console.log(`✅ Server rodando em http://localhost:${PORT}`);
});
