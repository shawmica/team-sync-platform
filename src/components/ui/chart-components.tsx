
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';

interface ChartProps {
  data: any[];
  categories: string[];
  index: string;
  colors?: string[];
  valueFormatter?: (value: number, category?: string) => string;
  className?: string;
}

export function BarChart({ data, categories, index, colors = ["#60a5fa", "#a78bfa"], valueFormatter, className }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={index} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={40} />
        <Tooltip 
          formatter={(value: number, name: string) => [
            valueFormatter ? valueFormatter(value, name) : value, 
            name.charAt(0).toUpperCase() + name.slice(1)
          ]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        {categories.map((category, index) => (
          <Bar 
            key={category} 
            dataKey={category} 
            fill={colors[index % colors.length]} 
            radius={[4, 4, 0, 0]} 
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart({ data, categories, index, colors = ["#60a5fa", "#a78bfa", "#34d399"], valueFormatter, className }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={index} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} width={40} />
        <Tooltip 
          formatter={(value: number, name: string) => [
            valueFormatter ? valueFormatter(value, name) : value, 
            name.charAt(0).toUpperCase() + name.slice(1)
          ]}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        {categories.map((category, index) => (
          <Line 
            key={category} 
            type="monotone" 
            dataKey={category} 
            stroke={colors[index % colors.length]} 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
