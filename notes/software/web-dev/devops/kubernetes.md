# Kubernetes

## Components

### Control Plane

- manages state of cluster
- core components
  - API server - allows clients to interact with control plane
  - etcd - key, value store for cluster
  - Scheduler
  - controller manager
    - manages conrollers that manage the stage of the cluster
    - ie replication/deployment controller

### Worker Node

- runs containerized work loads
- core components
  - container runtime - runs containers
  - kublet - daemen communicates with control plane
  - kube-proxy - routes traffic to correct paths, load balances
  - worker node
  - pods

### Pods

- basic building block of kubernetes
- hosts 1 or more containers, provides storage and network for containers
