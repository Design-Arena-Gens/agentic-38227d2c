export type Job = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  durationMinutes: number;
  preferredWindow?: { start: string; end: string }; // HH:MM local
  slaPriority: number; // 1 (low) - 5 (critical)
  rainProbability?: number; // 0..1
  irradiance?: number; // W/m^2
};

export type ScheduledJob = Job & {
  scheduledStart: string; // HH:MM
  scheduledEnd: string; // HH:MM
  travelMinutes: number;
};

export type ScheduleResult = {
  route: ScheduledJob[];
  totalTravelMinutes: number;
  totalWorkMinutes: number;
  totalMinutes: number;
};

const KM_PER_MIN_AT_40KPH = 40 / 60; // ~0.666.. km per min

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function travelMinutesBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const km = haversineKm(aLat, aLng, bLat, bLng);
  return km / KM_PER_MIN_AT_40KPH; // minutes
}

function scoreJob(
  currentLat: number,
  currentLng: number,
  currentTimeMin: number,
  job: Job
): number {
  const travel = travelMinutesBetween(currentLat, currentLng, job.lat, job.lng);
  const arrival = currentTimeMin + travel;

  let score = travel; // base is travel minutes

  if (job.preferredWindow) {
    const startW = toMinutes(job.preferredWindow.start);
    const endW = toMinutes(job.preferredWindow.end);
    if (arrival < startW) {
      // early arrival penalty proportional to earliness (wait time)
      score += (startW - arrival) * 0.5; // waiting is cheaper than travel
    } else if (arrival > endW) {
      // window miss penalty
      score += 60; // flat penalty for missing window
    }
  }

  if (typeof job.rainProbability === 'number') {
    score += job.rainProbability * 30; // up to 30 min penalty for high rain risk
  }

  if (typeof job.irradiance === 'number') {
    const deficit = Math.max(0, 500 - job.irradiance); // below 500 W/m2 worse
    score += deficit * 0.05; // up to ~25 penalty if irradiance is very low
  }

  // Higher SLA priority reduces score slightly to prefer it
  score -= job.slaPriority * 5;

  return score;
}

export function optimizeSchedule(
  jobs: Job[],
  startLat: number,
  startLng: number,
  startTimeHHMM = '08:00'
): ScheduleResult {
  const remaining = [...jobs];
  let currentLat = startLat;
  let currentLng = startLng;
  let currentTimeMin = toMinutes(startTimeHHMM);
  const route: ScheduledJob[] = [];
  let totalTravelMinutes = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const s = scoreJob(currentLat, currentLng, currentTimeMin, remaining[i]);
      if (s < bestScore) {
        bestScore = s;
        bestIdx = i;
      }
    }

    const next = remaining.splice(bestIdx, 1)[0];
    const travel = travelMinutesBetween(currentLat, currentLng, next.lat, next.lng);
    const start = currentTimeMin + travel;
    const end = start + next.durationMinutes;

    route.push({
      ...next,
      travelMinutes: travel,
      scheduledStart: toHHMM(start),
      scheduledEnd: toHHMM(end),
    });

    totalTravelMinutes += travel;
    currentTimeMin = end;
    currentLat = next.lat;
    currentLng = next.lng;
  }

  const totalWorkMinutes = jobs.reduce((a, j) => a + j.durationMinutes, 0);
  return {
    route,
    totalTravelMinutes,
    totalWorkMinutes,
    totalMinutes: totalTravelMinutes + totalWorkMinutes,
  };
}

export function demoJobs(): Job[] {
  return [
    {
      id: 'J1',
      name: 'Retail Rooftop - Sandton',
      lat: -26.1076,
      lng: 28.0567,
      durationMinutes: 120,
      preferredWindow: { start: '09:00', end: '13:00' },
      slaPriority: 5,
      rainProbability: 0.2,
      irradiance: 650,
    },
    {
      id: 'J2',
      name: 'Office Park - Rosebank',
      lat: -26.1457,
      lng: 28.0410,
      durationMinutes: 90,
      preferredWindow: { start: '10:00', end: '16:00' },
      slaPriority: 3,
      rainProbability: 0.1,
      irradiance: 700,
    },
    {
      id: 'J3',
      name: 'Warehouse - Midrand',
      lat: -25.9995,
      lng: 28.1283,
      durationMinutes: 150,
      preferredWindow: { start: '08:00', end: '12:00' },
      slaPriority: 4,
      rainProbability: 0.35,
      irradiance: 520,
    },
  ];
}
