const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

exports.handler = async (event, context) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.query(`
      SELECT 
        sheet_name,
        COUNT(*) as total,
        SUM(CASE WHEN borrower_id IS NOT NULL THEN 1 ELSE 0 END) as borrowed
      FROM products
      GROUP BY sheet_name
      ORDER BY sheet_name
    `);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database connection failed' })
    };
  } finally {
    if (connection) await connection.end();
  }
};