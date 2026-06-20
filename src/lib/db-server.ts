import { neon } from '@neondatabase/serverless'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) throw new Error('DATABASE_URL not set')

export const sql = neon(databaseUrl)

export async function query(sqlString: string, params: any[] = []) {
  try {
    const rows = await sql.query(sqlString, params)
    return { data: rows as any[], error: null, count: (rows as any[]).length }
  } catch (err: any) {
    return { data: null, error: err as Error, count: null }
  }
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data)
  const cols = keys.join(', ')
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
  const values = keys.map(k => data[k])
  try {
    const rows = await sql.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`, values)
    return { data: (rows as any[])[0] || null, error: null }
  } catch (err: any) {
    return { data: null, error: err as Error }
  }
}

export async function update(table: string, data: Record<string, any>, whereColumn: string, whereValue: any) {
  const keys = Object.keys(data)
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const values = keys.map(k => data[k])
  try {
    const rows = await sql.query(`UPDATE ${table} SET ${sets} WHERE ${whereColumn} = $${keys.length + 1} RETURNING *`, [...values, whereValue])
    return { data: (rows as any[])[0] || null, error: null }
  } catch (err: any) {
    return { data: null, error: err as Error }
  }
}

export async function remove(table: string, whereColumn: string, whereValue: any) {
  try {
    await sql.query(`DELETE FROM ${table} WHERE ${whereColumn} = $1`, [whereValue])
    return { error: null }
  } catch (err: any) {
    return { error: err as Error }
  }
}
