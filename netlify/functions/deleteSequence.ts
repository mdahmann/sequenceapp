import { Handler } from '@netlify/functions';
import { Client, query as q } from 'faunadb';

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY!
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { id } = JSON.parse(event.body || '');
    
    await client.query(
      q.Delete(q.Ref(q.Collection('sequences'), id))
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Sequence deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting sequence:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete sequence' })
    };
  }
}; 