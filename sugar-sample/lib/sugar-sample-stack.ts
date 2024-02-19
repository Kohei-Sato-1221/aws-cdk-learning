import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export class SugarSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const inputBucket = new s3.Bucket(this, "SugarSampleInputBucket", {
      bucketName: "sugar-sample-input-bucket",
    });
    const outputBucket = new s3.Bucket(this, "SugarSampleOutputBucket", {
      bucketName: "sugar-sample-output-bucket",
    });
  }
}
