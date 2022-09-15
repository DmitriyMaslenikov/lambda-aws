module.exports.hello = async (event: { rawQueryString: any }) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(`Hello ${event.rawQueryString}`),
  };
  return response;
};
