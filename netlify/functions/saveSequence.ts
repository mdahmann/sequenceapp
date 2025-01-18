import { Handler } from '@netlify/functions';
import { Client, query as q } from 'faunadb';

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY!
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const data = JSON.parse(event.body || '');
    
    const sequence = {
      ...data,
      created: new Date().toISOString()
    };

    const result = await client.query(
      q.Create(
        q.Collection('sequences'),
        { data: sequence }
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error saving sequence:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save sequence' })
    };
  }
}; 