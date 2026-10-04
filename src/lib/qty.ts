/** Same cap as the server: what is in stock, never more than 10 of one line. */
export const MAX_QTY_PER_LINE = 10

export const maxQty = (stock: number) => Math.max(0, Math.min(stock, MAX_QTY_PER_LINE))
