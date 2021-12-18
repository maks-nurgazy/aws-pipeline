import {
  arrayWith,
  expect as expectCDK,
  haveResourceLike,
  objectLike,
  SynthUtils,
} from '@aws-cdk/assert';
import { App, Construct } from '@aws-cdk/core';
import { BillingStack } from '../lib/billing-stack';
import { PipelineStack } from '../lib/pipeline-stack';
import { ServiceStack } from '../lib/service-stack';

test('Pipeline Stack', () => {
  const app = new App();
  const stack = new PipelineStack(app, 'PipelineStack');

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('Adding service stage', () => {
  const app = new App();
  const serviceStack = new ServiceStack(app, 'ServiceStack');
  const pipelineStack = new PipelineStack(app, 'PipelineStack');

  pipelineStack.addServiceStage(serviceStack, 'Test');

  expectCDK(pipelineStack).to(
    haveResourceLike('AWS::CodePipeline::Pipeline', {
      Stages: arrayWith(
        objectLike({
          Name: 'Test',
        })
      ),
    })
  );
});

test('Adding billing stack to a stage', () => {
  const app = new App();
  const serviceStack = new ServiceStack(app, 'ServiceStack');
  const pipelineStack = new PipelineStack(app, 'PipelineStack');
  const billingStack = new BillingStack(app, 'BillingStack', {
    budgetAmount: 5,
    emailAddress: 'test@example.com',
  });

  const testStage = pipelineStack.addServiceStage(serviceStack, 'Test');

  pipelineStack.addBillingStackToStage(billingStack, testStage);

  expectCDK(pipelineStack).to(
    haveResourceLike('AWS::CodePipeline::Pipeline', {
      Stages: arrayWith(
        objectLike({
          Actions: arrayWith(objectLike({
            Name: 'Billing_Update'
          }))
        })
      ),
    })
  );
});
