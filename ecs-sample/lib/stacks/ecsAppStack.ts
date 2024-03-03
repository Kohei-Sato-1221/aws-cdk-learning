import {
  CfnOutput,
  Stack,
  StackProps,
  DefaultStackSynthesizer,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { NewVPC, NewSubnet } from "../resources/vpc";

export class EcsAppSampleStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    environment: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const vpcCidr = "10.0.0.0/16";
    const subnetInfo = [
      { key: 0, cidr: "10.0.1.0/24", isPublic: true, az: "ap-northeast-1a" },
      { key: 1, cidr: "10.0.2.0/24", isPublic: true, az: "ap-northeast-1c" },
      { key: 0, cidr: "10.0.101.0/24", isPublic: false, az: "ap-northeast-1a" },
      { key: 1, cidr: "10.0.102.0/24", isPublic: false, az: "ap-northeast-1c" },
    ];

    const vpc = NewVPC(this, "EcsAppVPC", vpcCidr);

    const subnets = [];
    subnetInfo.forEach((i) => {
      const subnet = NewSubnet(
        this,
        i.az,
        vpc,
        i.cidr,
        `EcsApp${i.isPublic ? "Public" : "Private"}Subnet${i.key}`,
        i.isPublic
      );
      subnets.push(subnet);
    });

    new CfnOutput(this, "Environment:", {
      value: environment,
    });
  }
}
