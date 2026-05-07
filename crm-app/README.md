# NexusCRM — Full Stack CRM on Aurora MySQL

React + Node.js/Express app deployed as a Kubernetes pod,
connected to **Aurora MySQL** with separate **Writer** and **Reader** endpoints.

---

## Architecture

```
Browser ──► K8s Service ──► Pod (React SPA + Express API)
                                    │
                    ┌───────────────┴────────────────┐
                    │ writerPool                     │ readerPool
                    ▼                                ▼
         Aurora Writer Endpoint          Aurora Reader Endpoint
         (INSERT / UPDATE / DELETE)      (SELECT / COUNT)
```

---

## Quick Start

### 1. Run Schema
```bash
mysql -h <WRITER_HOST> -u admin -p < schema.sql
```

### 2. Configure K8s Secrets & ConfigMap
```bash
# Edit your endpoints and credentials
vim k8s/configmap.yaml   # DB_WRITER_HOST, DB_READER_HOST, DB_NAME
vim k8s/secret.yaml      # DB_USER, DB_PASSWORD

kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### 3. Build & Push Docker Image
```bash
docker build -t your-registry/nexus-crm:latest .
docker push  your-registry/nexus-crm:latest

# Update image name in k8s/deployment.yaml
```

### 4. Deploy to Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods -l app=nexus-crm
```

### 5. Check Readiness (both DB endpoints)
```bash
kubectl port-forward svc/nexus-crm-svc 8080:80
curl http://localhost:8080/readyz
# {"status":"ready","writer":"ok","reader":"ok"}
```

---

## Local Development
```bash
# Backend
cd backend && npm install
DB_WRITER_HOST=localhost DB_READER_HOST=localhost \
DB_USER=root DB_PASSWORD=pass DB_NAME=crm_db \
npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
# → http://localhost:5173 (proxies /api to :3001)
```

---

## API Reference

| Method | Path                   | DB Pool  | Description         |
|--------|------------------------|----------|---------------------|
| GET    | /api/contacts          | Reader   | List + search + filter |
| GET    | /api/contacts/stats    | Reader   | Counts by status    |
| GET    | /api/contacts/:id      | Reader   | Single contact      |
| POST   | /api/contacts          | Writer   | Create contact      |
| PUT    | /api/contacts/:id      | Writer   | Update contact      |
| DELETE | /api/contacts/:id      | Writer   | Delete contact      |
| GET    | /healthz               | —        | Liveness probe      |
| GET    | /readyz                | Both     | Readiness probe     |

---

## K8s Notes
- **Pod anti-affinity** spreads replicas across AZs (matches Aurora multi-zone)
- **Readiness probe** hits `/readyz` which pings both writer & reader before accepting traffic
- **HPA** scales 2→8 pods at 65% CPU
- **Rolling update** with `maxUnavailable: 0` = zero downtime deploys
