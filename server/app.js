const express = require("express");
const http = require("http");
const morgan = require("morgan");
const AWS = require("aws-sdk");
const { Consumer } = require("sqs-consumer");
const cors = require("cors");
const app = express();
const port = 4000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(morgan("tiny"));
app.use(cors());

// Configure the AWS instance
AWS.config.update({
  region: "us-east-2",
  accessKeyId: process.env.TEST_aws_access_key_id,
  secretAccessKey: process.env.TEST_aws_secret_access_key,
});

// Create an SQS service object
const sqs = new AWS.SQS({});
const sendMessageUrl = process.env.TEST_LAMBDA_SQS_URL_SEND_MESSAGE;
const pollMessageUrl = process.env.TEST_LAMBDA_SQS_URL_POLL_MESSAGE;

// route for sending messages
app.post("/sqs/send-message", (req, res) => {
  const { nDecimals = 2, nChunks = 2, useMultiProcessing = false } = req.body;

  let sqsMessageData = {
    MessageAttributes: {
      n_decimals: {
        DataType: "Number",
        StringValue: nDecimals.toString(),
      },
      n_chunks: {
        DataType: "Number",
        StringValue: nChunks.toString(),
      },
      use_multi_processing: {
        DataType: "String",
        StringValue: useMultiProcessing ? "True" : "False",
      },
    },
    MessageBody: `Processing pi with n_decimals ${nDecimals} and n_chunks ${nChunks}`,
    QueueUrl: sendMessageUrl,
  };

  // Send the order data to the SQS queue
  let sendSqsMessage = sqs.sendMessage(sqsMessageData).promise();

  sendSqsMessage
    .then((data) => {
      console.log({ data });
      res.send({ text: "Success!" });
    })
    .catch((err) => {
      console.log(`ERROR: ${err}`);
      res.send({ text: "We ran into an error. Please try again." });
    });
});

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origins: ["*"],
    methods: ["GET", "POST"],
  },
});

// create consumer for polling
const messageConsumer = Consumer.create({
  queueUrl: pollMessageUrl,
  // visibilityTimeout: 180,
  // heartbeatInterval: 90,
  // setting handle message timeout to 5 minutes, send message to back of queue
  // handleMessageTimeout: 5 * (60 * 1000),
  handleMessage: async (message) => {
    return message;
  },
});

messageConsumer.start();

io.on("connection", (socket) => {
  console.log(`client connected: ${socket.id}`);

  messageConsumer.on("message_processed", (res) => {
    console.log("msg processed");
    console.log(res);
    socket.emit("messageProcessed", res);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    socket.removeAllListeners();
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
