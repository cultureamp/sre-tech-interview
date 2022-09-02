const serverlessExpress = require("@vendia/serverless-express");
import { app } from "./app";

export default serverlessExpress({ app });
