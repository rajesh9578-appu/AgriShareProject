require('dotenv').config();
const nodemailer = require('nodemailer');

const to = process.argv[2];
if (!to) { console.log('Usage: node scripts/testMail.js <email>'); process.exit(1); }

const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
const t = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port,
  secure: port === 465,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

t.sendMail({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to,
  subject: 'AgriShare test mail',
  text: 'If you can read this, mail delivery works.'
}).then((info) => {
  console.log('accepted:', info.accepted);
  console.log('rejected:', info.rejected);
  console.log('response:', info.response);
}).catch((e) => console.log('FAILED:', e.code, e.message));