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

## DynamoDB Local

Start up local DynamoDB Local container with:

```
docker run --name dynamodb -p 8000:8000 -d amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
```

Create table within DynamoDB Local with:

```sh
❯ aws dynamodb --endpoint http://localhost:8000 create-table --cli-input-json '
{
  "TableName":"local-testing",
  "AttributeDefinitions":[
    {
      "AttributeName":"id",
      "AttributeType":"N"
    }
  ],
  "KeySchema":[
    {
      "AttributeName":"id",
      "KeyType":"HASH"
    }
  ],
  "BillingMode":"PAY_PER_REQUEST"
}'

# example response

{
    "TableDescription": {
        "AttributeDefinitions": [
            {
                "AttributeName": "id",
                "AttributeType": "N"
            }
        ],
        "TableName": "local-testing",
        "KeySchema": [
            {
                "AttributeName": "id",
                "KeyType": "HASH"
            }
        ],
        "TableStatus": "ACTIVE",
        "CreationDateTime": "2022-09-02T14:22:51.954000+10:00",
        "ProvisionedThroughput": {
            "LastIncreaseDateTime": "1970-01-01T10:00:00+10:00",
            "LastDecreaseDateTime": "1970-01-01T10:00:00+10:00",
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 0,
            "WriteCapacityUnits": 0
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:ddblocal:000000000000:table/local-testing",
        "BillingModeSummary": {
            "BillingMode": "PAY_PER_REQUEST",
            "LastUpdateToPayPerRequestDateTime": "2022-09-02T14:22:51.954000+10:00"
        }
    }
}
```