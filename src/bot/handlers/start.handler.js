const queries = require('../../db/queries');


async function startHandler(ctx) {
const telegramId = ctx.from.id;
const existing = await queries.findUserByTelegramId(telegramId);
if (existing) {
await ctx.reply(`Welcome back, ${existing.full_name || ctx.from.first_name}!`);
await ctx.reply('Choose an action from the menu.');
} else {
await ctx.reply('Welcome! Please send your full name to register.');
ctx.session = ctx.session || {};
ctx.session.expecting = 'name';
}
}


module.exports = startHandler;