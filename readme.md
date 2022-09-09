# Comment Vibe API (Culture Amp SRE Technical Interview Code)

> Welcome to the Culture Amp SRE Technical Interview code repository. This simple API and deployment IAC is the material we use to collaborate on with interviewees.

The Comment Vibe API is a small microservice for calculating sentiment using [AFINN-165](https://www.npmjs.com/package/sentiment) for comments left on surveys.

It exposes an API using API Gateway V2 and AWS Lambda and persists survey comments in a DynamoDB table. The infrastructure is managed and deployed using the AWS CDK

![Comment Vibe API Architecture Diagram](./docs/comment-vibe.svg)

```
sre-tech-interview
├── ops                  AWS CDK project for deploying Comment Vibe
├── src                  Node.js application source code for Comment Vibe
├── Dockerfile           Builds AWS Lambda container image for Comment Vibe
├── docker-compose.yaml  Allows for Comment Vibe to be run locally for testing
├── openapi.yaml         OpenAPI documentation for Comment Vibe
└── readme.md            This document
```

## The API

Comment Vibe exposes two endpoints for use. See the [OpenAPI](./openapi.yaml) specification for more complete details.

### Comment on a survey : `POST /comment/:surveyId`

- Receives `surveyId` as parameter in path
- Receives new comment as JSON in the request body of a `POST` request
- Calculates `sentiment` field for the comment and saves it into the DynamoDB table
- Returns the comment with `sentiment` field set

```sh
# example request and response

curl -X POST -H 'Content-Type: application/json' ${HOST}/comment/my-survey -d '{"content":"Today is a good day."}'

{
  "action": "add",
  "data": {
    "surveyId": "my-survey",
    "datetime": "2022-09-08T22:32:50.515Z",
    "content": "Today is a good day.",
    "sentiment": 3
  }
}
```

### Reporting on a survey: `GET /report/:surveyId`

- Receives `surveyId` as parameter in path
- Queries DynamoDB for all comments for the given `surveyId`
- Buckets them based on `sentiment` and returns a basic report of the survey comments

```sh
# example request and response

curl -X GET -H 'Content-Type: application/json' ${HOST}/report/my-survey

{
  "action": "report",
  "data": {
    "surveyId": "my-survey",
    "positiveCount": 1,
    "negativeCount": 0,
    "neutralCount": 0,
    "averageSentiment": 3
  }
}
```

## Setting up locally

Comment Vibe can be run locally using Docker to imitate the AWS Lambda and DynamoDB infrastructure.

Requirements to run in Docker
- Docker

Build images with

```
❯ docker compose build
```

Run local containers with

```
❯ docker compose up
```

### Creating the DynamoDB table in DynamoDB Local

A container within the Docker Compose will create the required table within DynamoDB Local automatically. Check the logs for the `create-table` container if you have issues with the table.

### Sending requests to local Lambda container

The Lambda container expects to receive an AWS API Gateway v2 payload. See below for an example minimal request JSON for wrapping up a Comment Vibe request. See this [reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) for a complete example.

```sh
# adding a comment
curl -X POST http://localhost:9000/2015-03-31/functions/function/invocations -d '
{
  "version": "2.0",
  "headers": {
    "Content-Type": "application/json"
  },
  "rawPath": "/comment/my-survey",
  "body": "{\"content\":\"This survey was good.\"}",
  "requestContext": {
    "http": {
      "method": "POST"
    }
  }
}'

# reporting on a survey
curl -X POST http://localhost:9000/2015-03-31/functions/function/invocations -d '
{
  "version": "2.0",
  "headers": {
    "Content-Type": "application/json"
  },
  "rawPath": "/report/my-survey",
  "requestContext": {
    "http": {
      "method": "GET"
    }
  }
}'
```


## Running Express.js application locally

The Express.js application for Comment Vibe can also be run locally without Docker which provides a faster iteration loop for development.

Requirements to run application locally:
- Node 16
- `yarn`

Install dependencies

```
❯ yarn install
```

Run Express.js app locally

```sh
❯ yarn start
yarn run v1.22.15
$ dotenv ts-node src/local.ts
Server started on port 3000
```

### Connecting to DynamoDB from local Express.js

Express.js app running locally will expect to connect to the DynamoDB Local instance running in Docker Compose.

### Sending requests to local Express.js

The Express.js app expects to receive the Comment Vibe request JSON directly. See the API documentation earlier in this document.

## Deploying to AWS with the CDK application

Requirements to run the CDK application:
- Node 16
- `yarn`

The CDK application is located in the `ops` directory

```
❯ cd ops
```

Install dependencies

```
❯ yarn install
```

Run Jest tests

```
❯ yarn test
```

Synth CloudFormation stack

```
❯ yarn cdk synth
```

Deploy the CloudFormation stack (the CDK app will use any valid credentials available in your terminal session)

```
❯ yarn cdk deploy
```
