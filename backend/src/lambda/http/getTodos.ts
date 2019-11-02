import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const todosTableIndex = process.env.INDEX_NAME

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
  const result = await docClient.query({
    TableName: todosTable,
    IndexName: todosTableIndex,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items

}
