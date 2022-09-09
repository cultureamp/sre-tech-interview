import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { stack } from "../bin/app";

test("stack matches snapshot", () => {
  expect(Template.fromStack(stack)).toMatchSnapshot();
});
