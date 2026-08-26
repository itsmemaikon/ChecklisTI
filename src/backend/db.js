const mysql = require('mysql2/promise');

// Pool de conexões: o mysql2 gerencia reconexão e concorrência sozinho.
// A conexão única anterior usava `.state`, propriedade que não existe no
// driver mysql2 (era da lib antiga `mysql`), então a checagem de conexão
// "viva" nunca funcionava de verdade e uma queda de conexão travava o app.
let pool;

function conectarBD() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10
        });
    }
    return pool;
}

//AGENT
async function listAgents() {
    const conexao = await conectarBD();
    const sql = `SELECT id, name FROM agents WHERE is_active = 1 ORDER BY id`;
    const [resultado] = await conexao.query(sql);
    return resultado;  
}

async function listActiveAgents() {
    const conexao = await conectarBD();
    const sql = `SELECT id, name, is_active FROM agents`;
    const [resultado] = await conexao.query(sql);
    return resultado;  
}

async function attAgentName(id, name) {
    const conexao = await conectarBD();
    const sql = `UPDATE agents SET name = ? WHERE id = ?`;
    const [resultado] = await conexao.query(sql, [name, id]);
    return resultado;
}

async function insertAgent(nome) {
    const conexao = await conectarBD();
    const sql = `INSERT INTO agents (name, is_active) VALUES (?, 1)`;
    const [resultado] = await conexao.query(sql, [nome]);
    return resultado; 
}

async function desativateAgents() {
    const conexao = await conectarBD();
    const sql = `UPDATE agents SET is_active = 0 WHERE is_active = 1`;
    const [resultado] = await conexao.query(sql);
    return resultado;
}

async function inativateAgents(ids) {
  const conexao = await conectarBD();
  if (!Array.isArray(ids) || ids.length === 0) {
    return desativateAgents();
  }
  const sql = `UPDATE agents SET is_active = 0 WHERE id NOT IN (?) AND is_active = 1`;
  const [resultado] = await conexao.query(sql, [ids]);
  return resultado;
}

//CHECKLIST
async function listChecklistFromDate(date) {
    const conexao = await conectarBD();
    const sql = `SELECT id, check_date, saved_at FROM checklists WHERE check_date = ?`;
    const [resultado] = await conexao.query(sql, [date]);
    return resultado;  
}

async function listChecklistItems(id) {
    const conexao = await conectarBD();
    const sql = `SELECT ci.*, s.name as system_name_db FROM checklist_items ci LEFT JOIN systems s ON system_id = s.id WHERE ci.checklist_id = ?`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado;  
}

async function updateChecklistSaveAt(id) {
    const conexao = await conectarBD();
    const sql = `UPDATE checklists SET saved_at = CURRENT_TIMESTAMP(6) WHERE id = ?`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado;
}

async function deleteChecklistItems(id) {
    const conexao = await conectarBD();
    const sql = `DELETE FROM checklist_items WHERE checklist_id=?`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado;
}

async function insertChecklist(date) {
    const conexao = await conectarBD();
    const sql = `INSERT INTO checklists (check_date) VALUES (?);`;
    const [resultado] = await conexao.query(sql, [date]);
    return resultado.insertId;
}

async function insertChecklistItems(item) {
  console.log(item);
  const conexao = await conectarBD();
  const sql = `INSERT INTO checklist_items 
               (checklist_id, system_id, agent_id, status, note, last_check) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  const [resultado] = await conexao.query(sql, [
    item.checklist_id,
    item.system_id,
    item.agent_id,
    item.status,
    item.note,
    item.last_check
  ]);
  return resultado.insertId;
}


async function listChecklists() {
    const conexao = await conectarBD();
    const sql = `SELECT id, check_date FROM checklists ORDER BY check_date ASC`;
    const [resultado] = await conexao.query(sql);
    return resultado;  
}

async function listChecklistsStatusCount(id) {
    const conexao = await conectarBD();
    const sql = `SELECT status, COUNT(*) as cnt FROM checklist_items WHERE checklist_id=? GROUP BY status`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado;  
}

//SYSTEMS
async function listActiveSystems() {
    const conexao = await conectarBD();
    const sql = `SELECT id, name FROM systems WHERE is_active = 1 ORDER BY id`;
    const [resultado] = await conexao.query(sql);
    return resultado;  
}

async function listSystems() {
    const conexao = await conectarBD();
    const sql = `SELECT id, name, is_active FROM systems`;
    const [resultado] = await conexao.query(sql);
    return resultado;  
}

async function updateSystemName(id, name) {
    const conexao = await conectarBD();
    const sql = `UPDATE systems SET name=?, is_active=1 WHERE id=?`;
    const [resultado] = await conexao.query(sql, [name, id]);
    return resultado;
}

async function insertSystem(name) {
    const conexao = await conectarBD();
    const sql = `INSERT INTO systems (name, is_active) VALUES (?, 1);`;
    const [resultado] = await conexao.query(sql, [name]);
    return resultado;
}

async function inativateAllSystems() {
  const conexao = await conectarBD();
  const sql = `UPDATE systems SET is_active = 0 WHERE is_active = 1`;
  const [resultado] = await conexao.query(sql); 
  return resultado;
}

async function inativateSystems(ids) {
  const conexao = await conectarBD();
  if (!Array.isArray(ids) || ids.length === 0) {
    return inativateAllSystems();
  }
  const sql = `UPDATE systems SET is_active = 0 WHERE id NOT IN (?) AND is_active = 1`;
  const [resultado] = await conexao.query(sql, [ids]);
  return resultado;
}

//EXPORT
async function listChecklistsbyDate(date) {
    const conexao = await conectarBD();
    const sql = `SELECT id FROM checklists WHERE check_date=?;`;
    const [resultado] = await conexao.query(sql, [date]);
    return resultado;
}

async function listItemsRes(id) {
    const conexao = await conectarBD();
    const sql = `SELECT ch.check_date, ag.name AS agent, sy.name AS system, status, note, last_check FROM checklist_items ci LEFT JOIN checklists ch ON ch.id = ci.checklist_id LEFT JOIN systems sy ON sy.id = ci.system_id LEFT JOIN agents ag ON ag.id = ci.agent_id WHERE checklist_id=?`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado;
}

module.exports = { 
                   //Agents
                   listAgents, 
                   listActiveAgents, 
                   attAgentName,
                   insertAgent,
                   desativateAgents,
                   inativateAgents,

                   //Checklist
                   listChecklistFromDate,
                   listChecklistItems,
                   updateChecklistSaveAt,
                   deleteChecklistItems,
                   insertChecklist,
                   insertChecklistItems,
                   listChecklists,
                   listChecklistsStatusCount,

                   //Systems
                   listActiveSystems,
                   listSystems,
                   updateSystemName,
                   insertSystem,
                   inativateAllSystems,
                   inativateSystems,

                   //Export
                   listChecklistsbyDate,
                   listItemsRes
                 };
