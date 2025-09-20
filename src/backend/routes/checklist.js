const express = require("express");
const router = express.Router();

// GET - checklist por data
router.get("/:date", async (req, res) => {
  const date = req.params.date;
  try {
    const chk = await global.db.listChecklistFromDate(date);

    if (chk.recordset.length === 0) {
      return res.json(null);
    }

    const row = chk.recordset[0];
    const items = await global.db.listChecklistItems(row.id);

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

  try {

    // Verifica se já existe checklist pra data
    const existing = await global.db.listChecklistFromDate(data.date);

    let checklistId;
    if (existing.recordset.length) {
      checklistId = existing.recordset[0].id;

      let modifydatechecklist = await global.db.updateChecklistSaveAt(checklistId);
      let deletechecklist = await global.db.daleteChecklistItems(checklistId);

    } else {
      const ins = await global.db.insertChecklist(data.date);

      checklistId = ins.recordset[0].id;
    }

    for (const [systemId, rec] of Object.entries(data.items || {})) {
      let system_idd = parseInt(systemId, 10);
      let agent_id   = rec.agent ? parseInt(rec.agent, 10) : null;
      let status     = rec.status || "unknown";
      let note       = rec.note || null;
      let last_check = rec.time || null;
      let insertChecklistItem = await global.db.insertChecklistItems([checklistId, system_idd, agent_id, status, note, last_check]);
    };
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  };
});

// GET - histórico
router.get("/", async (req, res) => {
  try {
    const rows = await global.db.listChecklists();

    const out = [];
    for (const r of rows.recordset) {
      const counts = await global.db.listChecklistsStatusCount(r.id);

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
