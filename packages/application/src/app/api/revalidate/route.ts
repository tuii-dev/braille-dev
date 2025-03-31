import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
 
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
 
  if (!path) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
