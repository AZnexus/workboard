export type PrimitiveListValue = string | number | boolean | undefined | null

export interface CleanSearchParamsOptions<T extends object = Record<string, PrimitiveListValue>> {
  defaults?: Partial<Record<keyof T, PrimitiveListValue>>
}

export function cleanSearchParams<T extends object>(
  values: T,
  options: CleanSearchParamsOptions<T> = {},
): URLSearchParams {
  const params = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(values)) {
    const value = rawValue as PrimitiveListValue
    const defaultValue = options.defaults?.[key as keyof T]
    if (value == null || value === "" || value === defaultValue) {
      continue
    }
    params.set(String(key), String(value))
  }

  return params
}

export function updatePageOnListStateChange<T extends { page?: number }>(
  previousState: T,
  nextState: T,
): number {
  const { page: _previousPage, ...previousWithoutPage } = previousState
  const { page: _nextPage, ...nextWithoutPage } = nextState

  return JSON.stringify(previousWithoutPage) === JSON.stringify(nextWithoutPage)
    ? (nextState.page ?? 1)
    : 1
}
