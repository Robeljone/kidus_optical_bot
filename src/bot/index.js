// src/bot/index.js
const { Telegraf, session } = require('telegraf');
require('dotenv').config();

const startHandler = require('./handlers/start.handler');
const profileHandler = require('./handlers/profile.handler');
const prescriptionHandler = require('./handlers/prescription.handler');
const uploadHandler = require('./handlers/upload.handler');
const records = require('./handlers/record.handler')
const { message } = require('telegraf/filters');

const BOT_TOKEN = '8114621947:AAH24r_XH42bcFvoKaY-V_cSy4lu3pXu1Co';
if (!BOT_TOKEN) {
  console.error('ERROR: BOT_TOKEN not set in .env');
  process.exit(1);
}
const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
bot.start(async (ctx) => {
  try {
    ctx.session = {};
    await startHandler(ctx);
    bot.telegram.setMyCommands([
      { command: 'submit_prescription', description: 'Submit a new prescription' },
      { command: 'upload_photo', description: 'Upload a prescription photo' },
      { command: 'my_prescriptions', description: 'View your saved prescriptions' },
      { command: 'set_reminder', description: 'Set a medication reminder' },
      { command: 'update_profile', description: 'Update your profile' },
      { command: 'cancel', description: 'Cancel current session' },
      { command: 'start', description: 'Restart bot' },
    ]);
  } catch (err) {
    console.error('start handler error', err);
    await ctx.reply('An error occurred. Please try again later.');
  }
});

bot.command('submit_prescription', async (ctx) => {
  await profileHandler(ctx);
  await prescriptionHandler(ctx);
});

bot.command('upload_photo', async (ctx) => {
  await profileHandler(ctx);
  await uploadHandler(ctx);
});

bot.command('my_prescriptions', async (ctx) => {
  const response = await records(ctx);
  for (const p of response) {
    await ctx.replyWithMarkdown(formatPrescription(p));
  }
});

bot.command('set_reminder', async (ctx) => {
  ctx.reply("set_reminder here !")
});

bot.command('update_profile', async (ctx) => {
  await profileHandler(ctx);
});

bot.command('upload_photo', async (ctx) => {
  await uploadHandler(ctx);
});

bot.on(message('text'), async (ctx) => {
  try {
    if (ctx.session.expecting) {
      await profileHandler(ctx);
    }
    else {
      await prescriptionHandler(ctx);
    }
  } catch (error) {
    console.log(error)
  }
})

// Handle file uploads (document or photo)
bot.on(['document', 'photo'], async (ctx) => {
  try { await uploadHandler(ctx); } catch (err) { console.error('upload error', err); ctx.reply('Upload failed.'); }
});

function formatPrescription(p) {
  const date = isNaN(new Date(p.prescription_date))
    ? 'Not provided'
    : new Date(p.prescription_date).toLocaleDateString();

  const created = new Date(p.created_at).toLocaleString();

  return `
🆔 *Prescription #${p.id}*
👨‍⚕️ *Doctor:* ${p.doctor_name}
📅 *Date:* ${date}
👓 *Lens Type:* ${p.lens_type}
📏 *PD:* ${p.pd}
📝 *Notes:* ${p.notes || 'None'}
📝 *Message:* ${p.content || 'None'}
⏱ *Created:* ${created}
  `.trim();
}


// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Launch bot
bot.launch()
  .then(() => console.log('✅ Bot started'))
  .catch(err => {
    console.error('Bot launch failed', err);
    process.exit(1);
  });
