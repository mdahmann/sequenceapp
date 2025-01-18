import { Client, query as q } from 'faunadb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const client = new Client({
  secret: process.env.FAUNA_SECRET_KEY!
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

async function getUserFromToken(token: string): Promise<JWTPayload | null> {
  try {
    return verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await client.query(
      q.Map(
        q.Paginate(
          q.Match(q.Index('sequences_by_user'), user.userId)
        ),
        q.Lambda('ref', 
          q.Let(
            {
              doc: q.Get(q.Var('ref'))
            },
            {
              id: q.Select(['ref', 'id'], q.Var('doc')),
              ...q.Select(['data'], q.Var('doc'))
            }
          )
        )
      )
    );

    return NextResponse.json({ sequences: (result as any).data });
  } catch (error) {
    console.error('Error getting sequences:', error);
    return NextResponse.json({ error: 'Failed to get sequences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const data = await request.json();
    
    const sequence = {
      ...data,
      userId: user.userId,
      created: new Date().toISOString()
    };

    const result = await client.query(
      q.Create(
        q.Collection('sequences'),
        { data: sequence }
      )
    );

    const savedSequence = {
      id: (result as any).ref.id,
      ...(result as any).data
    };

    return NextResponse.json({ sequence: savedSequence });
  } catch (error) {
    console.error('Error saving sequence:', error);
    return NextResponse.json({ error: 'Failed to save sequence' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await request.json();
    
    // Verify the sequence belongs to the user
    const sequence = await client.query(
      q.Get(q.Ref(q.Collection('sequences'), id))
    );

    if ((sequence as any).data.userId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await client.query(
      q.Delete(q.Ref(q.Collection('sequences'), id))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sequence:', error);
    return NextResponse.json({ error: 'Failed to delete sequence' }, { status: 500 });
  }
} 