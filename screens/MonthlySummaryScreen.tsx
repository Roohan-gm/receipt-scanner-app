import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Dimensions, Platform } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getReceipts } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';

type CategoryItem = { name: string; amount: number; percentage: string };
type MonthlyData = { total: number; categories: CategoryItem[] };

const screenWidth = Dimensions.get('window').width;

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export default function MonthlySummaryScreen() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({ total: 0, categories: [] });
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    loadMonthlyData();
  }, []); // Only run once on mount

  useFocusEffect(
    React.useCallback(() => {
      loadMonthlyData();
      return () => {};
    }, [])
  );
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
      amount: parseFloat(amount.toFixed(2)),
      percentage: total ? ((amount / total) * 100).toFixed(1) : '0.0',
    }));

    setMonthlyData({ total: parseFloat(total.toFixed(2)), categories });
  };

  /* ----------  Chart-Kit data shapes  ---------- */
  const PALETTE = [
    '#2563eb', // sky-600  – primary brand
    '#38bdf8', // sky-400
    '#0ea5e9', // sky-500
    '#60a5fa', // blue-400
    '#3b82f6', // blue-500
    '#1d4ed8', // blue-700
  ];

  const pieData = monthlyData.categories.map((c, i) => ({
    name: truncateText(c.name, 12),
    population: c.amount,
    color: PALETTE[i % PALETTE.length],
    legendFontColor: '#111827',
    legendFontSize: 11,
  }));

  // For bar chart, we'll use truncated names for labels but show full names in legend
  const barData = {
    labels: monthlyData.categories.map((c) => truncateText(c.name, 12)),
    datasets: [
      {
        data: monthlyData.categories.map((c) => c.amount),
      },
    ],
  };

  // Custom render for bar chart with better label handling
  const renderBarChart = () => {
    if (monthlyData.categories.length === 0) return null;

    return (
      <View className="mx-auto mb-24 rounded-2xl bg-white px-4 py-5 shadow-md">
        <Text className="mb-4 text-center text-xl font-semibold tracking-tight text-slate-800">
          Expenses by Category
        </Text>

        <BarChart
          data={barData}
          width={screenWidth - 64}
          height={250}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
            propsForBackgroundLines: { stroke: '#e2e8f0' },
            propsForLabels: {
              fontSize: 10,
              fontWeight: '500',
            },
            propsForVerticalLabels: {
              dy: Platform.OS === 'ios' ? 4 : 8,
              fontSize: 10,
            },
          }}
          verticalLabelRotation={0}
          fromZero
          yAxisLabel="$"
          showValuesOnTopOfBars
          showBarTops={false}
          withInnerLines={false}
          style={{
            borderRadius: 12,
            marginVertical: 6,
          }}
        />

        {/* Legend for bar chart showing full category names */}
        <View className="mt-4">
          <Text className="text-md mb-2 text-center font-bold text-slate-600">Categories</Text>
          <View className="flex-row flex-wrap justify-center gap-2 px-2">
            {monthlyData.categories.map((category, index) => (
              <View key={index} className="flex-row items-center">
                <View
                  className="mr-1 h-3 w-3 rounded-full"
                  style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                />
                <Text className="max-w-auto text-xs text-slate-700">{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text className="mt-2 text-center text-xs text-slate-400">
          Values in USD · Current month
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 p-4"
      style={{ backgroundColor: '#E2E2E6' }}>
      <View
        style={{ marginBottom: 10, marginTop: 50, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111827' }}>Monthly Summary</Text>
      </View>

      <Text className="my-2 text-center text-xl font-bold tracking-tight text-slate-900">
        {currentMonth} Expenses
      </Text>

      <View className="mx-6 mb-5 items-center rounded-2xl bg-white px-6 py-5 shadow-sm">
        <Text className="text-sm font-medium tracking-wide text-slate-500 uppercase">
          Month Total
        </Text>
        <Text className="mt-1 text-3xl font-semibold text-slate-900">
          ${monthlyData.total.toFixed(2)}
        </Text>
      </View>

      {monthlyData.categories.length > 0 && (
        <>
          {/* Pie Chart - handles long names better with legend */}
          <View className="mx-auto mb-2 items-center rounded-2xl bg-white px-4 py-5 shadow-sm">
            <Text className="mb-4 text-xl font-semibold tracking-tight text-slate-800">
              Category Breakdown
            </Text>

            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
              style={{ marginVertical: -10 }}
            />

            <Text className="mt-3 text-xs text-slate-400">Values shown in USD</Text>
          </View>

          {/* Bar Chart with improved label handling */}
          {renderBarChart()}
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
