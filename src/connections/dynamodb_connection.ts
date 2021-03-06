import { Connection } from "./connection";

import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

import * as HTTP from "http";
import * as HTTPS from "https";

const AWSXRay = require("aws-xray-sdk-core");

export class DynamoDBConnection implements Connection {
  constructor(options: {
    endpoint: string | undefined,
    enableAWSXray: boolean,
  }) {
    const dynamoDBOptions = {
      endpoint: options.endpoint,
      httpOptions: {
        agent: this.httpAgent(options.endpoint),
      }
    };

    if (options.enableAWSXray) {
      const aws = AWSXRay.captureAWS(AWS);
      this.__client = new aws.DynamoDB(dynamoDBOptions);
      this.__documentClient = new aws.DynamoDB.DocumentClient({
        service: this.__client,
      });
    } else {
      this.__client = new DynamoDB(dynamoDBOptions);
      this.__documentClient = new DynamoDB.DocumentClient({
        service: this.__client,
      });
    }
  }

  private httpAgent(endpoint: string | undefined) {
    if (endpoint && endpoint.startsWith("http://")) {
      return new HTTP.Agent({
        keepAlive: true
      });
    } else {
      return new HTTPS.Agent({
        rejectUnauthorized: true,
        keepAlive: true
      });
    }
  }

  private __documentClient: AWS.DynamoDB.DocumentClient;
  public get documentClient() {
    return this.__documentClient;
  }

  private __client: AWS.DynamoDB;
  public get client() {
    return this.__client;
  }
}