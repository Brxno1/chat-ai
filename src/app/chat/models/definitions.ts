import { Model } from '@/types/model'

export const models: Model[] = [
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google.com',
    premium: false,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google.com',
    premium: false,
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash Exp',
    premium: false,
    provider: 'google.com',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Gemini 2.0 Flash Thinking Exp',
    premium: true,
    provider: 'google.com',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Gemini 2.0 Flash Thinking Exp 01 21',
    premium: true,
    provider: 'google.com',
  },
]
