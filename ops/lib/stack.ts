import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const code = DockerImageCode.fromImageAsset(`${__dirname}/../..`);

    const lambda = new DockerImageFunction(this, "Lambda", {
      code,
    });

    const table = new Table(this, "DynamoTable", {
      tableName: "comment-vibe",
      partitionKey: { name: "surveyId", type: AttributeType.STRING },
      sortKey: { name: "datetime", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.grantReadWriteData(lambda);

    new HttpApi(this, "HttpApi", {
      defaultIntegration: new HttpLambdaIntegration("HttpLambda", lambda),
    });
  }
}
