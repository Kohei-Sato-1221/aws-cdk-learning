import * as cdk from "aws-cdk-lib";
import { EcsAppSampleStack } from "../lib/stacks/ecsAppStack";
import { isValidEnvironment } from "../env";

const app = new cdk.App();
const environment = app.node.tryGetContext("environment") as string;
if (isValidEnvironment(environment)) {
  throw new Error("Context value [environment] is not valied");
}

const synthesizerProps = {
  fileAssetsBucketName: `aws-cdk-sample-sugar-ecs-state-${environment}`,
  qualifier: environment,
};

new EcsAppSampleStack(app, "EcsAppSampleStack", environment, {
  synthesizer: new cdk.CliCredentialsStackSynthesizer(synthesizerProps),
  env: { region: "ap-northeast-1" },
});
