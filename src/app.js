const express = require("express");
const Sentiment = require("sentiment");
const {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { createAWSOptions } = require("./aws");

const options = createAWSOptions();
const dynamodb = new DynamoDBClient(options);

const sentiment = new Sentiment();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "OK!" });
});

app.get("/list", async (req, res) => {
  const command = new ScanCommand({
    TableName: process.env["DYNAMODB_TABLE_NAME"],
  });

  const response = await dynamodb.send(command);

  res.json({
    action: "list",
    records: response["Items"].map((item) => ({
      id: item.id.S,
      content: item.content.S,
      datetime: item.datetime.S,
      sentiment: item.sentiment.N,
    })),
    count: response["Count"],
  });
});

app.post("/add", async (req, res) => {
  const analysis = sentiment.analyze(req.body.content);

  const record = {
    id: Date.now(),
    datetime: new Date().toISOString(),
    content: req.body.content,
    sentiment: analysis.score,
  };

  const command = new PutItemCommand({
    TableName: process.env["DYNAMODB_TABLE_NAME"],
    Item: {
      id: { N: record.id },
      datetime: { S: record.datetime },
      content: { S: record.content },
      sentiment: { N: record.sentiment },
    },
  });

  await dynamodb.send(command);

  res.json({
    action: "add",
    record: record,
  });
});

module.exports = app;
