export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

// One photo per receipt for now. The schema, API and upload pipeline all still
// handle a list, so raising this (and restoring `multiple` on the file input)
// is all that multi-page capture needs.
export const MAX_IMAGES_PER_RECEIPT = 1;
