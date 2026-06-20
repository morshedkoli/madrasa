const API = '/api/sql'

export interface QueryResult<T = any> {
  data: T[] | null
  error: Error | null
  count: number | null
}

export async function sql(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<QueryResult<any>> {
  return query(strings, ...values)
}

async function api(body: any) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await res.json()
  } catch (err: any) {
    return { data: null, error: err, count: null }
  }
}

export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<QueryResult<T>> {
  const result = await api({ type: 'tagged', strings, values })
  if (result.error) return { data: null, error: new Error(result.error), count: null }
  return { data: result.data as T[], error: null, count: result.count }
}

export async function queryOne<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<{ data: T | null; error: Error | null }> {
  const result = await api({ type: 'tagged', strings, values })
  if (result.error) return { data: null, error: new Error(result.error) }
  return { data: (result.data as T[])?.[0] || null, error: null }
}

export async function insert<T = any>(
  table: string,
  data: Record<string, any>
): Promise<{ data: T | null; error: Error | null }> {
  const result = await api({ type: 'insert', table, data })
  if (result.error) return { data: null, error: new Error(result.error) }
  return { data: result.data as T, error: null }
}

export async function update<T = any>(
  table: string,
  data: Record<string, any>,
  whereColumn: string,
  whereValue: any
): Promise<{ data: T | null; error: Error | null }> {
  // Update not directly supported in API, use raw
  const keys = Object.keys(data)
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ')
  const values = keys.map(k => data[k])
  const sql = `UPDATE ${table} SET ${sets} WHERE ${whereColumn} = $${keys.length + 1} RETURNING *`
  const result = await api({ type: 'raw', sql, params: [...values, whereValue] })
  if (result.error) return { data: null, error: new Error(result.error) }
  return { data: (result.data as T[])?.[0] || null, error: null }
}

export async function remove(
  table: string,
  whereColumn: string,
  whereValue: any
): Promise<{ error: Error | null }> {
  const result = await api({ type: 'remove', table, column: whereColumn, value: whereValue })
  if (result.error) return { error: new Error(result.error) }
  return { error: null }
}

export function db(table: string) {
  const builder = {
    _where: [] as string[],
    _values: [] as any[],
    _orderBy: '',
    _limit: 0,
    _offset: 0,

    where(col: string, val: any) {
      this._where.push(`${col} = $${this._values.length + 1}`)
      this._values.push(val)
      return this
    },

    in(col: string, vals: any[]) {
      const placeholders = vals.map((_, i) => `$${this._values.length + i + 1}`).join(', ')
      this._where.push(`${col} IN (${placeholders})`)
      this._values.push(...vals)
      return this
    },

    gte(col: string, val: any) {
      this._where.push(`${col} >= $${this._values.length + 1}`)
      this._values.push(val)
      return this
    },

    lte(col: string, val: any) {
      this._where.push(`${col} <= $${this._values.length + 1}`)
      this._values.push(val)
      return this
    },

    ilike(col: string, val: string) {
      this._where.push(`${col} ILIKE $${this._values.length + 1}`)
      this._values.push(val)
      return this
    },

    order(col: string, dir: 'asc' | 'desc' = 'asc') {
      this._orderBy = ` ORDER BY ${col} ${dir}`
      return this
    },

    limit(n: number) {
      this._limit = n
      return this
    },

    offset(n: number) {
      this._offset = n
      return this
    },

    async select(columns = '*'): Promise<QueryResult<any>> {
      let sql = `SELECT ${columns} FROM ${table}`
      if (this._where.length) sql += ` WHERE ${this._where.join(' AND ')}`
      sql += this._orderBy
      if (this._limit) sql += ` LIMIT ${this._limit}`
      if (this._offset) sql += ` OFFSET ${this._offset}`
      const result = await api({ type: 'raw', sql, params: this._values })
      if (result.error) return { data: null, error: new Error(result.error), count: null }
      return { data: result.data as any[], error: null, count: result.count }
    },

    async maybeSingle() {
      this._limit = 1
      const result = await this.select()
      return { data: result.data?.[0] || null, error: result.error }
    },

    async single() {
      this._limit = 1
      const result = await this.select()
      if (!result.data?.length) return { data: null, error: new Error('No rows found') }
      return { data: result.data[0], error: null }
    },

    async count() {
      let sql = `SELECT COUNT(*) as count FROM ${table}`
      if (this._where.length) sql += ` WHERE ${this._where.join(' AND ')}`
      const result = await api({ type: 'raw', sql, params: this._values })
      if (result.error) return { count: null, error: new Error(result.error) }
      return { count: Number(result.data?.[0]?.count || 0), error: null }
    },
  }
  return builder
}
