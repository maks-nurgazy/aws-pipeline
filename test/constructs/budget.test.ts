import { App, Stack } from '@aws-cdk/core';
import {
  expect as expectCDK,
  haveResource,
  haveResourceLike,
} from '@aws-cdk/assert';
import { Budget } from '../../lib/constructs/budget';

test('Budget construct', () => {
  const app = new App();
  const stack = new Stack(app, 'Stack');

  new Budget(stack, 'Budget', {
    budgetAmount: 1,
    emailAddress: 'test@example.com',
  });

  expectCDK(stack).to(
    haveResourceLike('AWS::Budgets::Budget', {
      Budget: {
        BudgetLimit: {
          Amount: 1,
          Unit: 'USD',
        },
        BudgetName: 'Monthly Budget',
        BudgetType: 'COST',
        TimeUnit: 'MONTHLY',
      },
      NotificationsWithSubscribers: [
        {
          Notification: {
            ComparisonOperator: 'GREATER_THAN',
            NotificationType: 'ACTUAL',
            Threshold: 100,
            ThresholdType: 'PERCENTAGE',
          },
          Subscribers: [
            {
              Address: 'test@example.com',
              SubscriptionType: 'EMAIL',
            },
          ],
        },
      ],
    })
  );
});
