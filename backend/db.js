const { execSync } = require('child_process');

/**
 * Sanitizes a value for use in a SQL query.
 * @param {any} val - The value to sanitize.
 * @returns {string|number} - The sanitized value.
 */
function sanitize(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return "'" + val.replace(/'/g, "''") + "'";
  }
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
}

/**
 * Executes a SQL statement using the team-db CLI tool.
 * @param {string} sql - The SQL statement to execute.
 * @returns {any} - The parsed JSON result from team-db.
 */
function query(sql) {
  try {
    // Escape double quotes for the shell command
    const escapedSql = sql.replace(/"/g, '\\"');
    const command = `team-db "${escapedSql}"`;
    const output = execSync(command, { encoding: 'utf8' });
    return JSON.parse(output);
  } catch (error) {
    console.error(`Error executing SQL: ${sql}`);
    console.error(error.message);
    throw error;
  }
}

module.exports = { query, sanitize };
