#!/bin/sh -xeo

export AWS_REGION=local
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local

endpoint="http://dynamodb:8000"

if aws dynamodb --endpoint "$endpoint" describe-table --table-name comment-vibe --query 'Table.TableStatus' > /dev/null 2>&1; then
  echo "Table already exists, no action required. Remove and recreate the 'dynamodb' container to reset the database."
else
  aws dynamodb --endpoint "$endpoint" create-table --cli-input-json file://create-table.json
fi
