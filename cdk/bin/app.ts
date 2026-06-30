#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SmartCVStack } from '../lib/smartcv-stack';

const app = new cdk.App();

new SmartCVStack(app, 'SmartCVStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'ap-southeast-1',
  },
  tags: {
    project: 'smartcv',
    owner: 'SmartCV',
  },
});
