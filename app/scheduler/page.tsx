"use client";

import { useMemo, useState } from 'react';
import { demoJobs, optimizeSchedule, Job } from '../../lib/scheduling';

export default function SchedulerPage() {
  const [startLat, setStartLat] = useState(-26.2041); // Johannesburg CBD
  const [startLng, setStartLng] = useState(28.0473);
  const [startTime, setStartTime] = useState('08:00');
  const [jobs, setJobs] = useState<Job[]>(demoJobs());

  const result = useMemo(() => optimizeSchedule(jobs, startLat, startLng, startTime), [jobs, startLat, startLng, startTime]);

  const totalH = (m: number) => `${Math.floor(m/60)}h ${Math.round(m%60)}m`;

  return (
    <div>
      <h1>Job Scheduling & Route Optimization</h1>
      <div className="section">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
          <div>
            <label>Start Latitude</label>
            <input type="number" value={startLat} onChange={e=>setStartLat(parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Start Longitude</label>
            <input type="number" value={startLng} onChange={e=>setStartLng(parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Planned Route</h3>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Job</th>
              <th>Start</th>
              <th>End</th>
              <th>Travel (min)</th>
              <th>Duration (min)</th>
              <th>SLA</th>
              <th>Weather</th>
            </tr>
          </thead>
          <tbody>
            {result.route.map((j, idx) => (
              <tr key={j.id}>
                <td>{idx+1}</td>
                <td>{j.name}</td>
                <td>{j.scheduledStart}</td>
                <td>{j.scheduledEnd}</td>
                <td>{j.travelMinutes.toFixed(0)}</td>
                <td>{j.durationMinutes}</td>
                <td>{j.slaPriority}</td>
                <td>{`${Math.round((j.rainProbability ?? 0)*100)}% rain, ${j.irradiance ?? '?'} W/m?`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p><strong>Total travel:</strong> {totalH(result.totalTravelMinutes)} ? <strong>Total work:</strong> {totalH(result.totalWorkMinutes)} ? <strong>Total day:</strong> {totalH(result.totalMinutes)}</p>
      </div>

      <div className="section">
        <h3>Edit Jobs (JSON)</h3>
        <p>Advanced: paste/edit your job list below.</p>
        <textarea rows={12} value={JSON.stringify(jobs, null, 2)} onChange={e=>{
          try { setJobs(JSON.parse(e.target.value)); } catch {}
        }} />
      </div>
    </div>
  );
}
