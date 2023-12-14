import express, { Application, ErrorRequestHandler, Request, Response } from "express";
import Sentiment from "sentiment";
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
  const app: Application = express();

  app.use(express.json());

  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "ok" });
  });

  app.post("/comment/:surveyId", async (req: Request, res: Response, next) => {
    try {
      const analysis = sentiment.analyze(req.body.content);

      console.log(analysis);

      const comment = {
        surveyId: req.params.surveyId,
        datetime: new Date().toISOString(),
        content: req.body.content,
        sentiment: analysis.score,
      };

      // DynamoDB has a specific schema for representing attributes
      const dynamoItem = {
        surveyId: { S: comment.surveyId },
        datetime: { S: comment.datetime },
        content: { S: comment.content },
        sentiment: { N: comment.sentiment.toString() },
      };

      const command = new PutItemCommand({
        TableName: "comment-vibe",
        Item: dynamoItem,
      });

      await dynamodb.send(command);

      res.json({
        action: "add",
        data: comment,
      });
    } catch (err) {
      next(err); // pass any async errors that occur to Express error handling
    }
  });

  app.get("/report/:surveyId", async (req: Request, res: Response, next) => {
    try {
      const surveyId = req.params.surveyId;

      // Construct query for DynamoDB that finds all comments
      // where the primary key matches the surveyId path parameter
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

      const comments = items.map((item) => ({
        surveyId: item.surveyId.S as string,
        datetime: item.datetime.S as string,
        content: item.content.S as string,
        sentiment: item.sentiment.N as string,
      }));

      let [positiveCount, negativeCount, neutralCount, totalSentiment] = [
        0, 0, 0, 0,
      ];
      for (const comment of comments) {
        const sentiment = Number.parseInt(comment.sentiment);
        totalSentiment += sentiment;
        if (sentiment < -1) {
          negativeCount += 1;
        } else if (sentiment > 1) {
          positiveCount += 1;
        } else {
          neutralCount += 1;
        }
      }

      const averageSentiment = totalSentiment / comments.length;

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
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      message: "not found",
    });
  });

  // Generic error handler, ensure client receives a JSON error response
  app.use(((err, req: Request, res: Response, next) => {
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
