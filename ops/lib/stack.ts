import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const code = DockerImageCode.fromImageAsset(`${__dirname}/../..`);

    const lambda = new DockerImageFunction(this, "Lambda", {
      code,
    });
  }
}
