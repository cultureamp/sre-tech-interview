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

### Reporting on a survey: `GET /report/:surveyId`

- Receives `surveyId` as parameter in path
- Queries DynamoDB for all comments for the given `surveyId`
- Buckets them based on `sentiment` and returns a basic report of the survey comments

## Setting up locally

Requirements to run in Docker
- AWS CLI
- Docker

Build images with

```
docker compose build
```

Run local containers with

```
docker compose up
```

A container within the Docker Compose will create the required table within DynamoDB Local.

## Running Express.js application locally

Requirements to run application locally
- Node 16
- `yarn`

Install dependencies

```
yarn install
```

Run Express.js app locally

```bash
yarn start
```

Express.js app running locally will expect to connect to the DynamoDB Local instance running in Docker Compose.

## Sending requests to Lambda runtime locally

Example minimal request JSON for API Gateway v2 payload below. See this [reference](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html) for a complete example.

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

## Issues Introduced

- DynamoDB table name is hardcoded. If engineer wanted to set up multiple environments this fixed resource naming would be a problem
- Node.js code is unfactored. `app.ts` contains (1) Express.js routing setup, (2) business logic of the endpoints, and (3) persistence layer logic of interacting with DynamoDB