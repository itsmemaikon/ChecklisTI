const express = require("express");
const router = express.Router();
const query = require("../utils/query");
const { sql, getPool } = require("../db");

// GET - checklist por data
router.get("/:date", async (req, res) => {
  const date = req.params.date;
  try {
    const chk = await query(
      "SELECT id, check_date, saved_at FROM dbo.checklists WHERE check_date = @date",
      [{ name: "date", type: "Date", value: date }]
    );

    if (chk.recordset.length === 0) {
      return res.json(null);
    }

    const row = chk.recordset[0];
    const items = await query(
      "SELECT ci.*, s.name as system_name_db FROM dbo.checklist_items ci LEFT JOIN dbo.systems s ON ci.system_id = s.id WHERE ci.checklist_id = @id",
      [{ name: "id", type: "Int", value: row.id }]
    );

    const itemsMap = {};
    for (const it of items.recordset) {
      itemsMap[it.system_id] = {
        agent: it.agent_id,
        status: it.status,
        note: it.note,
        time: it.last_check,
      };
    }

    res.json({
      date: row.check_date.toISOString().slice(0, 10),
      savedAt: row.saved_at,
      items: itemsMap,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - salvar checklist
router.post("/", async (req, res) => {
  const data = req.body;

  if (!data || !data.date) {
    return res
      .status(400)
      .json({ error: "A Data é de preenchimento obrigatório" });
  }

  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // Verifica se já existe checklist pra data
    const existing = await tx
      .request()
      .input("date", sql.Date, data.date)
      .query("SELECT id FROM dbo.checklists WHERE check_date = @date");

    let checklistId;
    if (existing.recordset.length) {
      checklistId = existing.recordset[0].id;

      await tx
        .request()
        .input("id", sql.Int, checklistId)
        .query(
          "UPDATE dbo.checklists SET saved_at=SYSUTCDATETIME() WHERE id=@id"
        );

      await tx
        .request()
        .input("id", sql.Int, checklistId)
        .query("DELETE FROM dbo.checklist_items WHERE checklist_id=@id");
    } else {
      const ins = await tx
        .request()
        .input("date", sql.Date, data.date)
        .query(
          "INSERT INTO dbo.checklists (check_date) OUTPUT INSERTED.id VALUES (@date)"
        );

      checklistId = ins.recordset[0].id;
    }

    for (const [systemId, rec] of Object.entries(data.items || {})) {
      // if (!rec.agent) {
      //   await tx.rollback();
      //   return res
      //     .status(400)
      //     .json({ error: `O Agente é de preenchimento obrigatório` });
      // }

      // if (!rec.status) {
      //   await tx.rollback();
      //   return res
      //     .status(400)
      //     .json({ error: `O Status é de preenchimento obrigatório` });
      // }

      await tx
        .request()
        .input("checklist_id", sql.Int, checklistId)
        .input("system_id", sql.Int, parseInt(systemId, 10))
        .input("agent_id", sql.Int, rec.agent ? parseInt(rec.agent, 10) : null) // <--- incluir agent_id
        .input("status", sql.NVarChar(50), rec.status || "unknown")
        .input("note", sql.NVarChar(1000), rec.note || null)
        .input("last_check", sql.NVarChar(200), rec.time || null).query(`
          INSERT INTO dbo.checklist_items 
            (checklist_id, system_id, agent_id, status, note, last_check) 
          VALUES 
            (@checklist_id, @system_id, @agent_id, @status, @note, @last_check)
        `);
    }

    await tx.commit();
    res.json({ ok: true });
  } catch (err) {
    await tx.rollback();
    res.status(500).json({ error: err.message });
  }
});

// GET - histórico
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      "SELECT id, check_date FROM dbo.checklists ORDER BY check_date ASC"
    );

    const out = [];
    for (const r of rows.recordset) {
      const counts = await query(
        "SELECT status, COUNT(*) as cnt FROM dbo.checklist_items WHERE checklist_id = @id GROUP BY status",
        [{ name: "id", type: "Int", value: r.id }]
      );

      const obj = {
        date: r.check_date.toISOString().slice(0, 10),
        counts: {
          online: 0,
          degraded: 0,
          offline: 0,
          maintenance: 0,
          unknown: 0,
        },
      };

      for (const c of counts.recordset) {
        obj.counts[c.status] = c.cnt;
      }

      out.push(obj);
    }

    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
