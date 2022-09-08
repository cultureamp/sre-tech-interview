#!/bin/sh -xeo

export AWS_REGION=local
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local

aws dynamodb --endpoint http://dynamodb:8000 create-table --cli-input-json file://create-table.json