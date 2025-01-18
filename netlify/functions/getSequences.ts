import { Handler } from '@netlify/functions';
import { Client, query as q } from 'faunadb';

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY!
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection('sequences'))),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error getting sequences:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get sequences' })
    };
  }
}; 