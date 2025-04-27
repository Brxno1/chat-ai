'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { NumberTicker } from './magicui/number-ticker'
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function ChartDemoOne() {
  return (
    <Card className="drop-shadow-md">
      <CardHeader>
        <CardTitle>Bar Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="desktop"
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <XAxis
              dataKey="month"
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={3} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={3} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="mt-[-10px] flex-col items-start gap-1 text-sm text-muted-foreground">
        <div className="flex gap-1">
          Trending up by <NumberTicker value={5.2} decimalPlaces={1} />% this
          month <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-[14px] text-xs leading-none text-muted-foreground/70">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
