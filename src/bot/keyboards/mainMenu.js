const { Markup } = require('telegraf');


function mainMenu() {
return Markup.keyboard([
['📄 Submit Prescription', '📸 Upload Prescription Photo'],
['📚 My Prescriptions', '🔔 Set Reminder'],
['📝 Update Profile']
]).resize();
}


module.exports = mainMenu;