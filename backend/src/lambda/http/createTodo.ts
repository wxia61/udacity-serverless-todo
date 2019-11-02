import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'



const docClient = new AWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let userId = event.requestContext.authorizer['principalId'];
  const todoId = uuid.v4()
  const newItem = await createTodo(userId, event, todoId)


  return {
    statusCode: 201,
       headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(
      {
        item :{
        ...newItem,
      }
    }
    )
  }
})

async function createTodo(userId: string, event: any, todoId: string) {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const newItem = {
    userId,
    todoId,
    ...newTodo,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${todoId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: todosTable,
      Item: newItem
    })
    .promise()
  return newItem
}


handler.use(
  cors({
    credentials: true
  })
)

