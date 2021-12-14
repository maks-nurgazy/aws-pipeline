import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';
import { BillingStack } from '../lib/billing-stack';

test('Billing Stack', () => {
  const app = new App();
  const stack = new BillingStack(app, 'BillingStack', {
    budgetAmount: 1,
    emailAddress: 'test@example.com',
  });

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
