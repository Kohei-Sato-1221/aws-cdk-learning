import {
  CfnOutput,
  Stack,
  StackProps,
  DefaultStackSynthesizer,
} from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { isValidEnvironment } from "../../env";

export class EcsAppSampleStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    environment: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    //TODO implement logic to prerpare AWS resources

    new CfnOutput(this, "Environment:", {
      value: environment,
    });
  }
}
