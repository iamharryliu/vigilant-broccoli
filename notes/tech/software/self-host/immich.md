# Immich

```
git clone https://github.com/immich-app/immich.git
cd immich/docker
cp example.env .env

open http://localhost:2283

brew install immich-go
immich-go upload from-google-photos --server=http://localhost:2283 --api-key=API_KEY --dry-run TAKEOUT_FILEPATH.zip
```
