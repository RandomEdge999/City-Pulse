import { useEffect, useRef } from 'react'
import { ZoneData } from '../types/cityPulse'
import * as echarts from 'echarts'

interface MoodTimelineProps {
  zones: ZoneData[]
}

export default function MoodTimeline({ zones }: MoodTimelineProps): JSX.Element {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Generate mock timeline data for the last 24 hours
    const now = new Date()
    const timeData = []
    const moodData = []
    const postData = []
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      timeData.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
      
      // Generate realistic mood variations
      const baseMood = 60 + Math.sin(i * 0.3) * 20 + (Math.random() - 0.5) * 10
      moodData.push(Math.max(0, Math.min(100, baseMood)))
      
      // Generate realistic post count variations
      const basePosts = 3 + Math.sin(i * 0.5) * 2 + Math.random() * 3
      postData.push(Math.max(0, Math.round(basePosts)))
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        textStyle: {
          color: '#ffffff'
        },
        formatter: function(params: any) {
          const mood = params[0]?.value
          const posts = params[1]?.value
          return `
            <div class="p-2">
              <div class="font-bold text-blue-400 mb-2">${params[0]?.axisValue}</div>
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="text-green-300">Mood: ${mood}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-blue-300">Posts: ${posts}</span>
                </div>
              </div>
            </div>
          `
        }
      },
      legend: {
        data: ['City Mood', 'Social Posts'],
        textStyle: {
          color: '#e2e8f0'
        },
        top: 10
      },
      xAxis: {
        type: 'category',
        data: timeData,
        axisLine: {
          lineStyle: {
            color: '#475569'
          }
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Mood Index',
          min: 0,
          max: 100,
          axisLine: {
            lineStyle: {
              color: '#475569'
            }
          },
          axisLabel: {
            color: '#94a3b8',
            formatter: '{value}'
          },
          splitLine: {
            lineStyle: {
              color: '#334155',
              type: 'dashed'
            }
          }
        },
        {
          type: 'value',
          name: 'Post Count',
          min: 0,
          max: 10,
          axisLine: {
            lineStyle: {
              color: '#475569'
            }
          },
          axisLabel: {
            color: '#94a3b8',
            formatter: '{value}'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: 'City Mood',
          type: 'line',
          yAxisIndex: 0,
          data: moodData,
          smooth: true,
          lineStyle: {
            color: '#10b981',
            width: 3,
            shadowColor: '#10b981',
            shadowBlur: 10
          },
          itemStyle: {
            color: '#10b981',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          },
          symbol: 'circle',
          symbolSize: 6,
          emphasis: {
            itemStyle: {
              color: '#ffffff',
              borderColor: '#10b981',
              borderWidth: 3,
              shadowColor: '#10b981',
              shadowBlur: 20
            }
          }
        },
        {
          name: 'Social Posts',
          type: 'bar',
          yAxisIndex: 1,
          data: postData,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1d4ed8' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#60a5fa' },
                { offset: 1, color: '#3b82f6' }
              ]),
              shadowColor: '#3b82f6',
              shadowBlur: 20
            }
          }
        }
      ],
      animation: true,
      animationDuration: 2000,
      animationEasing: 'cubicOut'
    }

    chartInstance.current.setOption(option)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [zones])

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-600 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">📊 Mood Timeline</h3>
          <p className="text-slate-400 text-sm">
            Real-time city mood and social activity over the last 24 hours
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-300 text-sm font-medium">Live Data</span>
        </div>
      </div>
      
      <div 
        ref={chartRef} 
        className="w-full h-64"
        style={{ minHeight: '256px' }}
      />
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-slate-300">Mood Index (0-100)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-slate-300">Social Posts</span>
        </div>
      </div>
    </div>
  )
}
