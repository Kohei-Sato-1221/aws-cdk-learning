import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Topic } from "aws-cdk-lib/aws-sns";
import { EmailSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as cloudtrail from "aws-cdk-lib/aws-cloudtrail";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";

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

    const logBucket = new s3.Bucket(this, "SugarSampleLogBucket", {
      bucketName: "sugar-sample-log-bucket",
    });

    const trail = new cloudtrail.Trail(this, "SugarSampleTrail", {
      bucket: logBucket,
      isMultiRegionTrail: false,
    });
    trail.addS3EventSelector(
      [
        {
          bucket: inputBucket,
        },
      ],
      {
        readWriteType: cloudtrail.ReadWriteType.WRITE_ONLY,
      }
    );

    // Lambda function to analyze sentiment
    const detectionFunc = new NodejsFunction(this, "DetectionFunction", {
      functionName: "sugar-detect-sentiment",
      entry: "../functions/detect-sentiment/index.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      bundling: {
        forceDockerBundling: false,
      },
      environment: {
        DEST_BUCKET: outputBucket.bucketName,
      },
    });

    // Lambda function to delete input files
    const deletionFunc = new NodejsFunction(this, "DeleteFunction", {
      functionName: "sugar-delete-sentiment",
      entry: "../functions/delete-object/index.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      bundling: {
        forceDockerBundling: false,
      },
    });

    // 感情分析
    inputBucket.grantReadWrite(detectionFunc);
    outputBucket.grantReadWrite(deletionFunc);
    const ipPolicy = new iam.PolicyStatement({
      resources: ["*"],
      actions: [
        "comprehend:BatchDetectSentiment",
        "s3:GetObject",
        "s3:PutObject",
      ],
    });
    const opPolicy = new iam.PolicyStatement({
      resources: ["*"],
      actions: ["s3:*"],
    });
    detectionFunc.addToRolePolicy(ipPolicy);
    detectionFunc.addToRolePolicy(opPolicy);

    // ファイル削除
    inputBucket.grantDelete(deletionFunc);

    // Tasks
    const successTask = new tasks.SnsPublish(this, "SendSuccessMail", {
      topic: emailTopic,
      message: sfn.TaskInput.fromText(sfn.JsonPath.stringAt("$.*")),
    });
    const sentimentTask = new tasks.LambdaInvoke(this, "DetectSentiment", {
      lambdaFunction: detectionFunc,
      payload: sfn.TaskInput.fromObject({
        srcBucket: sfn.JsonPath.stringAt(
          "$.detail.requestParameters.bucketName"
        ),
        objectKey: sfn.JsonPath.stringAt("$.detail.requestParameters.key"),
      }),
    });
    const deleteTask = new tasks.LambdaInvoke(this, "DeleteObject", {
      lambdaFunction: deletionFunc,
      payload: sfn.TaskInput.fromObject({
        srcBucket: sfn.JsonPath.stringAt("$.Payload.srcBucket"),
        objectKey: sfn.JsonPath.stringAt("$.Payload.objectKey"),
        destBucket: outputBucket.bucketName,
      }),
    });
    const errorTask = new tasks.SnsPublish(this, "SendErrorMail", {
      topic: emailTopic,
      subject: `Error`,
      message: sfn.TaskInput.fromText("StepFunctions Error!"),
    });

    const mainFlow = sentimentTask.next(deleteTask).next(successTask);
    const parallel = new sfn.Parallel(this, "Parallel");
    parallel.branch(mainFlow);
    parallel.addCatch(errorTask, { resultPath: "$.error" });

    const stateMachine = new sfn.StateMachine(this, "SugarStateMachine", {
      definition: parallel,
      timeout: cdk.Duration.minutes(30),
    });

    const target = new targets.SfnStateMachine(stateMachine);
    const rule = new events.Rule(this, "EventRule", {
      eventPattern: {
        source: ["aws.s3"],
        detailType: ["AWS API Call via CloudTrail"],
        detail: {
          eventSource: ["s3.amazonaws.com"],
          eventName: ["PutObject"],
          requestParameters: {
            bucketName: [inputBucket.bucketName],
          },
        },
      },
    });
    rule.addTarget(target);
  }
}
