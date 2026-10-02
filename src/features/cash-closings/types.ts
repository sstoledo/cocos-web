// Types transcribed from the B13 cash-closings backend contract
// (obs #1292). Do NOT invent new shapes here.
// Monetary values are decimal strings (e.g. "1250.00") per repo convention.
export interface CashClosing {
  id: string;
  periodStart: string;
  periodEnd: string;
  expectedCash: string;
  expectedCard: string;
  expectedTransfer: string;
  declaredCash: string;
  difference: string;
  salesCount: number;
  notes: string | null;
  createdAt: string;
  closedBy: {
    id: string;
    name: string;
  };
}

// Live preview of the open period. periodStart is null when there is
// nothing to close yet (no open cash register activity).
export interface ClosingPreview {
  periodStart: string | null;
  expectedCash: string;
  expectedCard: string;
  expectedTransfer: string;
  salesCount: number;
}

export interface CreateCashClosingInput {
  declaredCash: string;
  notes?: string;
}

export interface ListCashClosingsParams {
  page?: number;
  limit?: number;
}

export interface CashClosingListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CashClosingListResponse {
  data: CashClosing[];
  meta: CashClosingListMeta;
}
