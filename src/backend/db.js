const mysql = require('mysql2/promise');

async function conectarBD() {
    if (global.conexao && global.conexao.state !== 'disconnected') {
        return global.conexao;
    }

    const conexao = await mysql.createConnection({
        host: process.env.DB_SERVER,
        port: process.env.DB_PORT,
        user: 'root',
        password: '',
        database: 'ChecklisTI'
    });

    global.conexao = conexao;

    return global.conexao;
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

//needs a little look to that query
async function inativateAgents(ids) {
  const conexao = await conectarBD();
  const sql = `UPDATE agents SET is_active = 0 WHERE id NOT IN (${ids.join(",")}) AND is_active = 1`;
  const [resultado] = await conexao.query(sql); 
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

async function updateSystemName(system) {
    const conexao = await conectarBD();
    const sql = `UPDATE systems SET name=?, is_active=1 WHERE id=?`;
    const [resultado] = await conexao.query(sql, system.rawName, system.id);
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

//needs a little look to that query
async function inativateSystems(ids) {
  const conexao = await conectarBD();
  const sql = `UPDATE systems SET is_active = 0 WHERE id NOT IN (${ids.join(",")}) AND is_active = 1`;
  const [resultado] = await conexao.query(sql); 
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
                   inativateSystems
                 };
