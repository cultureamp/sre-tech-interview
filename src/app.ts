import * as express from "express";
import type { ErrorRequestHandler } from "express";
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
    res.json({ message: "ok" });
  });

  app.post("/comment/:surveyId", async (req, res, next) => {
    try {
      const analysis = sentiment.analyze(req.body.content);

      console.log(analysis);

      const record = {
        surveyId: req.params.surveyId,
        datetime: new Date().toISOString(),
        content: req.body.content,
        sentiment: analysis.score,
      };

      const command = new PutItemCommand({
        TableName: "comment-vibe",
        Item: {
          surveyId: { S: record.surveyId },
          datetime: { S: record.datetime },
          content: { S: record.content },
          sentiment: { N: record.sentiment.toString() },
        },
      });

      await dynamodb.send(command);

      res.json({
        action: "add",
        data: record,
      });
    } catch (err) {
      next(err); // pass any async errors that occur to Express error handling
    }
  });

  app.get("/report/:surveyId", async (req, res, next) => {
    try {
      const surveyId = req.params.surveyId;
      const command = new QueryCommand({
        TableName: "comment-vibe",
        KeyConditionExpression: "surveyId = :surveyId",
        ExpressionAttributeValues: {
          ":surveyId": {
            S: req.params.surveyId,
          },
        },
      });

      const response = await dynamodb.send(command);
      const items = response["Items"] ?? [];

      const records = items.map((item) => ({
        surveyId: item.surveyId.S as string,
        datetime: item.datetime.S as string,
        content: item.content.S as string,
        sentiment: item.sentiment.N as string,
      }));

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
    } catch (err) {
      next(err); // pass any async errors that occur to Express error handling
    }
  });

  // Generic 404 JSON handler
  app.use((req, res) => {
    res.status(404).json({
      message: "not found",
    });
  });

  // Generic error handler, ensure client receives a JSON error response
  app.use(((err, req, res, next) => {
    const error = err as Error;
    console.error(error);
    res.status(500).json({
      message: "error",
      error: {
        name: error.name,
        message: error.message,
      },
    });
  }) as ErrorRequestHandler);

  return app;
};

export const app = createApp();
