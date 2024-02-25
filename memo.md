# MEMO

## ref

https://catalog.workshops.aws/typescript-and-cdk-for-beginner/ja-JP/40-cdk-introduction
https://dev.classmethod.jp/articles/aws-cdk-terraform-backend-configuration-settings/

## 概要

App: 複数の Stack の依存関係を管理
Stack: CF のスタックに該当。デプロイは Stack 単位である。
Construct: Stack で作成される AWS リソース

## CDK のよく使うコマンド

```
//スタック一覧表示
cdk list

//CloudFormationテンプレートの確認
cdk synth [stack name]

//Deploy用のバケット作成(初回のみ)
cdk bootstrap --profile xxxxxxx

//Deploy
cdk deploy [stack name] --profile xxxxxxx

//Destroy
cdk destroy [stack name] --profile xxxxxxx

//ローカルとデプロイのリソースの差分を確認
cdk diff [stack name] --profile xxxxxxx
```

## install aws cdksa

```
nodenv install 20.2.0
nodenv local 20.2.0

npm install -g aws-cdk
cdk --version
> 2.128.0 (build d995261)
```

## setup aws cli

```
aws --version
> aws-cli/2.2.22 Python/3.8.8 Darwin/21.4.0 exe/x86_64 prompt/off
```

## create CDK project

```
mkdir sugar-sample && cd sugar-sample
cdk init sample-app --language=typescript

npx tsc --init
npm install --save-dev eslint
npx eslint --init
npm install --save-dev prettier eslint-config-prettier
```

- `.eslintrc.js`に項目を追加する

```.eslintrc.js
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
```

- 未使用変数を無視するルールを追加

```.eslintrc.json
"rules": {
++  "@typescript-eslint/no-unused-vars": "off"
}
```

## MEMO

```
//create S3 bucket
npm install @aws-cdk/aws-s3
```

## NodejsFunction で Lambda を用意

1. ソースコードを用意

```typescript
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

const detectionFunc = new NodejsFunction(this, "DetectionFunction", {
  functionName: "sugar-detect-sentiment",
  entry: "../functions/detect-sentiment/index.ts",
  handler: "handler",
  runtime: lambda.Runtime.NODEJS_18_X,
  timeout: cdk.Duration.minutes(5),
  bundling: {
    forceDockerBundling: false,
  },
  environment: {
    DEST_BUCKET: outputBucket.bucketName,
  },
});
```

2. esbuild をインストールする

```
npm install --save-dev esbuild@0
```

3. Lambda のディレクトリにて以下を実行

```
npm install ts-node --save-dev
```

4. Lambda のディレクトリにて tsconfig.json を用意
