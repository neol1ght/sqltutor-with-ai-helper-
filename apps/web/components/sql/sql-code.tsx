import { Fragment } from 'react'
import { cn } from '@/lib/utils'

const KEYWORDS = new Set([
  'select', 'from', 'where', 'join', 'inner', 'left', 'right', 'full', 'outer', 'on',
  'group', 'by', 'order', 'having', 'limit', 'offset', 'as', 'and', 'or', 'not', 'in',
  'is', 'null', 'desc', 'asc', 'distinct', 'with', 'union', 'all', 'case', 'when', 'then',
  'else', 'end', 'over', 'partition', 'insert', 'into', 'values', 'update', 'set',
  'delete', 'create', 'table', 'explain', 'analyze', 'like', 'between', 'exists',
])

const FUNCTIONS = new Set([
  'count', 'sum', 'avg', 'min', 'max', 'round', 'rank', 'dense_rank', 'row_number',
  'lag', 'lead', 'coalesce', 'now', 'lower', 'upper', 'date_trunc',
])

const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_'])/g

export function highlightSql(source: string) {
  const nodes: React.ReactNode[] = []
  let match: RegExpExecArray | null
  let i = 0
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(source)) !== null) {
    const [token, comment, str, num, word] = match
    const key = i++
    if (comment) nodes.push(<span key={key} className="text-muted-foreground/70 italic">{token}</span>)
    else if (str) nodes.push(<span key={key} className="text-warn">{token}</span>)
    else if (num) nodes.push(<span key={key} className="text-warn">{token}</span>)
    else if (word && KEYWORDS.has(word.toLowerCase()))
      nodes.push(<span key={key} className="font-medium text-ai">{token}</span>)
    else if (word && FUNCTIONS.has(word.toLowerCase()))
      nodes.push(<span key={key} className="text-primary">{token}</span>)
    else nodes.push(<Fragment key={key}>{token}</Fragment>)
  }
  return nodes
}

export function SqlCode({ code, className }: { code: string; className?: string }) {
  return (
    <code className={cn('font-mono text-foreground/90', className)}>{highlightSql(code)}</code>
  )
}
