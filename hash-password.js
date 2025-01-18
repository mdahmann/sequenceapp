const bcrypt = require('bcryptjs');

const password = 'test123'; // We'll use the same password for both users for simplicity
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Hashed password:', hash); 