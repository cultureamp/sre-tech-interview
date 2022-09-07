export const createAWSOptions = () => {
  if (process.env["IS_LOCAL"] == "true") {
    return {
      region: "local",
      endpoint: "http://dynamodb:8000",
      credentials: {
        accessKeyId: "local",
        secretAccessKey: "local",
      },
    };
  } else {
    return {};
  }
};
