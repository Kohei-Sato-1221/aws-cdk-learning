#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SugarSampleStack } from '../lib/sugar-sample-stack';

const app = new cdk.App();
new SugarSampleStack(app, 'SugarSampleStack');
