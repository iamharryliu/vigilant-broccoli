# Google Cloud

- [Google Compute Engine](./google-cloud/google-computer-engine.md)
- [Free GCP VM](https://www.reddit.com/r/googlecloud/comments/s343al/can_i_run_a_vm_in_gcp_for_free/)
- [gsutil to gcloud storage migration](https://cloud.google.com/storage/docs/gsutil-to-gcloud-storage)

`gsutil` is deprecated — use `gcloud storage` instead. It is faster on bulk transfers, parallelizes by default (no `-m`), and ships with `google-cloud-cli`.

```
gcloud auth login
gcloud auth list

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
gcloud storage rm --recursive "gs://BUCKET_NAME/path"
gcloud storage rm --recursive "gs://BUCKET_NAME/8"
```

# Snapshot Process

```
gcloud compute disks snapshot free-vm --snapshot-names=free-vm-snapshot --zone=REGION

gcloud compute disks create vb-free-vm --source-snapshot=free-vm-snapshot --type=pd-standard --zone=REGION

gcloud compute instances create vb-free-vm --zone=REGION --disk=name=vb-free-vm,boot=yes --machine-type=MACHINE_TYPE
```

## Free Tier

Always Free, per month. Cloud Storage and Compute Engine only qualify in `us-west1`, `us-central1`, and `us-east1`:

- Cloud Storage: 5 GB of Standard storage, 5,000 Class A operations (writes/lists), 50,000 Class B operations (reads), 100 GB egress to most destinations.
- Compute Engine: one `e2-micro` instance, 30 GB standard persistent disk, 5 GB snapshot storage.
- Secret Manager (no region restriction): 6 active secret versions, 10,000 access operations.

`gs://vigilant-broccoli-backup` lives in `us-central1`, and `cron-backup.yml` writes four dated dumps a night and prunes to the last 7, so operation counts stay far under the free quotas; total bytes stored is the limit to watch.
