const queries = require('../../db/queries');


async function profileHandler(ctx) 
{
ctx.session = ctx.session || {};
const expecting = ctx.session.expecting;

if (expecting === 'name') 
{
ctx.session.fullName = ctx.message.text;
ctx.session.expecting = 'phone';
await ctx.reply('Thanks. Now send your phone number.');
return;
}

if (expecting === 'email') 
{
const email = ctx.message.text === 'skip' ? null : ctx.message.text;
ctx.session.email = email;

// create user
const telegramId = ctx.from.id;
const id = await queries.createUser(telegramId, ctx.session.fullName, ctx.session.phone, ctx.session.email);
ctx.session.expecting = null;

await ctx.reply(`Registered ✅. Your user id: ${id}`);
await ctx.reply('You can now submit prescriptions or upload prescription photos.');
return;
}

if (ctx.message.text === '/update_profile') 
{
const user = await queries.findUserByTelegramId(ctx.from.id);
if (!user) return ctx.reply('You are not registered. Use /start to register.');
ctx.session.expecting = 'update_name';
return ctx.reply('Send new full name or type `skip`.');
}


if (expecting === 'update_name') 
{
const name = ctx.message.text === 'skip' ? undefined : ctx.message.text;
if (name) ctx.session.fullName = name;
ctx.session.expecting = 'update_phone';
return ctx.reply('Send new phone or `skip`.');
}

if (expecting === 'update_phone') 
{
const phone = ctx.message.text === 'skip' ? undefined : ctx.message.text;
if (phone) ctx.session.phone = phone;
ctx.session.expecting = 'update_email';
return ctx.reply('Send new email or `skip`.');
}


if (expecting === 'update_email') {
const email = ctx.message.text === 'skip' ? undefined : ctx.message.text;
const user = await queries.findUserByTelegramId(ctx.from.id);
const fullName = ctx.session.fullName || user.full_name;
const phone = ctx.session.phone || user.phone;
await queries.updateUserProfile(user.telegram_id, fullName, phone, email);
ctx.session.expecting = null;
await ctx.reply('Profile updated.');
return;
}
}
module.exports = profileHandler;