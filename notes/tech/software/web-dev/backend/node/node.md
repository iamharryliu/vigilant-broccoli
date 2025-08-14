# Node

## Notes

- tsconfig.json - Configuration for typescript compilation. If the files are not being compiled there's no need for a tsconfig file.

## Commands

```
npm i
npm i --yes
```

### General App Commands

```
npm run serve
npm run lint
npm run lint:css
npm run format
npm run test
```

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

## References

[Mock Server](https://medium.com/geekculture/setting-up-a-mock-backend-with-angular-13-applications-26a21788f7da)
