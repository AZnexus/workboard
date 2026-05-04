export function getBodyPreview(body: string | null): string {
  if (!body) return ""
  const cleanText = body.replace(/^[#\-*]+\s/gm, "").replace(/\[[ xX]\]\s/g, "").replace(/\r?\n/g, " ").trim()
  return cleanText.length > 100 ? `${cleanText.slice(0, 100)}...` : cleanText
}

export function getActionStats(body: string | null): { total: number; completed: number } | null {
  if (!body) return null
  const matches = body.match(/\[([ xX])\]/g)
  if (!matches) return null
  const total = matches.length
  const completed = matches.filter((item) => item.includes("x") || item.includes("X")).length
  return { total, completed }
}
