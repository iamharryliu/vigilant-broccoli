# Kubernetes (k8s)

- A Kubernetes cluster is a set of nodes used to automate running containerized applications, ie deployment, scaling, and management.

## Commands

```
brew install kubectl minikube
minikube start
kubectl get nodes
```

## Components

**Admin UI and CLI** -> **Control Plane** <-> **Worker Nodes** > **Pods**

### Control Plane

- Responsible for managing the state of the cluster.
- **Core Components**
  - **API server** - Allows clients to interact with control plane to manage the cluster.
  - **etcd** - Distributed key, value store that stores the cluster's persistant state.
  - **Scheduler** - Schedules pods onto the worker nodes and makes placement decisions based on available resources
  - **Controller Manager** - Manages conrollers that manage the stage of the cluster, ie ReplicationController, DeploymentController

### Worker Node

- runs containerized work loads
- core components
  - container runtime - Responsible for running containers on the worker nodes. Pulls containers from registry, start/stopping containiners, managing container resources.  
  - **Kublet** - Used to communicate with _control plane_, ie receive instructions and ensure desired state of pods is maintained.
  - **Kube Proxy** - routes traffic to correct paths, load balances
  - **Pods** - The smallest deployable units of a k8s cluster. Pods host 1 or more containers and provides storage and network for the containers.


## Deploying

- Managed Services
  - GCP GKE
  - AWS EKS
  - Azure AKS
- Local
  - minikube