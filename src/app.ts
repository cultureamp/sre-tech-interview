import * as express from "express";
import * as Sentiment from "sentiment";
import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { createAWSOptions } from "./aws";

const options = createAWSOptions();
const dynamodb = new DynamoDBClient(options);

const sentiment = new Sentiment();

const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "OK!" });
  });

  app.get("/list", async (req, res) => {
    const command = new ScanCommand({
      TableName: "comment-vibe",
    });

    const response = await dynamodb.send(command);
    const items = response["Items"] ?? [];

    res.json({
      action: "list",
      records: items.map((item) => ({
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
      TableName: "comment-vibe",
      Item: {
        id: { N: record.id.toString() },
        datetime: { S: record.datetime },
        content: { S: record.content },
        sentiment: { N: record.sentiment.toString() },
      },
    });

    await dynamodb.send(command);

    res.json({
      action: "add",
      record: record,
    });
  });

  return app;
};

export const app = createApp();
