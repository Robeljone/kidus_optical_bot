const db = require('../../db/queries');

async function recordHandler(ctx) 
{
const user_id = ctx.message.from.id;
let user = await db.findUserByTelegramId(user_id);
const respo = await db.getUserPrescriptions(user.id);
await ctx.reply('Prescription List !');
return respo
}

module.exports = recordHandler;