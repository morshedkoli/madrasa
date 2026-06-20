import { NextResponse } from 'next/server'
import { sql as neonSql, insert as dbInsert, remove, query } from '@/lib/db-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === 'tagged') {
      const { strings, values } = body
      // Reconstruct raw property lost during JSON serialization
      const reconstructed = Object.assign([...strings], { raw: [...strings] }) as TemplateStringsArray
      const rows = await neonSql(reconstructed, ...values)
      return NextResponse.json({ data: rows, error: null, count: (rows as any[]).length })
    }

    if (type === 'raw') {
      const { sql, params } = body
      const result = await query(sql, params || [])
      return NextResponse.json(result)
    }

    if (type === 'insert') {
      const { table, data } = body
      const result = await dbInsert(table, data)
      return NextResponse.json(result)
    }

    if (type === 'remove') {
      const { table, column, value } = body
      const result = await remove(table, column, value)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    console.error('[api:sql]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
