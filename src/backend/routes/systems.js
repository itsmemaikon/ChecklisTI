const express = require("express");
const router = express.Router();

// GET - listar sistemas ativos
router.get("/", async (req, res) => {
  try {
    const result = await global.db.listActiveSystems();
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - atualizar lista de sistemas (mantém histórico com is_active)
router.put("/", async (req, res) => {
  const systems = req.body;

  if (!Array.isArray(systems)) {
    return res.status(400).json({ error: "Array esperado [{id,name}, ...]" });
  }
  try {

    // pega tudo que já existe no banco
    const existingRes = await global.db.listSystems();
    const existing = existingRes.recordset || [];

    const existingById = Object.fromEntries(existing.map((s) => [s.id, s]));
    const existingByName = Object.fromEntries(existing.map((s) => [s.name, s]));

    const idsInPayload = []; // números inteiros

    for (const s of systems) {
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
        let updateSystemName = await global.db.updateSystemName([id, rawName])
      } else if (!id) {
        // Insere novo e pega o id inserido
        const insertRes = await global.db.insertSystem(rawName);

        const newId = insertRes.insertId;
        if (newId) idsInPayload.push(newId);
      } else {
        // id informado, mas não encontrado no banco
        console.warn(
          `ID ${id} não encontrado no banco — ignorando (name=${rawName}).`
        );
        // opcional: você pode lançar erro aqui se preferir:
        // throw new Error(`ID ${id} não existe`);
      }
    }

    // Desativar em lote os que não vieram no payload
    if (idsInPayload.length === 0) {
      // se payload vazio, desativa todos ativos
      let inativateSys = await global.db.inativateAllSystems();
    } else {
      const sqlText = await global.db.inativateSystems(idsInPayload);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("Erro em PUT /api/systems:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
