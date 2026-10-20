# Devops

## Table of Contents

- [Cloud Services Name Mapping](#cloud-services-name-mapping)
- [IaC Manager Comparison](#iac-manager-comparison)
- [Service Providers](#service-providers)
- [Devops Tools](#devops-tools)
- [Notes](#notes)

## Cloud Services Name Mapping

|      Service       | Description                                                                                |          AWS           |   Google Cloud    |         Azure          |
| :----------------: | :----------------------------------------------------------------------------------------- | :--------------------: | :---------------: | :--------------------: |
|       Docker       | Local container engine to build and run containerized applications.                        |      N/A (local)       |    N/A (local)    |      N/A (local)       |
|   Docker Compose   | Local tool to define and run multi-container apps using a YAML configuration.              |      N/A (local)       |    N/A (local)    |      N/A (local)       |
|      Storage       | Object storage for durable, scalable file/blobs.                                           |           S3           |   Cloud Storage   |      Blob Storage      |
|      Database      | Managed relational database service.                                                       |          RDS           |     Cloud SQL     |       Azure SQL        |
|    VM Instances    | Always-on servers you fully control for any workload requiring custom OS-level management. |          EC2           |        GCE        | Virtual Machines (VMs) |
|     VM Images      | Pre-configured machine images used to launch VM instances.                                 |          AMI           |   Custom Images   |       VM Images        |
| Container Registry | Private registry for storing and managing container images.                                |          ECR           | Artifact Registry |   Container Registry   |
|     Containers     | Runs your containerized apps with automatic scaling and no server management.              | App Runner / Fargate\* |     Cloud Run     |     Container Apps     |
|     Functions      | Runs small event-driven functions that scale instantly and bill only for execution time.   |         Lambda         |  Cloud Functions  |       Functions        |
|     Kubernetes     | Managed Kubernetes clusters for container orchestration.                                   |          EKS           |        GKE        |          AKS           |

## IaC Manager Comparison

Comparison of infrastructure-as-code tools, to guide picking one for provisioning cloud resources.

| Name                      | Language                                   | Clouds                                           | State                                                                        | When to Use                                                                                            |
| ------------------------- | ------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AWS CDK                   | TypeScript, Python, Java, C#, Go           | AWS only (synthesizes CloudFormation)            | Managed by CloudFormation stacks, no state file to host                      | AWS-only shop that wants real programming languages and high-level constructs                          |
| AWS CloudFormation        | JSON/YAML templates                        | AWS only                                         | Managed by AWS per stack, no state file to host                              | AWS-only, no extra tooling or vendor; also the engine under CDK and SAM                                |
| Azure Bicep               | Bicep DSL (compiles to ARM templates)      | Azure only                                       | Managed by Azure, no state file to host                                      | Azure-only, replaces hand-written ARM JSON                                                             |
| CDK for Terraform (CDKTF) | TypeScript, Python, Java, C#, Go           | Any Terraform provider                           | Terraform state                                                              | Avoid for new work: HashiCorp has sunset it                                                            |
| Crossplane                | Kubernetes YAML (CRDs), optional functions | Any with a provider                              | Kubernetes API server (etcd) is the source of truth                          | Kubernetes-centric platform teams exposing self-service infra APIs; continuous reconciliation          |
| OpenTofu                  | HCL                                        | Any Terraform provider                           | State file, local or remote backend (supports state encryption)              | Terraform-compatible fork under the Linux Foundation, for an open-source governance requirement        |
| Pulumi                    | TypeScript, Python, Go, C#, Java, YAML     | Any (own providers, many bridged from Terraform) | Pulumi Cloud (free individual tier) or self-managed backend (S3, GCS, local) | Multi-cloud with real languages, loops and tests, and a team comfortable outside HCL                   |
| Terraform                 | HCL                                        | Any (largest provider ecosystem)                 | State file, local or remote backend (S3, GCS, HCP Terraform)                 | Default for multi-cloud and SaaS resources (DNS, GitHub, Vault); biggest community and module registry |

## Service Providers

- [Apple Developer](./apple.md)
- [FlyIO](./flyio.md)
- [Github](./github.md)
- [Google](./google.md)
- [Google Cloud](./google-cloud.md)
- [AWS](./aws/aws.md)
- [Cloudflare](./cloudflare.md)
- [Vercel](./vercel.md)
- [Netlify](./netlify.md)
- [Render](./render.md)
- [Lovable](./lovable.md)

## Devops Tools

- [Ansible](./ansible.md)
- [Git](./git/git.md)
- [Docker](./docker.md)
- [Kubernetes](./kubernetes.md)
- [Nx](./nx.md)
- [Hashicorp Vault](./hashicorp-vault.md)
- [Loki + Grafana](./loki-grafana.md)
- [Automation](./automation/automation.md)
- [Deployment](./deployment/deployment.md)

## Notes

- [DNS](./dns.md)
- [Monorepo](./monorepo.md)
- [Cloud Services](./cloud-services.md)
- [Local Services](./local-services.md)
