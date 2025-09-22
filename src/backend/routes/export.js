const express = require("express");
const router = express.Router();
const query = require("../utils/query");

router.get("/:date", async (req, res) => {
  const date = req.params.date;
  try {
    const recRes = await query(
      "SELECT id FROM dbo.checklists WHERE check_date=@date",
      [{ name: "date", type: "Date", value: date }]
    );

    if (!recRes.recordset.length) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    const rec = recRes.recordset[0];
    const itemsRes = await query(
      "SELECT ch.check_date, ag.name AS agent, sy.name AS system, status, note, last_check FROM dbo.checklist_items ci LEFT JOIN dbo.checklists ch ON ch.id = ci.checklist_id LEFT JOIN dbo.systems sy ON sy.id = ci.system_id LEFT JOIN dbo.agents ag ON ag.id = ci.agent_id WHERE checklist_id=@id",
      [{ name: "id", type: "Int", value: rec.id }]
    );

    const mapLabel = {
      online: "Online",
      degraded: "Degradado",
      offline: "Offline",
      maintenance: "Manutenção",
      unknown: "Desconhecido",
    };

    const rows = [
      [
        "Data",
        "Agente",
        "Sistema",
        "Status",
        "Observações",
        "Ultima Verificação",
      ],
    ];

    for (const it of itemsRes.recordset) {
      rows.push([
        date,
        it.agent || "",
        it.system || "",
        mapLabel[it.status] || it.status,
        it.note || "",
        it.last_check || "",
      ]);
    }

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    res.setHeader("Content-Type", "text/csv;charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="checklist_${date}.csv"`
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const date = req.params.date;
  try {
    const recRes = await query("SELECT id FROM dbo.checklists");

    if (!recRes.recordset.length) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    const rec = recRes.recordset[0];
    const itemsRes = await query(
      "SELECT ch.check_date, ag.name AS agent, sy.name AS system, status, note, last_check FROM dbo.checklist_items ci LEFT JOIN dbo.checklists ch ON ch.id = ci.checklist_id LEFT JOIN dbo.systems sy ON sy.id = ci.system_id LEFT JOIN dbo.agents ag ON ag.id = ci.agent_id WHERE checklist_id=@id",
      [{ name: "id", type: "Int", value: rec.id }]
    );

    const mapLabel = {
      online: "Online",
      degraded: "Degradado",
      offline: "Offline",
      maintenance: "Manutenção",
      unknown: "Desconhecido",
    };

    const rows = [
      [
        "Data",
        "Agente",
        "Sistema",
        "Status",
        "Observações",
        "Ultima Verificação",
      ],
    ];

    for (const it of itemsRes.recordset) {
      rows.push([
        date,
        it.agent || "",
        it.system || "",
        mapLabel[it.status] || it.status,
        it.note || "",
        it.last_check || "",
      ]);
    }

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    res.setHeader("Content-Type", "text/csv;charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="checklist_${date}.csv"`
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
