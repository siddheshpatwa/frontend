import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { suggestRequestName } from '@/lib/ai-agent';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceName, method, url, description } = body;

    if (!workspaceName || !method) {
      return NextResponse.json(
        { error: 'workspaceName and method are required' },
        { status: 400 }
      );
    }

    const result = await suggestRequestName({
      workspaceName,
      method,
      url,
      description,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
