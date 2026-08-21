const db = require("./db");

class Task {
  static async create(userId, threadId, description) {
    const result = await db.query(
      `INSERT INTO tasks (user_id, thread_id, task_description, status) 
             VALUES ($1, $2, $3, 'pending') 
             RETURNING *`,
      [userId, threadId, description],
    );
    return result.rows[0];
  }

  static async updateStatus(threadId, status, resultText = null) {
    const result = await db.query(
      `UPDATE tasks 
             SET status = $1, result = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE thread_id = $3 
             RETURNING *`,
      [status, resultText, threadId],
    );
    return result.rows[0];
  }

  static async findAllByUser(userId) {
    const result = await db.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }
}

module.exports = Task;
