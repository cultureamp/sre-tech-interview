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

## Issues Introduced

- DynamoDB table name is hardcoded -- if engineer wanted to set up multiple environments this would be a problem

## DynamoDB Local

Start up local DynamoDB Local container with:

```
docker compose up -d
```

Create table within DynamoDB Local with:

```sh
❯ aws dynamodb --endpoint http://localhost:8000 create-table --cli-input-json '
{
  "TableName":"comment-vibe",
  "AttributeDefinitions":[
    {
      "AttributeName":"pk",
      "AttributeType":"S"
    },
    {
      "AttributeName":"sk",
      "AttributeType":"S"
    }
  ],
  "KeySchema":[
    {
      "AttributeName":"pk",
      "KeyType":"HASH"
    },
    {
      "AttributeName":"sk",
      "KeyType":"RANGE"
    }
  ],
  "BillingMode":"PAY_PER_REQUEST"
}'

# example response
{
    "TableDescription": {
        "AttributeDefinitions": [
            {
                "AttributeName": "pk",
                "AttributeType": "S"
            },
            {
                "AttributeName": "sk",
                "AttributeType": "S"
            }
        ],
        "TableName": "comment-vibe",
        "KeySchema": [
            {
                "AttributeName": "pk",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "sk",
                "KeyType": "RANGE"
            }
        ],
        "TableStatus": "ACTIVE",
        "CreationDateTime": "2022-09-02T15:11:23.509000+10:00",
        "ProvisionedThroughput": {
            "LastIncreaseDateTime": "1970-01-01T10:00:00+10:00",
            "LastDecreaseDateTime": "1970-01-01T10:00:00+10:00",
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 0,
            "WriteCapacityUnits": 0
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/comment-vibe",
        "BillingModeSummary": {
            "BillingMode": "PAY_PER_REQUEST",
            "LastUpdateToPayPerRequestDateTime": "2022-09-02T15:11:23.509000+10:00"
        }
    }
}
```