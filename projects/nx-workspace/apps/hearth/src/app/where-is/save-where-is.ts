import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { WhereIsItem } from '../../lib/types';
import { WhereIsFormValues } from './where-is-form';
import { throwIfNotOk, uploadPreviewImages } from './upload-images';

export const WHERE_IS_ENDPOINT = '/api/where-is';

export const toWhereIsFormValues = (item: WhereIsItem): WhereIsFormValues => ({
  id: item.id,
  title: item.title,
  description: item.description,
  tags: item.tags,
  images: [],
  imageUrls: item.imageUrls,
  imageKeys: item.imageKeys,
});

export const saveWhereIsUpdate = async (
  form: WhereIsFormValues,
  persistedImageKeys: string[],
  accessToken: string,
): Promise<WhereIsItem> => {
  const imageKeys = form.imageKeys ?? [];
  const removedImageKeys = persistedImageKeys.filter(
    key => !imageKeys.includes(key),
  );
  const newImages = await uploadPreviewImages(form.images, accessToken);

  const saveRes = await fetch(WHERE_IS_ENDPOINT, {
    method: HTTP_METHOD.PATCH,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      id: form.id,
      title: form.title,
      description: form.description,
      tags: form.tags,
      removedImageKeys,
      imageKeyOrder: imageKeys,
      newImages,
    }),
  });
  await throwIfNotOk(saveRes);

  const res = await fetch(`${WHERE_IS_ENDPOINT}?id=${form.id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await throwIfNotOk(res);
  return res.json();
};
