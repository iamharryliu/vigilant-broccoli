const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net/`;
const client = new MongoClient(uri);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_EMAIL_PASSWORD,
  },
});

async function sendNewsletter() {
  emails = await getEmails();
  sendEmails(emails);
}
sendNewsletter().catch(console.dir);

async function getEmails() {
  try {
    const database = client.db(process.env.MONGO_DB_NAME);
    const emailSubscriptionsCollection =
      database.collection('emailsubscriptions');

    const emailSubscriptions = await emailSubscriptionsCollection
      .find({})
      .toArray();

    emails = emailSubscriptions.map(subscription => subscription.email);
    return emails;
  } finally {
    await client.close();
  }
}

function sendEmails(emails) {
  for (let email of emails) {
    sendEmail(email);
  }
}

function sendEmail(email) {
  const subject = 'subject';
  const message = 'message';
  const mailOptions = {
    from: process.env.MY_EMAIL,
    to: email,
    subject: subject,
    text: message,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
