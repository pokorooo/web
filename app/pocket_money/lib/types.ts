export type Status = 'paid' | 'unpaid'

export interface UserProfile {
  id: string
  name: string
  monthly_allowance: number
  public_view?: boolean
}

export interface MonthlyAllowance {
  id: string
  user_id: string
  year: number
  month: number
  amount_given: number
  given_date: string
  status: Status
}

export interface Debt {
  id: string
  user_id: string
  amount: number // +borrow, -repay
  memo?: string
  date: string
  auto_deduct: boolean
}

