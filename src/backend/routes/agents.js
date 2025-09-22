const express = require("express");
const router = express.Router();
const query = require("../utils/query");
const { sql, getPool } = require("../db");

// GET - listar agentes ativos
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name FROM dbo.agents WHERE is_active = 1 ORDER BY id"
    );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - atualizar lista de agentes (mantém histórico com is_active)
router.put("/", async (req, res) => {
  const agents = req.body;

  if (!Array.isArray(agents)) {
    return res.status(400).json({ error: "Array esperado [{id,name}, ...]" });
  }

  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // pega tudo que já existe no banco
    const existingRes = await tx
      .request()
      .query("SELECT id, name, is_active FROM dbo.agents");
    const existing = existingRes.recordset || [];

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
        await tx
          .request()
          .input("id", sql.Int, id)
          .input("name", sql.NVarChar(200), rawName)
          .query("UPDATE dbo.agents SET name=@name, is_active=1 WHERE id=@id");
      } else if (!id) {
        // Insere novo e pega o id inserido
        const insertRes = await tx
          .request()
          .input("name", sql.NVarChar(200), rawName)
          .query(
            "INSERT INTO dbo.agents (name, is_active) OUTPUT INSERTED.id VALUES (@name,1)"
          );
        const newId =
          insertRes.recordset &&
          insertRes.recordset[0] &&
          insertRes.recordset[0].id;
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
      await tx
        .request()
        .query("UPDATE dbo.agents SET is_active = 0 WHERE is_active = 1");
    } else {
      // construir parametros dinamicamente para evitar SQL injection
      const req = tx.request();
      const paramNames = idsInPayload
        .map((id, idx) => {
          const name = `p${idx}`;
          req.input(name, sql.Int, id);
          return `@${name}`;
        })
        .join(", ");
      const sqlText = `
        UPDATE dbo.agents
        SET is_active = 0
        WHERE id NOT IN (${paramNames}) AND is_active = 1
      `;
      await req.query(sqlText);
    }

    await tx.commit();
    res.json({ ok: true });
  } catch (err) {
    await tx.rollback();
    console.error("Erro em PUT /api/agents:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
