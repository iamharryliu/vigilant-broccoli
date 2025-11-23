# Devops

## Services

- [Apple Developer](./apple.md)
- [FlyIO](./flyio.md)
- [Github](./github.md)
- [Google](./google.md)
- [Google Cloud](./google-cloud.md)
- [AWS](./aws/aws.md)
- [Cloudflare](./cloudflare.md)

## Devops Tools

- [Git](./git/git.md)
- [Docker](./docker.md)
- [Kubernetes](./kubernetes.md)
- [Nx](./nx.md)
- [Hashicorp Vault](./hashicorp-vault.md)

## Notes

- [DNS](./dns.md)
- [Monorepo](./monorepo.md)

## Cloud Services Name Mapping

|    Service     | Description                                                                                |          AWS           |  Google Cloud   |         Azure          |
| :------------: | :----------------------------------------------------------------------------------------- | :--------------------: | :-------------: | :--------------------: |
|  VM Instances  | Always-on servers you fully control for any workload requiring custom OS-level management. |          EC2           |       GCE       | Virtual Machines (VMs) |
|   Containers   | Runs your containerized apps with automatic scaling and no server management.              | App Runner / Fargate\* |    Cloud Run    |     Container Apps     |
|   Functions    | Runs small event-driven functions that scale instantly and bill only for execution time.   |         Lambda         | Cloud Functions |       Functions        |
|   Kubernetes   | Managed Kubernetes clusters for container orchestration.                                   |          EKS           |       GKE       |          AKS           |
|    Storage     | Object storage for durable, scalable file/blobs.                                           |           S3           |  Cloud Storage  |      Blob Storage      |
|     Docker     | Local container engine to build and run containerized applications.                        |      N/A (local)       |   N/A (local)   |      N/A (local)       |
| Docker Compose | Local tool to define and run multi-container apps using a YAML configuration.              |      N/A (local)       |   N/A (local)   |      N/A (local)       |
