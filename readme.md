# Culture Amp Technical Interview Code

Requirements
- AWS CLI
- AWS SAM CLI
- Node
- yarn

Deploying

```bash
sam build
sam deploy --guided
```

Running locally

```bash
yarn install
DYNAMODB_TABLE_NAME=MyDevelopmentTable node src/local.js
```