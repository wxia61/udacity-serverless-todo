import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  let userId = event.requestContext.authorizer['principalId'];

  let items = await getTodosPerUser(userId)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
    }
}


async function getTodosPerUser(userId: string) {
  const result = await docClient.scan({
    TableName: todosTable,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId,
    },
  }).promise()

  return result.Items
}
