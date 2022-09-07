export const createAWSOptions = () => {
  if (process.env["IS_LOCAL"] == "true") {
    const host = process.env["DYNAMODB_HOST"] ?? "localhost";
    return {
      region: "local",
      endpoint: `http://${host}:8000`,
      credentials: {
        accessKeyId: "local",
        secretAccessKey: "local",
      },
    };
  } else {
    return {};
  }
};
