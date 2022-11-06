import {
  CognitoIdentityProviderClient,
  AdminConfirmSignUpCommand,
  SignUpCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

export const signUpUser = async (
  email: string,
  password: string,
  clientId: string | undefined
) => {
  try {
    const input = {
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
      ClientId: clientId,
    };
    const command = new SignUpCommand(input);

    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    console.error(err);
    return JSON.stringify(err);
  }
};

export const confirmSignUpUser = async (
  email: string,
  userPoolId: string | undefined
) => {
  try {
    const input = {
      Username: email,
      UserPoolId: userPoolId,
    };

    const command = new AdminConfirmSignUpCommand(input);

    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    console.error(err);
    return JSON.stringify(err);
  }
};

export const initiateAuthUser = async (
  email: string,
  password: string,
  clientId: string | undefined
) => {
  try {
    const input = {
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const command = new InitiateAuthCommand(input);

    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    console.error(err);
    return JSON.stringify(err);
  }
};
