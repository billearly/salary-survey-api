import serverlessExpress from "@vendia/serverless-express";
import { app } from "./app";
import { connectDb } from "./persistence";

let serverlessExpressInstance;

const setup = async (event, context) => {
  await connectDb();

  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context);
};

const handler = (event, context) => {
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context);
  }

  return setup(event, context);
};

export default handler;
