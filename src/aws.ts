export const createAWSOptions = function () {
  if (process.env["IS_LOCAL"] == "true") {
    return {
      region: "local",
      endpoint: "http://localhost:8000",
      accessKeyId: "local",
      secretAccessKey: "local",
    };
  } else {
    return {};
  }
};
