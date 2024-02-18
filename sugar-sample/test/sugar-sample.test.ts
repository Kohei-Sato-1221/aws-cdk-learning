import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as SugarSample from "../lib/sugar-sample-stack";

test("SQS Queue and SNS Topic Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SugarSample.SugarSampleStack(app, "MyTestStack");
  // THEN

  console.log(Match);

  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
  });
  template.resourceCountIs("AWS::SNS::Topic", 1);
});
