import { actionGetTodos } from '@/app/api/todo/actions/get-todos'
import { ReturnTypeWithoutPromise } from '@/types/return-type-without-promise'

export type Todo = ReturnTypeWithoutPromise<typeof actionGetTodos>[0]
