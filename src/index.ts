const serverlessExpress = require("@vendia/serverless-express");
import { app } from "./app";

export const handler = serverlessExpress({ app });
