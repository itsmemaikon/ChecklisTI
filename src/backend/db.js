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
    const [resultado] = await conexao.query(sql, [id, name]);
    return resultado;
}

async function insertAgent(usuario) {
    const conexao = await conectarBD();
    const sql = `INSERT INTO agents (name, is_active) VALUES (?, 1)`;
    const [resultado] = await conexao.query(sql, [usuario.nome]);
    return resultado;  // retorna o id do registro inserido
}

async function desativateAgents() {
    const conexao = await conectarBD();
    const sql = `UPDATE agents SET is_active = 0 WHERE is_active = 1`;
    const [resultado] = await conexao.query(sql);
    return resultado;
}

async function inativateAgents(idsInPayload) {
    if (!Array.isArray(idsInPayload) || idsInPayload.length === 0) {
        return { affectedRows: 0 };
    }

    const conexao = await conectarBD();
    const placeholders = idsInPayload.map(() => "?").join(","); // ?,?,?
    const sql = `UPDATE agents SET is_active = 0 WHERE id NOT IN (${placeholders}) AND is_active = 1`;
    const [resultado] = await conexao.query(sql, idsInPayload);
    return resultado;
}


module.exports = { listAgents,listActiveAgents, attAgentName, insertAgent, desativateAgents, inativateAgents };
