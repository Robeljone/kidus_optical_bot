const pool = require('./connection');

/**
 * tg_users
 */
async function createUser(userData) {
  const { telegram_id, full_name, phone, email } = userData;
  const [result] = await pool.execute(
    `INSERT INTO tg_users (telegram_id, full_name, phone, email)
     VALUES (?, ?, ?, ?)`,
    [telegram_id, full_name, phone || null, email || null]
  );
  return findUserByTelegramId(telegram_id);
}

async function findUserByTelegramId(telegramId) {
  const [rows] = await pool.execute(
    `SELECT * FROM tg_users WHERE telegram_id = ? LIMIT 1`,
    [telegramId]
  );
  return rows.length ? rows[0] : null;
}

async function updateUserProfile(telegramId,fullName, phone, email) {
  await pool.execute(
  `UPDATE tg_users 
   SET full_name = ?, phone = ?, email = ? 
   WHERE telegram_id = ?`,
  [fullName, phone, email, telegramId]
);
  return findUserByTelegramId(telegramId);
}

/**
 * Prescriptions
 */
async function createPrescription(userId, prescriptionDate, doctorName, lensType, pd, notes) {
  const [res] = await pool.execute(
    `INSERT INTO prescriptions (user_id, prescription_date, doctor_name, lens_type, pd, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [userId, prescriptionDate, doctorName, lensType, pd, notes]
  );
  return res.insertId;
}

async function createPrescriptionDetail(prescriptionId, eye, sph, cyl, axis, addPower) {
  await pool.execute(
    `INSERT INTO prescription_details (prescription_id, eye, sph, cyl, axis, add_power, created_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [prescriptionId, eye, sph, cyl, axis, addPower]
  );
}

async function addPrescriptionFile(prescriptionId, fileUrl, fileType, originalName) {
  const [res] = await pool.execute(
    `INSERT INTO prescription_files (prescription_id, file_url, file_type, original_name, uploaded_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [prescriptionId, fileUrl, fileType, originalName]
  );
  return res.insertId;
}

async function getUserPrescriptions(userId) {
  const [rows] = await pool.execute(
    `SELECT p.*,
      (SELECT GROUP_CONCAT(CONCAT(pd.eye,':',pd.sph,'/',pd.cyl,' AXIS',pd.axis) SEPARATOR '; ')
       FROM prescription_details AS pd WHERE pd.prescription_id = p.id) AS details
     FROM prescriptions p
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
}

async function getPrescriptionById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM prescriptions WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
}

async function getPrescriptionDetails(prescriptionId) {
  const [rows] = await pool.execute(
    `SELECT * FROM prescription_details WHERE prescription_id = ?`,
    [prescriptionId]
  );
  return rows;
}

module.exports = {
  createUser,
  findUserByTelegramId,
  updateUserProfile,
  createPrescription,
  createPrescriptionDetail,
  addPrescriptionFile,
  getUserPrescriptions,
  getPrescriptionById,
  getPrescriptionDetails
};
