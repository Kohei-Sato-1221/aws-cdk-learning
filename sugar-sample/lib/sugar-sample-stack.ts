import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";

export class SugarSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const inputBucket = new s3.Bucket(this, "SugarSampleInputBucket", {
      bucketName: "sugar-sample-input-bucket",
    });
    const outputBucket = new s3.Bucket(this, "SugarSampleOutputBucket", {
      bucketName: "sugar-sample-output-bucket",
    });
    const emailTopic = new Topic(this, "Topic", {
      topicName: "sugar-sample-topic",
    });
    const email = "night.god.moon.garsu@gmail.com";
    emailTopic.addSubscription(new EmailSubscription(email));

    const successTask = new tasks.SnsPublish(this, "SendSuccessMail", {
      topic: emailTopic,
      message: sfn.TaskInput.fromText("Hello, World!!! by StepFunctions!"),
    });

    const stateMachine = new sfn.StateMachine(this, "SugarStateMachine", {
      definition: successTask,
      timeout: cdk.Duration.minutes(30),
    });
  }
}
