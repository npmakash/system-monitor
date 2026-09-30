# Linux System Manager (Ubuntu Linux)

A lightweight, local, object-oriented web application designed to scan, monitor, and safely manage Ubuntu Linux systems from a clean web-based dashboard.

![Ubuntu System Manager](https://img.shields.io/badge/Ubuntu-24.04%20LTS-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🏗️ Architecture & OOP Design

The application follows strict **Object-Oriented Programming (OOP)**, **Separation of Concerns**, and **Dependency Injection** principles.

```
React Frontend (Vite + TS)  <--->  REST API (Express + TS)  <--->  Linux /proc & System Utilities
   (http://localhost:5173)             (http://127.0.0.1:3001)
```

### Backend Class Structure & Responsibilities (`server/src`)

- **`app/App.ts`**: Express application wrapper. Configures middleware, security checks, error handlers, and route mounts.
- **`config/AppConfig.ts`**: Encapsulates application configuration settings (Port, Host, Environment, Polling intervals).
- **`system/ProcFileReader.ts`**: Safe file reader abstraction for reading Linux `/proc` pseudo-filesystem entries (`/proc/stat`, `/proc/meminfo`, `/proc/uptime`, `/proc/net/dev`).
- **`system/CommandExecutor.ts`**: Implements `ICommandExecutor`. Executes whitelisted binary commands using `child_process.execFile` (prevents shell injection vulnerabilities).
- **`services/CpuService.ts`**: Computes overall and per-core CPU utilization percentages from differential `/proc/stat` snapshots.
- **`services/MemoryService.ts`**: Parses `/proc/meminfo` to compute RAM (Used, Available, Free, Buffers, Cached) and Swap memory usage.
- **`services/DiskService.ts`**: Executes `df` to analyze mounted disk partitions, total/used storage, and filesystem types.
- **`services/NetworkService.ts`**: Computes real-time Rx/Tx network bandwidth speeds per interface from `/proc/net/dev`.
- **`services/SystemMonitorService.ts`**: Composite service implementing `ISystemMonitor`. Aggregates all subsystem services to construct complete system summaries.
- **`controllers/SystemController.ts`**: Express controller layer handling HTTP request/response mappings for system metrics.
- **`middleware/SecurityMiddleware.ts`**: Restricts management API access strictly to local host loopback (`127.0.0.1` / `::1`) and applies HTTP security headers.
- **`middleware/ErrorHandler.ts`**: Centralized error middleware ensuring raw stack traces are never exposed to clients.
- **`utils/Formatter.ts`**: Static helper formatting raw bytes into GB, MB/s, KB/s, uptime strings, and rounded percentages.

---

## 🔒 Security Model

1. **Localhost Binding**: The Node.js system agent binds exclusively to `127.0.0.1`. Remote requests are blocked by default.
2. **No Arbitrary Command Execution**: There is no generic shell execution endpoint. Only predefined, safe system readers are exposed.
3. **Safe Execution**: Utilities use `execFile` without shell interpolation to prevent command injection.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and timestamp |
| `GET` | `/api/system/summary` | Complete system summary (CPU, RAM, Disks, Network, Info) |
| `GET` | `/api/system/cpu` | CPU load percentage & per-core stats |
| `GET` | `/api/system/memory` | Physical RAM & Swap statistics |
| `GET` | `/api/system/disk` | Mounted disk partitions list |
| `GET` | `/api/system/network` | Network interface Rx/Tx throughput speeds |
| `GET` | `/api/system/info` | Hostname, distro, kernel, architecture, uptime |
| `GET` | `/api/processes` | Active Linux process list (PID, CPU %, RAM %, User) |
| `POST`| `/api/processes/:pid/kill` | Safely terminate user process |
| `GET` | `/api/cleaner/scan` | Scan for safe recoverable junk files |
| `POST`| `/api/cleaner/clean` | Reclaim disk space from selected junk categories |

---

## 🔄 Data Flow (Linux → Node.js → React)

1. **Linux Kernel / System**: Exposes low-level diagnostics via `/proc/stat`, `/proc/meminfo`, `/proc/net/dev`, and system utilities.
2. **Node.js System Agent**: `ProcFileReader` and `CommandExecutor` efficiently read `/proc` files without heavy shell overhead. Services calculate rates and return typed Domain models (`CpuInfo`, `MemoryInfo`, etc.).
3. **Express Controller**: Exposes JSON REST endpoints over local HTTP (`http://127.0.0.1:3001`).
4. **React Frontend**: `api.ts` service polls the local agent (configurable 1s/2s/5s intervals), updating reactive UI state components rendered in a clean glassmorphism dark dashboard.

---

## 🚀 How to Run on Ubuntu

### Prerequisites
- Node.js `v18+` or `v20+`
- `npm`

### Installation & Execution

1. Clone or navigate to the repository directory:
   ```bash
   cd "System Monitor"
   ```

2. Install all dependencies for root, server, and client:
   ```bash
   npm run install:all
   ```

3. Run both backend agent & frontend client in development mode:
   ```bash
   npm run dev
   ```

   - **Frontend UI**: Open [http://localhost:5173](http://localhost:5173) in your browser.
   - **Backend System Agent**: Running on `http://127.0.0.1:3001`.

4. Run Backend Tests:
   ```bash
   npm test
   ```

5. Build for Production:
   ```bash
   npm run build
   ```
