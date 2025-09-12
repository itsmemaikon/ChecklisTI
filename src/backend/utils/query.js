const { sql, getPool } = require("../db");

async function query(q, params = []) {
  const pool = await getPool();
  const ps = pool.request();

  params.forEach((p) => {
    if (p.type && sql[p.type]) {
      ps.input(p.name, sql[p.type], p.value);
    } else {
      ps.input(p.name, p.value);
    }
  });

  return ps.query(q);
}

module.exports = query;
