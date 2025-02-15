export type Todo = {
  id: string
  status: 'pending' | 'finished' | 'cancelled'
  title: string
  createdAt: Date
  updatedAt?: Date
  finishedAt?: Date
}
