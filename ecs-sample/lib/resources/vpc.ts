import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export const NewVPC = (scope: Construct, vpcName: string, cidr: string) => {
  return new ec2.Vpc(scope, vpcName, {
    ipAddresses: ec2.IpAddresses.cidr(cidr),
    vpcName: vpcName,
    natGateways: 0,
    subnetConfiguration: [],
  });
};

export const NewSubnet = (
  scope: Construct,
  availabilityZone: string,
  vpc: ec2.IVpc,
  cidr: string,
  subnetName: string,
  isPublic: boolean
) => {
  return new ec2.Subnet(scope, subnetName, {
    vpcId: vpc.vpcId,
    availabilityZone: availabilityZone,
    cidrBlock: cidr,
    mapPublicIpOnLaunch: isPublic,
  });
};
