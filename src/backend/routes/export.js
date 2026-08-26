const express = require("express");
const router = express.Router();

// GET - exportar checklist por data
router.get("/:date", async (req, res) => {
  const dateParam = req.params.date;
  try {
    const recRes = await global.db.listChecklistsbyDate(dateParam);

    if (!recRes || recRes.length === 0) {
      return res.status(404).json({ error: "Checklist não encontrado" });
    }

    const rec = recRes[0];
    const itemsRes = await global.db.listItemsRes(rec.id);

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
        "Última Verificação",
      ],
    ];

    const checklistDate = rec.check_date
      ? new Date(rec.check_date).toISOString().slice(0, 10)
      : dateParam;

    for (const it of itemsRes || []) {
      rows.push([
        checklistDate,
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
      `attachment; filename="checklist_${checklistDate}.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error("Erro em GET /:date", err);
    res.status(500).json({ error: err.message });
  }
});

// GET - exportar todos os checklists
router.get("/", async (req, res) => {
  try {
    const recRes = await global.db.listChecklists();

    if (!recRes || recRes.length === 0) {
      return res.status(404).json({ error: "Nenhum checklist encontrado" });
    }

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
        "Última Verificação",
      ],
    ];

    for (const rec of recRes) {
      const itemsRes = await global.db.listItemsRes(rec.id);
      const checklistDate = rec.check_date
        ? new Date(rec.check_date).toISOString().slice(0, 10)
        : "";

      for (const it of itemsRes || []) {
        rows.push([
          checklistDate,
          it.agent || "",
          it.system || "",
          mapLabel[it.status] || it.status,
          it.note || "",
          it.last_check || "",
        ]);
      }
    }

    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    res.setHeader("Content-Type", "text/csv;charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="checklists_export.csv"`
    );
    res.send(csv);
  } catch (err) {
    console.error("Erro em GET /", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
