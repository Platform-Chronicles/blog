---
layout: post
title: "Deploying Applications with Kubernetes"
date: 2025-01-07
tags: [kubernetes, devops, yaml]
---

Kubernetes has become the de facto standard for container orchestration. Here's a quick example of how to deploy a simple application using Kubernetes manifests.

## Basic Deployment Configuration

A Kubernetes Deployment manages a set of identical pods, ensuring that the specified number of replicas are running at all times.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platform-chronicles-web
  namespace: production
  labels:
    app: web
    environment: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
        version: v1.2.0
    spec:
      containers:
      - name: web-server
        image: platform-chronicles/web:1.2.0
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: CACHE_ENABLED
          value: "true"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Service Configuration

To expose the deployment, we need a Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: production
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
    name: http
```

## Key Concepts

1. **Replicas**: The deployment maintains 3 identical pods for high availability
2. **Health Checks**: Liveness and readiness probes ensure pods are healthy
3. **Resource Management**: Requests and limits prevent resource exhaustion
4. **Environment Variables**: Configuration through env vars and secrets

This configuration provides a solid foundation for running production workloads on Kubernetes.
