.PHONY: help init validate build list-images prune-images clean

PROJECT_ID ?= vigilant-broccoli
ZONE ?= us-east1-b
IMAGE_FAMILY ?= vb-vm
KEEP_IMAGES ?= 3

help:
	@echo "Vigilant Broccoli VM Packer Image Management"
	@echo ""
	@echo "Targets:"
	@echo "  init          - Initialize Packer plugins"
	@echo "  validate      - Validate Packer template"
	@echo "  build         - Build VM image"
	@echo "  list-images   - List all VB VM images"
	@echo "  prune-images  - Delete old images, keep KEEP_IMAGES newest (default: 3)"
	@echo "  clean         - Clean build artifacts"

init:
	packer init vb-vm.pkr.hcl

validate: init
	packer validate vb-vm.pkr.hcl

build: init
	packer build vb-vm.pkr.hcl
	$(MAKE) prune-images KEEP_IMAGES=1

list-images:
	gcloud compute images list \
		--project=$(PROJECT_ID) \
		--no-standard-images \
		--filter="family=$(IMAGE_FAMILY)" \
		--sort-by=~creationTimestamp \
		--format="table(name,family,creationTimestamp,diskSizeGb)"

prune-images:
	@echo "Pruning images, keeping $(KEEP_IMAGES) newest..."
	@to_delete=$$(gcloud compute images list \
		--project=$(PROJECT_ID) \
		--no-standard-images \
		--filter="family=$(IMAGE_FAMILY)" \
		--format="value(name)" \
		--sort-by="~creationTimestamp" \
		| tail -n +$$(($(KEEP_IMAGES) + 1))); \
	if [ -z "$$to_delete" ]; then \
		echo "  Nothing to prune"; \
	else \
		echo "$$to_delete" | xargs -I{} sh -c \
			'echo "  Deleting: {}" && gcloud compute images delete {} --project=$(PROJECT_ID) --quiet'; \
	fi

clean:
	rm -f packer-manifest.json
	rm -rf packer_cache/
	rm -f crash.log
