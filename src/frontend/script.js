(() => {
  // Variaveis
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const tbody = $("#tbody");
  const dateInput = $("#date");
  const STATUS = [
    { key: "online", label: "Online", cls: "ok" },
    { key: "degraded", label: "Instável", cls: "warn" },
    { key: "offline", label: "Offline", cls: "down" },
    { key: "maintenance", label: "Manutenção", cls: "maint" },
    { key: "unknown", label: "Desconhecido", cls: "unknown" },
  ];
  const summaryEl = $("#summary");
  const histEl = $("#history");
  const kpiOk = $("#kpi-ok");
  const kpiWarn = $("#kpi-warn");
  const kpiDown = $("#kpi-down");
  const btnSystem = $("#btnSystem");
  const modalSystem = $("#modalSystem");
  const systemsListEl = $("#systemsList");
  const addSystemBtn = $("#addSystem");
  const newSystemInput = $("#newSystemInput");
  const saveSystemsBtn = $("#saveSystemsBtn");
  const btnAgent = $("#btnAgent");
  const modalAgent = $("#modalAgent");
  const agentsListEl = $("#agentsList");
  const addAgentBtn = $("#addAgent");
  const newAgentInput = $("#newAgentInput");
  const saveAgentsBtn = $("#saveAgentsBtn");

  // Funções Assincronas
  // Inicialização
  (async () => {
    await renderTable();
    await loadHistory();
  })();

  // API Helpers
  async function apiGet(path) {
    const res = await fetch(path);
    // if (!res.ok) throw new Error("Erro " + res.status);
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const errData = await res.json();
        if (errData?.error) msg = errData.error;
      } catch (_) {
        // se não conseguiu fazer res.json(), fica com o status mesmo
      }
      throw new Error(msg);
    }
    return res.json();
  }
  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // if (!res.ok) throw new Error("Erro " + res.status);
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const errData = await res.json();
        if (errData?.error) msg = errData.error;
      } catch (_) {
        // se não conseguiu fazer res.json(), fica com o status mesmo
      }
      throw new Error(msg);
    }

    return res.json();
  }
  async function apiPut(path, body) {
    const res = await fetch(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // if (!res.ok) throw new Error("Erro " + res.status);
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const errData = await res.json();
        if (errData?.error) msg = errData.error;
      } catch (_) {
        // se não conseguiu fazer res.json(), fica com o status mesmo
      }
      throw new Error(msg);
    }
    return res.json();
  }
  async function apiDelete(path) {
    const res = await fetch(path, { method: "DELETE" });
    // if (!res.ok) throw new Error("Erro " + res.status);
    if (!res.ok) {
      let msg = `Erro ${res.status}`;
      try {
        const errData = await res.json();
        if (errData?.error) msg = errData.error;
      } catch (_) {
        // se não conseguiu fazer res.json(), fica com o status mesmo
      }
      throw new Error(msg);
    }
    return res.json();
  }

  // Renderizar a Tabela
  async function renderTable() {
    tbody.innerHTML = "";
    const systems = await loadSystems();
    const agents = await loadAgents();
    const rec = await loadDay(dateInput.value);

    systems.forEach((sys) => {
      const rowRec = rec?.items?.[sys.id];
      tbody.appendChild(buildRow(sys, agents, rowRec));
    });
    updateSummary();
  }

  // Carregar os sistemas
  async function loadSystems() {
    try {
      const rows = await apiGet("/api/systems");
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
      }));
    } catch (err) {
      console.error("Falha ao carregar sistemas", err);
      return [];
    }
  }

  // Carregar os agentes
  async function loadAgents() {
    try {
      const rows = await apiGet("/api/agents");
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
      }));
    } catch (err) {
      console.error("Falha ao carregar agentes", err);
      return [];
    }
  }

  // Carregar o Dia
  async function loadDay(date) {
    if (!date) return null;
    try {
      return await apiGet("/api/checklist/" + date);
    } catch (err) {
      console.error("Falha ao carregar dia", err);
      return null;
    }
  }

  // Carregar o Historico
  async function loadHistory() {
    histEl.innerHTML = "";
    try {
      const rows = await apiGet("/api/checklist");

      for (const r of rows) {
        // build pseudo record to render a card
        await addHistoryEntry({
          date: r.date,
          company: r.company,
          agent: r.agent,
          counts: r.counts,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
    }
    refreshKpis();
  }

  // Adicionar Historico
  async function addHistoryEntry(data) {
    const c = data.counts || {
      online: 0,
      degraded: 0,
      offline: 0,
      maintenance: 0,
      unknown: 0,
    };

    const card = document.createElement("div");
    card.className = "history-content-item";
    card.innerHTML = `
    <div>
        <strong>${data.date}</strong>
      <button class="btn ghost" data-date="${data.date}">Abrir</button>
    </div>
    <div class="history-badge">
      <span class="badge"><span class="dot ok"></span>Online: ${c.online}</span>
      <span class="badge"><span class="dot warn"></span>Instável.: ${c.degraded}</span>
      <span class="badge"><span class="dot down"></span>Offline: ${c.offline}</span>
      <span class="badge"><span class="dot maint"></span>Manutenção: ${c.maintenance}</span>
      <span class="badge"><span class="dot unknown"></span>Desconhecido: ${c.unknown}</span>
    </div>
  `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", async () => {
      const rec = await loadDay(btn.dataset.date);
      if (rec) {
        dateInput.value = rec.date;
        renderTable();
      }
    });
    histEl.prepend(card);
  }

  // Salvar formulario do dia
  async function saveDay() {
    const date = dateInput.value;
    const systems = await loadSystems();
    const data = {
      date,
      savedAt: new Date().toISOString(),
      items: {},
    };
    $$("#tbody tr").forEach((tr, idx) => {
      const sys = systems[idx];

      const agent = tr.querySelector(".agent-select").value || null;
      const status = tr.querySelector(".status-select").value || null;
      const note = tr.querySelector(".note").value.trim();
      const time = tr.querySelector(".last-check").textContent || "";
      data.items[sys.id] = { agent, status, note, time };
    });
    try {
      await apiPost("/api/checklist", data);
      await loadHistory();
      refreshKpis();
      // alert("Checklist salvo.");
      location.reload();
    } catch (err) {
      console.error("Erro ao salvar checklist", err);
      alert("Erro ao salvar checklist: " + err.message);
    }
  }

  // Exportar em CSV
  async function exportCSV() {
    const date = dateInput.value;
    try {
      const res = await fetch("/api/export/" + date);
      if (!res.ok) throw new Error("Erro " + res.status);
      const text = await res.text();
      const blob = new Blob(["\uFEFF" + text], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checklist_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro export CSV", err);
      alert("Erro ao exportar CSV: " + err.message);
    }
  }

  // Exportar em CSV Todos
  async function exportCSVAll() {
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Erro " + res.status);
      const text = await res.text();
      const blob = new Blob(["\uFEFF" + text], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checklisti.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro export CSV", err);
      alert("Erro ao exportar CSV: " + err.message);
    }
  }

  // Chamar a função de salvar os sistemas
  async function saveSystems(list) {
    try {
      await apiPut("/api/systems", list);
      location.reload();
    } catch (err) {
      console.error("Erro ao salvar sistemas", err);
      alert("Erro ao salvar sistemas: " + err.message);
    }
  }

  // Chamar a função de salvar os agentes
  async function saveAgents(list) {
    try {
      await apiPut("/api/agents", list);
      location.reload();
    } catch (err) {
      console.error("Erro ao salvar sistemas", err);
      alert("Erro ao salvar sistemas: " + err.message);
    }
  }
  // Abrir o modal de sistemas
  async function openSystem() {
    // render systems list with delete handles
    systemsListEl.innerHTML = "";
    const systems = await loadSystems();

    systems.forEach((sys, idx) => {
      const row = document.createElement("div");
      row.className = "modal-content-item";
      row.innerHTML = `
          <input type="hidden" class="btn sysId" value="${sys.id}" disabled/>
          <input type="text" class="btn sysName" value="${sys.name}" />
          <button type="button" class="btn ghost" data-idx="${idx}">Remover</button>`;
      row.querySelector("button").addEventListener("click", () => {
        row.remove();
      });
      systemsListEl.appendChild(row);
    });
    modalSystem.showModal();
  }

  // Abrir o modal de agentes
  async function openAgent() {
    agentsListEl.innerHTML = "";
    const agents = await loadAgents();

    agents.forEach((agt, idx) => {
      const row = document.createElement("div");
      row.className = "modal-content-item";
      row.innerHTML = `
          <input type="hidden" class="btn agtId" value="${agt.id}" disabled/>
          <input type="text" class="btn agtName" value="${agt.name}" />
          <button type="button" class="btn ghost" data-idx="${idx}">Remover</button>`;
      row.querySelector("button").addEventListener("click", () => {
        row.remove();
      });
      agentsListEl.appendChild(row);
    });
    modalAgent.showModal();
  }

  // Renderizar a tela após o update de sistema
  async function saveSystem() {
    const systems = Array.from(document.querySelectorAll("#systemsList div"))
      .map((row) => {
        const idInput = row.querySelector(".sysId");
        const nameInput = row.querySelector(".sysName");
        return {
          id: idInput ? parseInt(idInput.value) || null : null,
          name: nameInput.value.trim(),
        };
      })
      .filter((s) => s.name); // remove linhas vazias

    await saveSystems(systems);
    renderTable();
  }

  // Renderizar a tela após o update de agente
  async function saveAgent() {
    const agents = Array.from(document.querySelectorAll("#agentsList div"))
      .map((row) => {
        const idInput = row.querySelector(".agtId");
        const nameInput = row.querySelector(".agtName");
        return {
          id: idInput ? parseInt(idInput.value) || null : null,
          name: nameInput.value.trim(),
        };
      })
      .filter((s) => s.name); // remove linhas vazias

    await saveAgents(agents);
    renderTable();
  }

  // Funções
  // Montar as linhas da tabela
  function buildRow(system, agents, record) {
    const tr = document.createElement("tr");
    tr.dataset.systemId = system.id; // guarda o ID do sistema

    tr.innerHTML = `
    <td data-label="Sistema"><p>${system.name}</p></td>

    <!-- Select de agentes -->
    <td data-label="Agente">
      <select class="btn ghost agent-select" aria-label="Agente de ${
        agents.name
      }" required>
        <option value="">Selecione um agente</option>
        ${agents
          .map(
            (a) =>
              `<option value="${a.id}" ${
                record?.agent === a.id ? "selected" : ""
              }>${a.name}</option>`
          )
          .join("")}
      </select>
    </td>

    <!-- Select de status -->
    <td data-label="Status">
      <select class="btn ghost status-select" aria-label="Status de ${
        system.name
      }" required>
        <option value="">Selecione</option>
        ${STATUS.map(
          (s) =>
            `<option value="${s.key}" ${
              record?.status === s.key ? "selected" : ""
            }>${s.label}</option>`
        ).join("")}
      </select>
    </td>

    <td data-label="Observações"><input class="btn ghost note" type="text" placeholder="Opcional" value="${
      record?.note || ""
    }" /></td>
    <td data-label="Últ Verif" class="last-check">${record?.time || "—"}</td>
  `;

    // pega os elementos
    const statusSelect = tr.querySelector(".status-select");
    const agentSelect = tr.querySelector(".agent-select");
    const note = tr.querySelector(".note");
    const last = tr.querySelector(".last-check");

    // evento: mudar status
    statusSelect.addEventListener("change", () => {
      last.textContent = new Date().toLocaleString();
      updateSummary();
    });

    // evento: mudar agente
    agentSelect.addEventListener("change", () => {
      last.textContent = new Date().toLocaleString();
    });

    // evento: mudar nota
    note.addEventListener("change", () => {
      if (!last.textContent || last.textContent === "—") {
        last.textContent = new Date().toLocaleString();
      }
    });

    return tr;
  }

  // Atualizar o sumário
  function updateSummary() {
    const c = countStatus();
    const parts = STATUS.map((s) => {
      const n = c[s.key];
      return `<span class="badge"><span class="dot ${s.cls}"></span>${s.label}: ${n}</span>`;
    });
    summaryEl.innerHTML = parts.join(" ");
  }

  // Contar os status
  function countStatus() {
    const counts = {
      online: 0,
      degraded: 0,
      offline: 0,
      maintenance: 0,
      unknown: 0,
    };
    $$("#tbody tr").forEach((tr) => {
      const val = tr.querySelector(".status-select").value;
      counts[val]++;
    });
    return counts;
  }

  // Retornar o dia de hoje
  function todayISO() {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 10);
  }

  // Recarregar os KPIs
  function refreshKpis() {
    // aggregate from the latest day (selected)
    (async () => {
      const rec = await loadDay(dateInput.value);
      const counts = { online: 0, degraded: 0, offline: 0 };
      if (rec && rec.items) {
        Object.values(rec.items).forEach((v) => {
          if (v.status === "online") counts.online++;
          else if (v.status === "degraded")
            counts.warn = (counts.warn || 0) + 1;
          else if (v.status === "offline") counts.offline++;
        });
      }
      // kpiOk.textContent = counts.online || 0;
      // kpiWarn.textContent = counts.warn || 0;
      // kpiDown.textContent = counts.offline || 0;
    })();
  }

  // Marcar todos os registros
  function markAll(as) {
    $$("#tbody tr select.status-select").forEach((sel) => {
      sel.value = as;
    });
    $$("#tbody tr .last-check").forEach((td) => {
      td.textContent = new Date().toLocaleString();
    });
    updateSummary();
  }

  // Imprimir Página
  function printPage() {
    window.print();
  }

  // Eventos
  dateInput.value = todayISO();
  dateInput.addEventListener("change", () => {
    renderTable();
    refreshKpis();
  });
  dateInput.addEventListener("focus", () => {
    if (dateInput.showPicker) {
      // só se o navegador suportar
      dateInput.showPicker();
    }
  });
  $("#btnSave").addEventListener("click", saveDay);
  $("#btnExport").addEventListener("click", exportCSV);
  $("#btnExportAll").addEventListener("click", exportCSVAll);
  $("#btnPrint").addEventListener("click", printPage);
  $("#btnAllOk").addEventListener("click", () => markAll("online"));
  $("#btnAllWarn").addEventListener("click", () => markAll("degraded"));
  $("#btnAllDown").addEventListener("click", () => markAll("offline"));
  $("#btnAllMaint").addEventListener("click", () => markAll("maintenance"));
  $("#btnAllUnknown").addEventListener("click", () => markAll("unknown"));
  btnSystem.addEventListener("click", openSystem);
  btnAgent.addEventListener("click", openAgent);
  addSystemBtn.addEventListener("click", () => {
    if (!newSystemInput.value.trim()) return;
    const row = document.createElement("div");
    row.className = "modal-content-item";
    row.innerHTML = `
      <input type="hidden" class="btn sysId" value="" disabled/>
      <input type="text" class="btn sysName" value="${newSystemInput.value.trim()}" />\n          
      <button type="button" class="btn ghost">Remover</button>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    systemsListEl.appendChild(row);
    newSystemInput.value = "";
    newSystemInput.focus();
  });
  addAgentBtn.addEventListener("click", () => {
    if (!newAgentInput.value.trim()) return;
    const row = document.createElement("div");
    row.className = "modal-content-item";
    row.innerHTML = `
      <input type="hidden" class="btn agtId" value="" disabled/>
      <input type="text" class="btn agtName" value="${newAgentInput.value.trim()}" />\n          
      <button type="button" class="btn ghost">Remover</button>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    agentsListEl.appendChild(row);
    newAgentInput.value = "";
    newAgentInput.focus();
  });
  saveSystemsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveSystem();
    modalSystem.close();
  });
  saveAgentsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await saveAgent();
    modalAgent.close();
  });
})();
