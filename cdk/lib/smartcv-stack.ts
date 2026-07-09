import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import * as path from 'path';

// ─── SmartCV Owner Config ─────────────────────────────────────────────────────
const OWNER_EMAIL = 'huynhnhandn68@gmail.com';
const GITHUB_USER = 'huynhnhan68';
const GITHUB_REPO = 'smartcv';
const APP_NAME = 'smartcv';
const APP_DISPLAY = 'SmartCV';
const AMPLIFY_APP_ID = 'd1s2bq5nqqwd9y';
const AMPLIFY_URL = `https://main.${AMPLIFY_APP_ID}.amplifyapp.com`;

export class SmartCVStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── KMS Key ──────────────────────────────────────────────────────────────
    const smartCVKey = new kms.Key(this, 'SmartCVKey', {
      alias: `alias/${APP_NAME}-key`,
      description: 'Customer Managed KMS Key for SmartCV (DynamoDB, S3)',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ─── DynamoDB ─────────────────────────────────────────────────────────────
    const table = new dynamodb.Table(this, 'SmartCVTable', {
      tableName: APP_NAME,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      timeToLiveAttribute: 'ttl',
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: smartCVKey,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ─── S3 - resumes ─────────────────────────────────────────────────────────
    const resumeBucket = new s3.Bucket(this, 'ResumeBucket', {
      bucketName: `${APP_NAME}-resumes-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: smartCVKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [{ noncurrentVersionExpiration: cdk.Duration.days(90) }],
      cors: [{ allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET], allowedOrigins: ['*'], allowedHeaders: ['*'], maxAge: 3000 }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });



    const amplifyDomain = AMPLIFY_URL;
    const githubPagesDomain = `https://${GITHUB_USER}.github.io`;
    const githubPagesApp = `${githubPagesDomain}/${GITHUB_REPO}`;
    const cloudfrontDomain = `https://dummydomain.cloudfront.net`;

    // ─── Cognito User Pool ────────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${APP_NAME}-users`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: { minLength: 8, requireUppercase: true, requireDigits: true, requireSymbols: false },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });


    const googleOAuthSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'GoogleOAuthSecret', `${APP_NAME}/google-oauth`
    );

    // ─── Google Identity Provider ─────────────────────────────────────────────
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(this, 'GoogleProvider', {
      userPool,
      clientId: googleOAuthSecret.secretValueFromJson('client_id').unsafeUnwrap(),
      clientSecretValue: googleOAuthSecret.secretValueFromJson('client_secret'),
      scopes: ['email', 'profile', 'openid'],
      attributeMapping: {
        email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        givenName: cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
      },
    });

    // ─── Cognito Hosted UI domain ─────────────────────────────────────────────
    // Full domain: smartcv-auth.auth.ap-southeast-1.amazoncognito.com
    const hostedUiDomain = userPool.addDomain('HostedUiDomain', {
      cognitoDomain: {
        domainPrefix: `${APP_NAME}-auth`,
      },
    });

    // ─── UserPoolClient (Email/Password + Google OAuth) ───────────────────────
    const userPoolClient = userPool.addClient('WebClient', {
      authFlows: { userPassword: true, userSrp: true },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          `${cloudfrontDomain}/auth/callback`,
          `${githubPagesApp}/auth/callback`,
          `${amplifyDomain}/auth/callback`,
          'http://localhost:5173/auth/callback',
          cloudfrontDomain,
          githubPagesApp,
          amplifyDomain,
          'http://localhost:5173',
        ],
        logoutUrls: [
          `${cloudfrontDomain}/`,
          `${githubPagesApp}/`,
          `${amplifyDomain}/`,
          'http://localhost:5173/',
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
    });

    // Google provider phải tồn tại trước khi client tham chiếu
    userPoolClient.node.addDependency(googleProvider);

    // ─── Shared Lambda Layer ──────────────────────────────────────────────────
    const sharedLayer = new lambda.LayerVersion(this, 'SharedLayer', {
      layerVersionName: `${APP_NAME}-shared`,
      description: 'Shared middleware, Pydantic, X-Ray SDK, Powertools',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/shared_layer')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
      compatibleArchitectures: [lambda.Architecture.ARM_64],
    });

    // ─── Lambda shared config ─────────────────────────────────────────────────
    // NOTE: Amazon Nova Lite không bị geographic restriction (khác Claude Haiku)
    const commonEnv = {
      TABLE_NAME: table.tableName,
      RESUME_BUCKET: resumeBucket.bucketName,
      USER_POOL_ID: userPool.userPoolId,
      BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
      POWERTOOLS_SERVICE_NAME: APP_NAME,
      LOG_LEVEL: 'INFO',
      AWS_XRAY_TRACING_NAME: APP_NAME,
    };

    const runtime = lambda.Runtime.PYTHON_3_12;
    const architecture = lambda.Architecture.ARM_64;
    const logRetention = logs.RetentionDays.ONE_MONTH;
    const tracingConfig = lambda.Tracing.ACTIVE;

    // ─── Lambda: applications ─────────────────────────────────────────────────
    const applicationsLambda = new lambda.Function(this, 'ApplicationsLambda', {
      functionName: `${APP_NAME}-applications`,
      runtime, architecture, memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      logRetention, tracing: tracingConfig,
      environment: commonEnv, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/applications')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - CRUD operations for job applications`,
    });

    table.grantReadWriteData(applicationsLambda);
    resumeBucket.grantReadWrite(applicationsLambda);

    // ─── Lambda: insights ─────────────────────────────────────────────────────
    const insightsLambda = new lambda.Function(this, 'InsightsLambda', {
      functionName: `${APP_NAME}-insights`,
      runtime, architecture, memorySize: 1024,
      timeout: cdk.Duration.seconds(60),
      logRetention, tracing: tracingConfig,
      environment: commonEnv, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/insights')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - Pattern analysis + Bedrock AI coaching`,
    });

    table.grantReadWriteData(insightsLambda);  // grantReadWriteData needed for check_rate_limit (UpdateItem)
    insightsLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['*'],
    }));

    // ─── Lambda: digest ───────────────────────────────────────────────────────
    const digestLambda = new lambda.Function(this, 'DigestLambda', {
      functionName: `${APP_NAME}-digest`,
      runtime, architecture, memorySize: 512,
      timeout: cdk.Duration.seconds(120),
      logRetention, tracing: tracingConfig, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/digest')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - Weekly email digest via SES`,
      environment: { ...commonEnv, SES_FROM_EMAIL: OWNER_EMAIL },
    });

    table.grantReadData(digestLambda);
    digestLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail', 'bedrock:InvokeModel'],
      resources: ['*'],
    }));
    digestLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['cognito-idp:AdminGetUser'],
      resources: [userPool.userPoolArn],
    }));

    // ─── Lambda: Cognito Post Confirmation - SES verify ───────────────────────
    const cognitoVerifyLambda = new lambda.Function(this, 'CognitoVerifyLambda', {
      functionName: `${APP_NAME}-cognito-verify`,
      runtime, architecture, memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      logRetention, tracing: tracingConfig, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/cognito_verify')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - Auto-verifies new user emails in SES on Cognito signup`,
      environment: { POWERTOOLS_SERVICE_NAME: APP_NAME, LOG_LEVEL: 'INFO' },
    });

    cognitoVerifyLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:VerifyEmailIdentity', 'ses:GetIdentityVerificationAttributes'],
      resources: ['*'],
    }));

    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, cognitoVerifyLambda);
    userPool.addTrigger(cognito.UserPoolOperation.POST_AUTHENTICATION, cognitoVerifyLambda);

    // ─── Lambda: follow-up reminders ─────────────────────────────────────────
    const followUpLambda = new lambda.Function(this, 'FollowUpLambda', {
      functionName: `${APP_NAME}-followup`,
      runtime, architecture, memorySize: 512,
      timeout: cdk.Duration.seconds(120),
      logRetention, tracing: tracingConfig, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/followup')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - Daily follow-up reminder emails for overdue applications`,
      environment: { ...commonEnv, SES_FROM_EMAIL: OWNER_EMAIL },
    });

    table.grantReadData(followUpLambda);
    followUpLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));
    followUpLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['cognito-idp:AdminGetUser'],
      resources: [userPool.userPoolArn],
    }));

    // ─── Lambda: user settings ────────────────────────────────────────────────
    const settingsLambda = new lambda.Function(this, 'SettingsLambda', {
      functionName: `${APP_NAME}-settings`,
      runtime, architecture, memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      logRetention, tracing: tracingConfig, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/settings')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - User settings: weekly goal and streak tracking`,
      environment: commonEnv,
    });

    table.grantReadWriteData(settingsLambda);

    // ─── Lambda: notes timeline ───────────────────────────────────────────────
    const notesLambda = new lambda.Function(this, 'NotesLambda', {
      functionName: `${APP_NAME}-notes`,
      runtime, architecture, memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      logRetention, tracing: tracingConfig, layers: [sharedLayer],
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambdas/notes')),
      handler: 'handler.lambda_handler',
      description: `${APP_DISPLAY} - Timestamped notes timeline per application`,
      environment: commonEnv,
    });

    table.grantReadWriteData(notesLambda);

    // ─── X-Ray IAM cho tất cả Lambdas ────────────────────────────────────────
    const xrayPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords', 'xray:GetSamplingRules', 'xray:GetSamplingTargets'],
      resources: ['*'],
    });

    [
      applicationsLambda, insightsLambda, digestLambda,
      cognitoVerifyLambda, followUpLambda, settingsLambda, notesLambda,
    ].forEach(fn => fn.addToRolePolicy(xrayPolicy));

    // ─── EventBridge: Monday 8am UTC - weekly digest ──────────────────────────
    new events.Rule(this, 'WeeklyDigestRule', {
      ruleName: `${APP_NAME}-weekly-digest`,
      description: `${APP_DISPLAY} - Fires every Monday at 8am UTC`,
      schedule: events.Schedule.cron({ minute: '0', hour: '8', weekDay: 'MON' }),
      targets: [new targets.LambdaFunction(digestLambda)],
    });

    // ─── EventBridge: daily 9am UTC - follow-up reminders ────────────────────
    new events.Rule(this, 'DailyFollowUpRule', {
      ruleName: `${APP_NAME}-daily-followup`,
      description: `${APP_DISPLAY} - Fires every day at 9am UTC to send follow-up reminders`,
      schedule: events.Schedule.cron({ minute: '0', hour: '9' }),
      targets: [new targets.LambdaFunction(followUpLambda)],
    });

    // ─── SNS Alarms Topic ─────────────────────────────────────────────────────
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `${APP_NAME}-alarms`,
      displayName: `${APP_DISPLAY} CloudWatch Alarms`,
    });
    alarmTopic.addSubscription(new snsSubscriptions.EmailSubscription(OWNER_EMAIL));

    // ─── CloudWatch Alarms ────────────────────────────────────────────────────
    const alarmDefaults = {
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    };

    new cloudwatch.Alarm(this, 'ApplicationsLambdaErrorAlarm', {
      alarmName: `${APP_NAME}-applications-errors`,
      metric: applicationsLambda.metricErrors({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 5, ...alarmDefaults,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'InsightsLambdaErrorAlarm', {
      alarmName: `${APP_NAME}-insights-errors`,
      metric: insightsLambda.metricErrors({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 5, ...alarmDefaults,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'DigestLambdaErrorAlarm', {
      alarmName: `${APP_NAME}-digest-errors`,
      metric: digestLambda.metricErrors({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 1, ...alarmDefaults,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'FollowUpLambdaErrorAlarm', {
      alarmName: `${APP_NAME}-followup-errors`,
      metric: followUpLambda.metricErrors({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 1, ...alarmDefaults,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'ApplicationsLambdaP99Alarm', {
      alarmName: `${APP_NAME}-applications-p99-latency`,
      metric: applicationsLambda.metricDuration({ period: cdk.Duration.minutes(5), statistic: 'p99' }),
      threshold: 10000, evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    new cloudwatch.Alarm(this, 'InsightsLambdaP99Alarm', {
      alarmName: `${APP_NAME}-insights-p99-latency`,
      metric: insightsLambda.metricDuration({ period: cdk.Duration.minutes(5), statistic: 'p99' }),
      threshold: 30000, evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatchActions.SnsAction(alarmTopic));

    // ─── CloudWatch Dashboard ─────────────────────────────────────────────────
    new cloudwatch.Dashboard(this, 'SmartCVDashboard', {
      dashboardName: `${APP_NAME}-overview`,
      widgets: [
        [
          new cloudwatch.GraphWidget({
            title: `${APP_DISPLAY} - Lambda Invocations`,
            left: [
              applicationsLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
              insightsLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
              digestLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
              followUpLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
              settingsLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
              notesLambda.metricInvocations({ period: cdk.Duration.minutes(5) }),
            ],
            width: 12,
          }),
          new cloudwatch.GraphWidget({
            title: `${APP_DISPLAY} - Lambda Errors`,
            left: [
              applicationsLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
              insightsLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
              digestLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
              followUpLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
              settingsLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
              notesLambda.metricErrors({ period: cdk.Duration.minutes(5) }),
            ],
            width: 12,
          }),
        ],
        [
          new cloudwatch.GraphWidget({
            title: `${APP_DISPLAY} - Lambda Duration p99`,
            left: [
              applicationsLambda.metricDuration({ period: cdk.Duration.minutes(5), statistic: 'p99' }),
              insightsLambda.metricDuration({ period: cdk.Duration.minutes(5), statistic: 'p99' }),
            ],
            width: 12,
          }),
          new cloudwatch.GraphWidget({
            title: `${APP_DISPLAY} - Lambda Throttles`,
            left: [
              applicationsLambda.metricThrottles({ period: cdk.Duration.minutes(5) }),
              insightsLambda.metricThrottles({ period: cdk.Duration.minutes(5) }),
            ],
            width: 12,
          }),
        ],
      ],
    });

    // ─── API Gateway ──────────────────────────────────────────────────────────
    const api = new apigateway.RestApi(this, 'SmartCVApi', {
      restApiName: `${APP_NAME}-api`,
      description: `${APP_DISPLAY} REST API`,
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:5173',
          'http://localhost:5174',
          githubPagesDomain,
          githubPagesApp,
          amplifyDomain
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1),
      },
      deployOptions: {
        stageName: 'v1',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        tracingEnabled: true,
      },
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: `${APP_NAME}-authorizer`,
      identitySource: 'method.request.header.Authorization',
    });

    const authOptions: apigateway.MethodOptions = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // ─── API Routes ───────────────────────────────────────────────────────────
    const appsResource = api.root.addResource('applications');
    appsResource.addMethod('GET', new apigateway.LambdaIntegration(applicationsLambda), authOptions);
    appsResource.addMethod('POST', new apigateway.LambdaIntegration(applicationsLambda), authOptions);

    const appResource = appsResource.addResource('{appId}');
    appResource.addMethod('GET', new apigateway.LambdaIntegration(applicationsLambda), authOptions);
    appResource.addMethod('PUT', new apigateway.LambdaIntegration(applicationsLambda), authOptions);
    appResource.addMethod('DELETE', new apigateway.LambdaIntegration(applicationsLambda), authOptions);
    appResource.addResource('status').addMethod('POST', new apigateway.LambdaIntegration(applicationsLambda), authOptions);

    const insightsResource = api.root.addResource('insights');
    insightsResource.addMethod('GET', new apigateway.LambdaIntegration(insightsLambda), authOptions);
    insightsResource.addResource('chat').addMethod('POST', new apigateway.LambdaIntegration(insightsLambda), authOptions);

    const resumesResource = api.root.addResource('resumes');
    resumesResource.addResource('upload-url').addMethod('POST', new apigateway.LambdaIntegration(applicationsLambda), authOptions);
    resumesResource.addResource('list').addMethod('GET', new apigateway.LambdaIntegration(applicationsLambda), authOptions);

    const resumeResource = resumesResource.addResource('{versionName}');
    resumeResource.addMethod('DELETE', new apigateway.LambdaIntegration(applicationsLambda), authOptions);

    const usersResource = api.root.addResource('users');
    const settingsResource = usersResource.addResource('settings');
    settingsResource.addMethod('GET', new apigateway.LambdaIntegration(settingsLambda), authOptions);
    settingsResource.addMethod('PUT', new apigateway.LambdaIntegration(settingsLambda), authOptions);

    const notesResource = appResource.addResource('notes');
    notesResource.addMethod('GET', new apigateway.LambdaIntegration(notesLambda), authOptions);
    notesResource.addMethod('POST', new apigateway.LambdaIntegration(notesLambda), authOptions);

    const noteResource = notesResource.addResource('{noteId}');
    noteResource.addMethod('DELETE', new apigateway.LambdaIntegration(notesLambda), authOptions);

    // ─── CDK Outputs ──────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url, description: `${APP_DISPLAY} REST API → VITE_API_URL` });
    new cdk.CfnOutput(this, 'AmplifyUrl', { value: AMPLIFY_URL, description: '✅ Amplify Hosting URL (primary frontend - CloudFront inside)' });
    // new cdk.CfnOutput(this, 'CloudFrontUrl', { value: cloudfrontDomain, description: `CloudFront HTTPS URL → dùng cho frontend (cần account verified)` });
    // new cdk.CfnOutput(this, 'FrontendBucketName', { value: frontendBucket.bucketName, description: `S3 Frontend Bucket → deploy "npm run build" vào đây` });
    // new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId, description: 'CloudFront Distribution ID → dùng để invalidate cache' });
    new cdk.CfnOutput(this, 'GitHubPagesUrl', { value: githubPagesApp, description: 'GitHub Pages frontend URL (fallback)' });
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId, description: `Cognito User Pool ID → VITE_USER_POOL_ID` });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId, description: `Cognito Client ID → VITE_USER_POOL_CLIENT_ID` });
    new cdk.CfnOutput(this, 'ResumeBucketName', { value: resumeBucket.bucketName, description: 'S3 Resume Bucket' });
    new cdk.CfnOutput(this, 'AlarmTopicArn', { value: alarmTopic.topicArn, description: 'SNS Alarm Topic ARN' });
    new cdk.CfnOutput(this, 'SharedLayerArn', { value: sharedLayer.layerVersionArn, description: 'Lambda Shared Layer ARN' });
    new cdk.CfnOutput(this, 'HostedUiBaseUrl', {
      value: `https://${APP_NAME}-auth.auth.${this.region}.amazoncognito.com`,
      description: 'Cognito Hosted UI (dùng trong Amplify oauth config)',
    });
    new cdk.CfnOutput(this, 'GoogleIdpRedirectUri', {
      value: `https://${APP_NAME}-auth.auth.${this.region}.amazoncognito.com/oauth2/idpresponse`,
      description: '⚠️ Thêm URI này vào Google Cloud Console → Authorized Redirect URIs',
    });
  }
}


