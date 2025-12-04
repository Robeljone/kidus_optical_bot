// src/bot/handlers/prescription.handler.js
const { Markup } = require('telegraf');
const db = require('../../db/queries');

async function prescriptionHandler(ctx) {
  
  const userId = ctx.from.id;
  

   
  // Initialize session if not present
  if (!ctx.session.prescription) ctx.session.prescription = {};

  // Step 1: ask prescription date
  if (!ctx.session.prescription.step) 
  {
    ctx.session.prescription.step = 1;
    return ctx.reply('Please enter the prescription date (YYYY-MM-DD):');
  }

  // Step 2: save date
  if (ctx.session.prescription.step === 1) 
  {
    ctx.session.prescription.prescriptionDate = ctx.message.text;
    ctx.session.prescription.step = 2;
    return ctx.reply('Enter doctor name:');
  }

  // Step 3: save doctor name
  if (ctx.session.prescription.step === 2) {
    ctx.session.prescription.doctorName = ctx.message.text;
    ctx.session.prescription.step = 3;
    return ctx.reply('Enter lens type (e.g., Single Vision, Bifocal):');
  }

  // Step 4: save lens type
  if (ctx.session.prescription.step === 3) {
    ctx.session.prescription.lensType = ctx.message.text;
    ctx.session.prescription.step = 4;
    return ctx.reply('Enter PD (Pupillary Distance) in mm:');
  }

  // Step 5: save PD
  if (ctx.session.prescription.step === 4) {
    ctx.session.prescription.pd = ctx.message.text;
    ctx.session.prescription.step = 5;
    return ctx.reply('Any notes for this prescription? (or type "none")');
  }

  // Step 6: save notes & finish
  if (ctx.session.prescription.step === 5) 
  {
    ctx.session.prescription.notes = ctx.message.text === 'none' ? '' : ctx.message.text;

    try {
      // Ensure user exists
      let user = await db.findUserByTelegramId(userId);
      if (!user) user = await db.createUser({ telegram_id: userId, full_name: ctx.from.first_name });

      // Save prescription
      const presc = ctx.session.prescription;
      const prescId = await db.createPrescription(
        user.id,
        presc.prescriptionDate,
        presc.doctorName,
        presc.lensType,
        presc.pd,
        presc.notes
      );

      ctx.session.prescription.step = 6;
      ctx.session.prescription.id = prescId;

      return ctx.reply(
        'Prescription saved! Now you can upload images or PDF files of the prescription. Use the file upload feature.'
      );
      delete ctx.session.prescription;
    } catch (err) {
      console.error('Prescription save error:', err);
      return ctx.reply('Failed to save prescription. Please try again later.');
    }
  }

}

module.exports = prescriptionHandler;
