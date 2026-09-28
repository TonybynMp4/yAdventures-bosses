import { MCFunction, raw } from 'sandstone'

export const NS = 'yadventures-bosses'

/** An mcfunction from its text, one command (or comment, or macro line) per line. */
export function fn(name: string, text: string) {
  const lines = text.replace(/^\n+|\n+$/g, '').split('\n')
  return MCFunction(name, () => {
    for (const line of lines) raw(line)
  })
}

/** SNBT for NBT values written as JSON (quoted keys; true/false are bytes). */
export const snbt = (obj: unknown) => JSON.stringify(obj)

/** Python-style float literal: 1 -> "1.0", -0 -> "-0.0". */
export const pyFloat = (x: number) =>
  Number.isInteger(x) ? `${x < 0 || Object.is(x, -0) ? '-' : ''}${Math.abs(x).toFixed(1)}` : `${x}`

export const range = (n: number) => [...Array(n).keys()]

export const GRAY = { color: 'gray', italic: false }
export const BLUE = { color: 'blue', italic: false }
