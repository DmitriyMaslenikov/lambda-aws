import { putObject } from './S3/post';
import { listObjects, deleteObject, filesGetLink } from './S3/app';
import {
  signUpUser,
  confirmSignUpUser,
  initiateAuthUser,
} from './controllers/authControllerSDK';

import jwt from 'jsonwebtoken';

const getUserName = (token: string) => {
  const tokenPayload = token.split(' ')[1];
  const decodedData = jwt.decode(tokenPayload);
  if (decodedData && typeof decodedData === 'object') {
    return decodedData.username;
  }
};

module.exports.putObject = async (event: {
  headers: { authorization: string };
  body: string;
}) => {
  const userName = getUserName(event.headers.authorization);

  const data = await putObject(
    process.env.BucketName,
    userName + '/' + event.body
  );
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return response;
};

module.exports.files = async (event: {
  headers: { authorization: string };
}) => {
  const userName = getUserName(event.headers.authorization);

  const data = await listObjects(process.env.BucketName, userName);

  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return response;
};

module.exports.filesGetLink = async (event: {
  headers: { authorization: string };
  body: string;
}) => {
  const userName = getUserName(event.headers.authorization);

  const data = await filesGetLink(process.env.BucketName, userName, event.body);

  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return response;
};

module.exports.deleteFile = async (event: {
  headers: { authorization: string };
  body: string;
}) => {
  const userName = getUserName(event.headers.authorization);

  await deleteObject(process.env.BucketName, userName + '/' + event.body);

  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: 'Ok',
  };
  return response;
};

module.exports.signUp = async (event: { body: string }) => {
  const data = JSON.parse(event.body);
  await signUpUser(data.email, data.password, process.env.clientId);
  await confirmSignUpUser(data.email, process.env.userPoolId);

  const response = {
    statusCode: 200,
    body: JSON.stringify(
      `Пользователь  ${data.email} успешно зарегистрирован.`
    ),
  };
  return response;
};

module.exports.authUser = async (event: { body: string }) => {
  const data = JSON.parse(event.body);
  let accessToken: string | undefined = '';
  const resultAuthUser = await initiateAuthUser(
    data.email,
    data.password,
    process.env.clientId
  );
  if (
    typeof resultAuthUser === 'object' &&
    typeof resultAuthUser.AuthenticationResult !== 'undefined'
  ) {
    accessToken = resultAuthUser.AuthenticationResult.AccessToken;
  }
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      AccessToken: accessToken,
    }),
  };

  return response;
};
