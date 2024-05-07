# nodemailer

```
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'email@gmail.com',
    pass: 'password'
  }
});

// Send an email with custom 'to' field including name and email address
transporter.sendMail({
  from: 'Nickame <from_email@email.com>',
  to: '"Recipient_Name" <recipient@email.com>, "Another_Recipient" <another_recipient@email.com>',
  subject: 'subject',
  text: 'body'
});
```
