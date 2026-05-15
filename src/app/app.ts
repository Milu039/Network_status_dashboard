import { Component, OnDestroy, signal } from '@angular/core';

type DeviceStatus = 'online' | 'warning' | 'offline';
type AlertSeverity = 'critical' | 'warning' | 'info';

interface MetricCard {
  label: string;
  value: string;
  detail: string;
  trend: string;
  tone: 'good' | 'watch' | 'danger' | 'info';
}

interface Device {
  name: string;
  zone: string;
  ip: string;
  status: DeviceStatus;
  load: number;
  latency: number;
}

interface TopologyNode {
  id: string;
  label: string;
  type: 'server' | 'router' | 'switch';
  x: number;
  y: number;
  status: DeviceStatus;
}

interface TopologyLink {
  from: string;
  to: string;
  load: number;
  status: DeviceStatus;
}

interface Alert {
  severity: AlertSeverity;
  title: string;
  detail: string;
  time: string;
}

interface ActivityPoint {
  hour: string;
  value: number;
}

interface RecentEvent {
  time: string;
  title: string;
  detail: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  protected readonly systemTitle = 'Building Network Status Dashboard';
  protected readonly buildingName = 'North Tower - Level 1 to 8';
  protected readonly currentTime = signal(new Date());
  protected readonly lastRefresh = signal(new Date());
  protected readonly refreshPulse = signal(false);

  protected readonly metrics = signal<MetricCard[]>([
    {
      label: 'Network Uptime',
      value: '99.98%',
      detail: 'Last 24 hours',
      trend: '+0.03%',
      tone: 'good',
    },
    {
      label: 'Active Devices',
      value: '186',
      detail: '5 zones monitored',
      trend: '+12',
      tone: 'info',
    },
    {
      label: 'Avg Latency',
      value: '18 ms',
      detail: 'Core to access edge',
      trend: '-4 ms',
      tone: 'good',
    },
    {
      label: 'Packet Loss',
      value: '0.7%',
      detail: 'Warning threshold 1%',
      trend: '+0.2%',
      tone: 'watch',
    },
  ]);

  protected readonly nodes: TopologyNode[] = [
    { id: 'server', label: 'Main Server', type: 'server', x: 52, y: 14, status: 'online' },
    { id: 'router', label: 'Core Router', type: 'router', x: 52, y: 36, status: 'online' },
    { id: 'floor1', label: 'Floor 1-4', type: 'switch', x: 22, y: 60, status: 'online' },
    { id: 'floor5', label: 'Floor 5-8', type: 'switch', x: 52, y: 60, status: 'warning' },
    { id: 'floor9', label: 'Floor 9-12', type: 'switch', x: 82, y: 60, status: 'online' },
  ];

  protected readonly links: TopologyLink[] = [
    { from: 'server', to: 'router', load: 62, status: 'online' },
    { from: 'router', to: 'floor1', load: 38, status: 'online' },
    { from: 'router', to: 'floor5', load: 81, status: 'online' },
    { from: 'router', to: 'floor9', load: 44, status: 'online' },
  ];

  protected readonly devices = signal<Device[]>([
    { name: 'Core-SW-01', zone: 'MDF Room', ip: '10.20.0.2', status: 'warning', load: 81, latency: 22 },
    { name: 'AP-Lobby-04', zone: 'Ground Lobby', ip: '10.20.14.18', status: 'online', load: 36, latency: 12 },
    { name: 'CCTV-GW-02', zone: 'Security Office', ip: '10.20.7.4', status: 'online', load: 58, latency: 17 },
    { name: 'Access-SW-F5', zone: 'Floor 5', ip: '10.20.5.1', status: 'warning', load: 88, latency: 29 },
    { name: 'Access-SW-F8', zone: 'Floor 8', ip: '10.20.8.1', status: 'offline', load: 0, latency: 0 },
  ]);

  protected readonly alerts = signal<Alert[]>([
    {
      severity: 'critical',
      title: 'Floor 8 access switch unreachable',
      detail: 'No heartbeat received from Access-SW-F8 for 7 minutes.',
      time: '2 min ago',
    },
    {
      severity: 'warning',
      title: 'Core switch utilization high',
      detail: 'Backbone traffic is above 80% during peak occupancy.',
      time: '8 min ago',
    },
    {
      severity: 'info',
      title: 'Guest Wi-Fi policy updated',
      detail: 'Bandwidth cap changed for conference hall SSID.',
      time: '24 min ago',
    },
  ]);

  protected readonly activity = signal<ActivityPoint[]>([
    { hour: '00', value: 24 },
    { hour: '01', value: 18 },
    { hour: '02', value: 16 },
    { hour: '03', value: 21 },
    { hour: '04', value: 30 },
    { hour: '05', value: 42 },
    { hour: '06', value: 54 },
    { hour: '07', value: 68 },
    { hour: '08', value: 86 },
    { hour: '09', value: 91 },
    { hour: '10', value: 78 },
    { hour: '11', value: 83 },
    { hour: '12', value: 74 },
    { hour: '13', value: 80 },
    { hour: '14', value: 88 },
    { hour: '15', value: 92 },
    { hour: '16', value: 84 },
    { hour: '17', value: 70 },
    { hour: '18', value: 58 },
    { hour: '19', value: 49 },
    { hour: '20', value: 41 },
    { hour: '21', value: 35 },
    { hour: '22', value: 31 },
    { hour: '23', value: 27 },
  ]);

  protected readonly recentEvents = signal<RecentEvent[]>([
    {
      time: '16:42',
      title: 'Backup WAN link tested',
      detail: 'Failover completed in 4.2 seconds with no dropped sessions.',
    },
    {
      time: '16:28',
      title: 'New device registered',
      detail: 'Environmental sensor joined VLAN 42 in the plant room.',
    },
    {
      time: '16:11',
      title: 'Wireless roaming spike',
      detail: 'AP group Level 3 handled 128 roaming events in 10 minutes.',
    },
    {
      time: '15:57',
      title: 'PoE budget notice',
      detail: 'Floor 5 switch is using 89% of available PoE capacity.',
    },
  ]);

  private readonly clock = window.setInterval(() => {
    this.currentTime.set(new Date());
  }, 1000);

  ngOnDestroy(): void {
    window.clearInterval(this.clock);
  }

  protected refreshDashboard(): void {
    this.lastRefresh.set(new Date());
    this.refreshPulse.set(true);

    this.metrics.update((metrics) =>
      metrics.map((metric) => {
        if (metric.label === 'Avg Latency') {
          const latency = 15 + Math.floor(Math.random() * 9);
          return { ...metric, value: `${latency} ms`, trend: latency < 20 ? '-3 ms' : '+2 ms' };
        }

        if (metric.label === 'Packet Loss') {
          const loss = (0.4 + Math.random() * 0.5).toFixed(1);
          return { ...metric, value: `${loss}%`, trend: Number(loss) < 0.8 ? '-0.1%' : '+0.1%' };
        }

        return metric;
      }),
    );

    this.devices.update((devices) =>
      devices.map((device) =>
        device.status === 'offline'
          ? device
          : {
              ...device,
              load: Math.min(95, Math.max(18, device.load + Math.floor(Math.random() * 13) - 6)),
              latency: Math.max(9, device.latency + Math.floor(Math.random() * 7) - 3),
            },
      ),
    );

    window.setTimeout(() => this.refreshPulse.set(false), 700);
  }

  protected formattedTime(date: Date): string {
    return new Intl.DateTimeFormat('en-MY', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  protected shortTime(date: Date): string {
    return new Intl.DateTimeFormat('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  protected nodeById(id: string): TopologyNode {
    const node = this.nodes.find((item) => item.id === id);

    if (!node) {
      throw new Error(`Topology node ${id} was not found`);
    }

    return node;
  }

  protected onlineDeviceCount(): number {
    return this.devices().filter((device) => device.status === 'online').length;
  }

  protected issueCount(): number {
    return this.devices().filter((device) => device.status !== 'online').length;
  }
}
