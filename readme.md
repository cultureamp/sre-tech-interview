# Comment Vibe API (Culture Amp SRE Technical Interview Code)

> Welcome to the Culture Amp SRE Technical Interview code repository. This simple API and deployment IAC is the material we use to collaborate on with interviewees.

The Comment Vibe API is a small microservice for calculating sentiment using [AFINN-165](https://www.npmjs.com/package/sentiment) for comments left on surveys.

It exposes an API using API Gateway V2 and AWS Lambda and persists survey comments in a DynamoDB table. The infrastructure is managed and deployed using the AWS CDK.

![Comment Vibe API Architecture Diagram](./docs/comment-vibe.svg)

```text
sre-tech-interview
├── ops                  AWS CDK project for deploying Comment Vibe
├── src                  Node.js application source code for Comment Vibe
├── Dockerfile           Builds AWS Lambda container image for Comment Vibe
├── docker-compose.yaml  Allows for Comment Vibe to be run locally for testing
├── openapi.yaml         OpenAPI documentation for Comment Vibe
└── readme.md            This document
```

## Getting started

Requirements:

- Docker (or compatible), with Docker Compose v2 and above
- (optional) `asdf` or `mise` for easy tool installation -- this will install Node and Yarn using the `.tool-versions` file.
- Node 20
- Yarn 1.22.19

> [!TIP]
> Consider a GitHub Codespace (or similar) that has this tooling installed if
> it's not readily available on the machine you're using for the interview.

### Running in Docker

Comment Vibe can be run locally using Docker to imitate the AWS Lambda and DynamoDB infrastructure.

Build images:

```console
$ docker compose build
```

Run local containers:

```console
$ docker compose up
```

When the service starts, a container will run a command to create the necessary
table. The status of this will be shown in the logs.

Follow on to the next section for details on running the API locally for development. Note that it is possible to communicate with the API [in the container too](#sending-requests-to-the-api-in-docker-compose), using a different payload.

### Running the API locally

> [!TIP]
> Running directly on the local host allows for an easier dev/test workflow than
> when all services are running in Docker. The local API instance relies on the
> local DynamoDB instance running in `docker compose`.

Install dependencies

```console
$ yarn install
```

Run Express.js app locally

```console
$ yarn start
yarn run v1.22.15
dotenv ts-node src/local.ts
Server started on port 3000
```

> [!TIP]
>
> - Restart the `yarn` process to apply local changes.
> - Use the examples from the next section against your local copy of the API
> when testing.

## The API

Comment Vibe exposes two endpoints for use. See the [OpenAPI](./openapi.yaml) specification for more complete details.

### Comment on a survey: `POST /comment/:surveyId`

- Receives `surveyId` as parameter in path
- Receives new comment as JSON in the request body of a `POST` request
- Calculates `sentiment` field for the comment and saves it into the DynamoDB table
- Returns the comment with `sentiment` field set

```console
# example request and response

$ HOST=http://localhost:3000
$ curl -X POST -H 'Content-Type: application/json' ${HOST}/comment/my-survey -d '{"content":"Today is a good day."}'

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

```console
# example request and response

$ HOST=http://localhost:3000
$ curl -X GET -H 'Content-Type: application/json' ${HOST}/report/my-survey

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

### Sending requests to the API in Docker Compose

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

## Deploying to AWS with the CDK application

Requirements to run the CDK application:
- Node 20
- `yarn`

These can be installed using [asdf](https://asdf-vm.com/guide/getting-started.html), which will utilize the versions set in `.tool-versions`.

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
