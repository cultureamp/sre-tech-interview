const express = require("express");
const aws = require("aws-sdk");

const dynamo = new aws.DynamoDB();
const app = express();

app.get("/", (req, res) => {
  res.json({ message: "OK!" });
});

app.get("/list", async (req, res) => {
  const response = await dynamo
    .scan({
      TableName: process.env["DYNAMODB_TABLE_NAME"],
    })
    .promise();

  res.json({
    action: "list",
    records: response["Items"].map((item) => ({
      id: item.id.S,
      datetime: item.datetime.S,
    })),
    count: response["Count"],
  });
});

app.get("/add/:id", async (req, res) => {
  const record = {
    id: req.params.id,
    datetime: new Date().toISOString(),
  };

  const response = await dynamo
    .putItem({
      TableName: process.env["DYNAMODB_TABLE_NAME"],
      Item: {
        id: { S: record.id },
        datetime: { S: record.datetime },
      },
    })
    .promise();

  res.json({
    action: "add",
    record: record,
  });
});

module.exports = app;
