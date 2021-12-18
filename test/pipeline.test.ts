import {
  arrayWith,
  expect as expectCDK,
  haveResourceLike,
  objectLike,
  SynthUtils,
} from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
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
