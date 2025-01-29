import amqplib from 'amqplib';

const QUEUE_NAME = 'hello';

async function sendMessage() {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    const message = 'Hello, RabbitMQ!';
    channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });

    console.log(`📤 Sent: ${message}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
