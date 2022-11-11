import { listObjects, deleteObject, putObject } from './S3/app';
import {
  signUpUser,
  confirmSignUpUser,
  initiateAuthUser,
} from './controllers/authControllerSDK';

import jwt from 'jsonwebtoken';
import validator from 'validator';

module.exports.hello = async (event: { rawQueryString: any }) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(`Hello ${event.rawQueryString}`),
  };
  return response;
};

const getUserName = (token: unknown) => {
  try {
    let tokenString = '';
    if (typeof token === 'string') {
      tokenString = token;
    } else throw 'Переменная token должена быть строкой';
    const tokenPayload = tokenString.split(' ')[1];
    const decodedData = jwt.decode(tokenPayload);
    if (decodedData && typeof decodedData !== 'string') {
      return decodedData.username;
    } else throw 'Токен не содержит userName ';
  } catch (err) {
    console.error('Error', err);
    return 'Error kod 500';
  }
};

module.exports.putObject = async (event: {
  headers: { authorization: unknown };
  body: unknown;
}) => {
  try {
    let fileName = '';
    if (typeof event.body === 'string' && event.body.length !== 0) {
      fileName = event.body;
    } else throw 'FileName должно быть строкой';
    const userName = getUserName(event.headers.authorization);
    let bucketName = '';
    if (typeof process.env.BucketName === 'string') {
      bucketName = process.env.BucketName;
    } else throw 'BucketName не существует';

    const data = await putObject(bucketName, userName + '/' + fileName);
    const response = {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return response;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

module.exports.files = async (event: {
  headers: { authorization: unknown };
}) => {
  try {
    const userName = getUserName(event.headers.authorization);
    let bucketName = '';
    if (typeof process.env.BucketName === 'string') {
      bucketName = process.env.BucketName;
    } else throw 'BucketName не существует';
    const data = await listObjects(bucketName, userName);

    const response = {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return response;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

module.exports.deleteFile = async (event: {
  headers: { authorization: unknown };
  body: unknown;
}) => {
  try {
    let fileName = '';
    if (typeof event.body === 'string' && event.body.length !== 0) {
      fileName = event.body;
    } else throw 'FileName должно быть строкой';
    const userName = getUserName(event.headers.authorization);
    let bucketName = '';
    if (typeof process.env.BucketName === 'string') {
      bucketName = process.env.BucketName;
    } else throw 'BucketName не существует';

    await deleteObject(bucketName, userName + '/' + fileName);

    const response = {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        fileName: `${event.body}`,
        message: `Фаил  ${event.body} успешно удалён.`,
      }),
    };
    return response;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

module.exports.signUp = async (event: { body: string }) => {
  try {
    const data = JSON.parse(event.body);
    let password = '';
    if (typeof data.password === 'string') {
      password = data.password;
    } else throw 'Password должно быть строкой';
    let email = '';
    if (typeof data.email === 'string') {
      if (validator.isEmail(data.email)) {
        email = data.email;
      } else throw 'Username должно быть email';
    } else throw 'Username должно быть строкой';
    let clientId = '';
    if (typeof process.env.clientId === 'string') {
      clientId = process.env.clientId;
    } else throw 'clientId не существует';
    await signUpUser(email, password, clientId);
    let userPoolId = '';
    if (typeof process.env.userPoolId === 'string') {
      userPoolId = process.env.userPoolId;
    } else throw 'userPoolId не существует';
    await confirmSignUpUser(email, userPoolId);

    const response = {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        clientName: `${data.email}`,
        message: `Пользователь  ${data.email} успешно зарегистрирован.`,
      }),
    };
    return response;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

module.exports.authUser = async (event: { body: string }) => {
  try {
    const data = JSON.parse(event.body);
    let password = '';
    if (typeof data.password === 'string') {
      password = data.password;
    } else throw 'Password должно быть строкой';
    let email = '';
    if (typeof data.email === 'string') {
      if (validator.isEmail(data.email)) {
        email = data.email;
      } else throw 'Username должно быть email';
    } else throw 'Username должно быть строкой';
    let accessToken: string | undefined = '';

    let clientId = '';
    if (typeof process.env.clientId === 'string') {
      clientId = process.env.clientId;
    } else throw 'clientId не существует';

    const resultAuthUser = await initiateAuthUser(email, password, clientId);
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
        accessToken: accessToken,
      }),
    };

    return response;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};
