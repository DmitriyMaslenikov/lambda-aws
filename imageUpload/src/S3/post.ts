import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client } from './libs';

export const putObject = async (bucket: string | undefined, key: string) => {
  try {
    let Bucket: string = '';
    if (typeof bucket === 'string') {
      Bucket = bucket;
    }
    const Key = key;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket,
      Key,

      Expires: 1600, //Seconds before the presigned post expires. 3600 by default.
    });
    return { url, fields };
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};
