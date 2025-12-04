const axios = require('axios');
const fs = require('fs');
const path = require('path');


async function downloadToLocal(url, destPath) {
const writer = fs.createWriteStream(destPath);
const res = await axios({ url, method: 'GET', responseType: 'stream' });
res.data.pipe(writer);
return new Promise((resolve, reject) => {
writer.on('finish', () => resolve(destPath));
writer.on('error', reject);
});
}


module.exports = { downloadToLocal };