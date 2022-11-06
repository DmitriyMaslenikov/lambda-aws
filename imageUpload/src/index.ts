module.exports.imageUpload = async (event: { rawQueryString: string }) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(`Hello ${event.rawQueryString}`),
  };
  return response;
};
