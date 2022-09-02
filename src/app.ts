import * as express from "express";
import * as Sentiment from "sentiment";
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
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

  app.get("/report/:surveyId", async (req, res) => {
    const surveyId = req.params.surveyId;
    const command = new QueryCommand({
      TableName: "comment-vibe",
      KeyConditionExpression: "pk = :surveyId",
      ExpressionAttributeValues: {
        ":surveyId": {
          S: req.params.surveyId,
        },
      },
    });

    const response = await dynamodb.send(command);
    const items = response["Items"] ?? [];

    const records = items.map((item) => ({
      id: item.pk.S as string,
      datetime: item.sk.S as string,
      content: item.content.S as string,
      sentiment: item.sentiment.N as string,
    }));

    records.sort((a, b) => (a.datetime < b.datetime ? -1 : 1));

    let [positiveCount, negativeCount, neutralCount, totalSentiment] = [
      0, 0, 0, 0,
    ];
    for (const record of records) {
      const sentiment = Number.parseInt(record.sentiment);
      totalSentiment += sentiment;
      if (sentiment < -1) {
        negativeCount += 1;
      } else if (sentiment > 1) {
        positiveCount += 1;
      } else {
        neutralCount += 1;
      }
    }

    const averageSentiment = totalSentiment / records.length;

    res.json({
      action: "report",
      data: {
        surveyId,
        positiveCount,
        negativeCount,
        neutralCount,
        averageSentiment,
      },
    });
  });

  app.post("/add/:surveyId", async (req, res) => {
    const analysis = sentiment.analyze(req.body.content);

    const record = {
      id: req.params.surveyId,
      datetime: new Date().toISOString(),
      content: req.body.content,
      sentiment: analysis.score,
    };

    const command = new PutItemCommand({
      TableName: "comment-vibe",
      Item: {
        pk: { S: record.id },
        sk: { S: record.datetime },
        content: { S: record.content },
        sentiment: { N: record.sentiment.toString() },
      },
    });

    await dynamodb.send(command);

    res.json({
      action: "add",
      data: record,
    });
  });

  return app;
};

export const app = createApp();
