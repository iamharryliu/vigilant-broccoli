# Google Cloud

[Free GCP VM](https://www.reddit.com/r/googlecloud/comments/s343al/can_i_run_a_vm_in_gcp_for_free/)

```
gcloud auth login

gcloud config set project PROJECT_ID
gcloud config get-value project

# CREATE
gcloud secrets create SECRET_NAME --replication-policy="automatic"

# GET
gcloud secrets versions access latest --secret=SECRET_NAME

# UPDATE
echo -n "secret_value" | gcloud secrets versions add SECRET_NAME --data-file=-

# DELETE
gcloud secrets delete SECRET_NAME
gcloud secrets delete SECRET_NAME --quiet
```

# Snapshot Process

```
gcloud compute disks snapshot free-vm --snapshot-names=free-vm-snapshot --zone=us-east1-c

gcloud compute disks create vb-free-vm --source-snapshot=free-vm-snapshot --type=pd-standard --zone=us-east1-b

gcloud compute instances create vb-free-vm --zone=us-east1-b --disk=name=vb-free-vm,boot=yes --machine-type=e2-micro
```
