// src/bot/handlers/upload.handler.js
const db = require('../../db/queries');
const fs = require('fs');
const path = require('path');

async function uploadHandler(ctx) {
  const userId = ctx.from.id;

  if (!ctx.session.prescription || !ctx.session.prescription.id) 
  {
    return ctx.reply('Please start a prescription first using /prescription.');
  }

  const prescId = ctx.session.prescription.id;
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  let fileId, fileName, fileType;

  // Handle photo
  if (ctx.message.photo) {
    const photo = ctx.message.photo.pop(); // highest quality
    fileId = photo.file_id;
    fileName = `${Date.now()}_${fileId}.jpg`;
    fileType = 'image';
  }

  // Handle document (PDF)
  if (ctx.message.document) {
    fileId = ctx.message.document.file_id;
    fileName = `${Date.now()}_${ctx.message.document.file_name}`;
    fileType = 'document';
  }

  if (!fileId) return ctx.reply('No file detected. Please send a photo or PDF.');

  // Download file
  const filePath = path.join(uploadsDir, fileName);
  const fileLink = await ctx.telegram.getFileLink(fileId);
  const response = await fetch(fileLink.href);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  // Save file info in DB
  await db.addPrescriptionFile(prescId, `/uploads/${fileName}`, fileType, fileName);

  ctx.reply('File uploaded and saved successfully and message sent for owner !');
  ctx.session = {};
}

module.exports = uploadHandler;
