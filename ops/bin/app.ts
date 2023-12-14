#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpApi } from "aws-cdk-lib/aws-apigatewayv2";

const app = new cdk.App();
export const stack = new cdk.Stack(app, "comment-vibe");

const code = DockerImageCode.fromImageAsset(`${__dirname}/../..`);
const lambda = new DockerImageFunction(stack, "Lambda", {
  code,
});
const table = new Table(stack, "DynamoTable", {
  tableName: "comment-vibe",
  partitionKey: { name: "surveyId", type: AttributeType.STRING },
  sortKey: { name: "datetime", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
});
table.grantReadWriteData(lambda);
new HttpApi(stack, "HttpApi", {
  defaultIntegration: new HttpLambdaIntegration("HttpLambda", lambda),
});
