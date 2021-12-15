import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';

test('Pipeline Stack', () => {
  const app = new App();
  const stack = new PipelineStack(app, 'PipelineStack');

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
