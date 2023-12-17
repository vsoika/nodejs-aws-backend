import {
  PolicyDocument,
  APIGatewayTokenAuthorizerEvent,
  Context,
  Callback,
  AuthResponse,
} from "aws-lambda";

export const headers = {
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

export const lambdaHandler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  try {
    const token = event.authorizationToken;

    if (!token) {
      callback(new Error("Unauthorized: Invalid token")); // Return a 401 Unauthorized response
      return;
    }

    const encodedToken = token.split(" ")[1];
    const decodedToken = Buffer.from(encodedToken, "base64").toString();

    if (token) {
      if (decodedToken === process.env.GITHUB_CREDENTIALS) {
        callback(null, generatePolicy("user", "Allow", event.methodArn));
      } else {
        callback(null, generatePolicy("user", "Deny", event.methodArn));
      }
    }
  } catch (err) {
    callback(`Error: Invalid token: ${err}`); // Return a 500 Invalid token response
  }
};

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string
): AuthResponse => {
  const authResponse = {} as AuthResponse;

  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {} as PolicyDocument;
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};
