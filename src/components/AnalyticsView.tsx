import { Segment, WorkItem } from '../types';
import { getRiskLevel } from './WorkItemTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

interface AnalyticsViewProps {
  items: WorkItem[];
  selectedQuarter: string;
}

const SEGMENTS: { id: Segment; title: string }[] = [
  { id: 'READY_FOR_DEV', title: 'Ready for DEV' },
  { id: 'IN_DEV', title: 'In Dev' },
  { id: 'IN_QA', title: 'In QA' },
  { id: 'READY_FOR_PROD', title: 'Ready for Prod' },
  { id: 'IN_PROD', title: 'In Production' },
];

export function AnalyticsView({ items, selectedQuarter }: AnalyticsViewProps) {
  const quarterItems = items.filter(i => {
    if (selectedQuarter === 'Q1_2026') {
      return i.quarter === 'Q1_2026' || i.segment !== 'IN_PROD';
    }
    return i.quarter === selectedQuarter;
  });

  const exportCSV = (segmentId: Segment, segmentTitle: string) => {
    const segItems = quarterItems.filter(i => i.segment === segmentId);
    const headers = ['Jira ID', 'Heading', 'Status', 'Risk Level', 'Days in Stage', 'CM Status'];
    const rows = segItems.map(item => {
      const risk = getRiskLevel(item);
      return [
        item.jiraId,
        `"${item.heading}"`,
        item.status,
        risk.label,
        risk.days.toString(),
        item.cmStatus
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${segmentTitle.replace(/\s+/g, '_')}_${selectedQuarter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data for overall distribution
  const distributionData = SEGMENTS.map(seg => ({
    name: seg.title,
    count: quarterItems.filter(i => i.segment === seg.id).length
  }));

  return (
    <div className="vstack" style={{ gap: '1.5rem', padding: '1.5rem' }}>
      <article className="card" id="tutorial-analytics-distribution">
        <header>
          <h3>Work Items Distribution</h3>
        </header>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="container" style={{ padding: 0 }}>
        <div className="row" style={{ gap: '1.5rem' }}>
          {SEGMENTS.map(segment => {
            const segItems = quarterItems.filter(i => i.segment === segment.id);
            
            const riskCounts = { 'In Progress': 0, 'At Risk': 0, 'On Hold': 0, 'No Risk': 0 };
            segItems.forEach(item => {
              const risk = getRiskLevel(item);
              riskCounts[risk.label as keyof typeof riskCounts]++;
            });

            const pieData = [
              { name: 'In Progress', value: riskCounts['In Progress'] },
              { name: 'At Risk', value: riskCounts['At Risk'] },
              { name: 'On Hold', value: riskCounts['On Hold'] },
              { name: 'No Risk', value: riskCounts['No Risk'] },
            ].filter(d => d.value > 0);

            return (
              <div key={segment.id} className="col-6" style={{ marginBottom: '1.5rem' }}>
                <article className="card" id={`tutorial-analytics-segment-${segment.id}`} style={{ height: '100%' }}>
                  <header className="hstack" style={{ justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>{segment.title}</h3>
                    <button 
                      id={segment.id === 'READY_FOR_DEV' ? 'tutorial-analytics-export' : undefined}
                      onClick={() => exportCSV(segment.id, segment.title)}
                      className="small outline"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </header>
                  
                  <div className="hstack" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{segItems.length}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Items</div>
                  </div>

                  {segItems.length > 0 ? (
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => {
                              let color = 'var(--primary)'; // Blue for In Progress
                              if (entry.name === 'At Risk') color = 'var(--warning)'; // Orange
                              if (entry.name === 'On Hold') color = 'var(--danger)'; // Red
                              if (entry.name === 'No Risk') color = 'var(--success)'; // Green
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div style={{ height: '200px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                      No items in this segment
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
