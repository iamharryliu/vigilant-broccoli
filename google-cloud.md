# Google Cloud

```
gcloud auth login

gcloud config set project PROJECT_ID

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
