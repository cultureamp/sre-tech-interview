import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { ApplicationStack } from "../lib/stack";

test("stack matches snapshot", () => {
  const app = new cdk.App();
  const stack = new ApplicationStack(app, "Stack");
  expect(Template.fromStack(stack)).toMatchSnapshot();
});
