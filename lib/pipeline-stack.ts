import { SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { Construct } from 'constructs';
import { Artifact, Pipeline } from '@aws-cdk/aws-codepipeline';
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
} from '@aws-cdk/aws-codepipeline-actions';
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from '@aws-cdk/aws-codebuild';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, 'Pipeline', {
      pipelineName: 'Pipeline',
      crossAccountKeys: false,
    });

    const sourceOutput = new Artifact('SourceOutput');

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          owner: 'maks-nurgazy',
          repo: 'aws-pipeline',
          branch: 'master',
          actionName: 'Pipeline_Source',
          oauthToken: SecretValue.secretsManager('github-token'),
          output: sourceOutput,
        }),
      ],
    });

    const cdkBuildOutput = new Artifact('CdkBuildOutput');

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new CodeBuildAction({
          actionName: 'CDK_Build',
          input: sourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, 'CdkBuildProject', {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              'build-specs/cdk-build-spec.yml'
            ),
          }),
        }),
      ],
    });

    pipeline.addStage({
      stageName: 'Pipeline_Update',
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: 'Pipeline_Update',
          stackName: 'PipelineStack',
          templatePath: cdkBuildOutput.atPath('PipelineStack.template.json'),
          adminPermissions: true,
          // role -> you can do this to narrow down permissions
        }),
      ],
    });
  }
}
