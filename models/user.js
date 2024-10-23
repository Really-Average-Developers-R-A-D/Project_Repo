const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async create(username, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [username, hashedPassword, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [hashedPassword, userId]);
    return result.rows[0];
  }
}

module.exports = User;