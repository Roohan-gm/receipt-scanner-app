import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getReceipts } from '../utils/storage';

type CategoryItem = { name: string; amount: number; percentage: string };
type MonthlyData = { total: number; categories: CategoryItem[] };

const screenWidth = Dimensions.get('window').width;

export default function MonthlySummaryScreen() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ total: 0, categories: [] });
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    const receipts = (await getReceipts()) ?? [];
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(currentMonthStr);

    const monthlyReceipts = receipts.filter((r) => r.date?.startsWith(currentMonthStr));
    const total = monthlyReceipts.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

    const map: Record<string, number> = {};
    monthlyReceipts.forEach((r) => {
      const cat = r.category || 'Other';
      map[cat] = (map[cat] || 0) + (Number(r.total_amount) || 0);
    });

    const categories = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: total ? ((amount / total) * 100).toFixed(1) : '0.0',
    }));

    setMonthlyData({ total, categories });
  };

  /* ----------  Chart-Kit data shapes  ---------- */
  const pieData = monthlyData.categories.map((c, i) => ({
    name: c.name,
    population: c.amount,
    color: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][i % 6],
    legendFontColor: '#000',
    legendFontSize: 12,
  }));

  const barData = {
    labels: monthlyData.categories.map((c) => c.name.slice(0, 8)), // truncate long names
    datasets: [{ data: monthlyData.categories.map((c) => c.amount) }],
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50 p-4">
      <Text className="my-2 text-center text-xl font-bold tracking-tight text-slate-900">
        {currentMonth} Expenses
      </Text>

      <View className="mx-6 mb-5 items-center rounded-2xl bg-white px-6 py-5 shadow-sm">
        <Text className="text-sm font-medium tracking-wide text-slate-500 uppercase">
          Month Total
        </Text>
        <Text className="mt-1 text-3xl font-semibold text-slate-900">
          ${monthlyData.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {monthlyData.categories.length > 0 && (
        <>
          {/* Pie */}
          <View className="mx-auto mb-2 items-center rounded-2xl bg-white px-4 py-5 shadow-sm">
            {/* Heading */}
            <Text className="mb-8 text-xl font-semibold tracking-tight text-slate-800">
              Category Breakdown
            </Text>

            {/* Pie */}
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0, // whole numbers look cleaner
                color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, // tailwind sky-500
                labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`, // slate-700
                propsForLabels: {
                  fontSize: 12,
                  fontFamily: 'Inter_600SemiBold', // optional custom font
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15" // centre the chart
              absolute // show absolute values
              hasLegend={true}
              style={{ marginVertical: -10 }} // tighten vertical space
            />

            {/* Optional subtle caption */}
            <Text className="mt-3 text-xs text-slate-400">Values shown in USD</Text>
          </View>

          {/* Bar */}
          <View className="mx-auto mb-24 rounded-2xl bg-white px-4 py-5 shadow-md">
            {/* Heading */}
            <Text className="mb-4 text-center text-xl font-semibold tracking-tight text-slate-800">
              Expenses by Category
            </Text>

            {/* Bar chart */}
            <BarChart
              data={barData}
              width={screenWidth - 64}
              height={250}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`, // Tailwind sky-500
                labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`, // slate-700
                propsForBackgroundLines: { stroke: '#e2e8f0' }, // subtle grid
                propsForLabels: { fontSize: 11, fontFamily: 'Inter_500Medium' },
                propsForVerticalLabels: { dy: 4 },
              }}
              verticalLabelRotation={0}
              fromZero
              yAxisLabel="$"
              yAxisSuffix=""
              showValuesOnTopOfBars
              showBarTops={false} // cleaner without the tiny caps
              withInnerLines={false}
              style={{
                borderRadius: 12,
                marginVertical: 6,
              }}
            />

            {/* Optional footer note */}
            <Text className="mt-2 text-center text-xs text-slate-400">
              Values in USD · Current month
            </Text>
          </View>
        </>
      )}

      {monthlyData.categories.length === 0 && (
        <View className="mt-20 items-center">
          <Text className="text-lg text-gray-500">No expenses recorded for this month</Text>
        </View>
      )}
    </ScrollView>
  );
}
