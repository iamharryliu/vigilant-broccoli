import amqplib from 'amqplib';

const QUEUE_NAME = 'hello';

async function receiveMessage() {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    // const connection = await amqplib.connect(
    //   'amqp://admin:admin@localhost:5672',
    // );
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log(`📥 Waiting for messages in ${QUEUE_NAME}...`);

    channel.consume(
      QUEUE_NAME,
      msg => {
        if (msg) {
          console.log(`✅ Received: ${msg.content.toString()}`);
          channel.ack(msg);
        }
      },
      { noAck: false },
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

receiveMessage();
