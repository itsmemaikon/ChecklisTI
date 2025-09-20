const express = require("express");
const router = express.Router();

// GET - listar agentes ativos
router.get("/", async (req, res) => {
  try {
    const result = await global.db.listActiveAgents();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - atualizar lista de agentes (mantém histórico com is_active)
router.put("/", async (req, res) => {
  const agents = req.body;
  console.log(agents);

  if (!Array.isArray(agents)) {
    return res.status(400).json({ error: "Array esperado [{id,name}, ...]" });
  }

  try {
    // pega tudo que já existe no banco
    const existing = await global.db.listActiveAgents();

    const existingById = Object.fromEntries(existing.map((s) => [s.id, s]));
    const existingByName = Object.fromEntries(existing.map((s) => [s.name, s]));

    const idsInPayload = []; // números inteiros

    for (const s of agents) {
      const rawName = s && s.name ? String(s.name).trim() : "";
      if (!rawName) continue;

      // parse id de forma segura
      let id = null;
      if (s && typeof s.id === "number" && Number.isInteger(s.id)) {
        id = s.id;
      } else if (
        s &&
        typeof s.id === "string" &&
        s.id.trim() !== "" &&
        !Number.isNaN(Number(s.id))
      ) {
        id = Number(s.id);
      } else {
        // Fallback: tenta achar pelo nome (opcional — comente se não quiser)
        if (existingByName[rawName]) id = existingByName[rawName].id;
      }

      if (id && existingById[id]) {
        // Atualiza nome se mudou e garante ativo
        idsInPayload.push(id);
        let updateAgentName = await global.db.attAgentName(id, rawName);
        console.log(id, rawName);
      } else if (!id) {
        // Insere novo e pega o id inserido
        const insertRes = await global.db.insertAgent(rawName);
        const newId = insertRes.insertId;
        if (newId) idsInPayload.push(newId);
      } else {
        // id informado, mas não encontrado no banco
        console.warn(
          `ID ${id} não encontrado no banco — ignorando (name=${rawName}).`
        );
      }
    }

    // Desativar em lote os que não vieram no payload
    if (idsInPayload.length === 0) {
      await global.db.desativateAgents();
    } else {
      await global.db.inativateAgents(idsInPayload);
      console.log(idsInPayload);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro em PUT /api/agents:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
