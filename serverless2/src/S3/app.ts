import {
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client } from './libs';

type AnswerFiles = {
  fileName: string;
  lastModified: Date;
  size: number;
  url: Promise<string>;
};
const signedUrl = async (bucket: string | undefined, key: string) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Key: key,
    };
    const client = s3Client;
    const command = new GetObjectCommand(bucketParams);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const putObject = async (Bucket: string, Key: string) => {
  try {
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket,
      Key,

      Expires: 60 * 60,
    });
    return { url, fields };
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const listObjects = async (bucket: string, userName: string) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Prefix: userName,
    };
    let result: AnswerFiles[] | unknown[] = [];
    const data = await s3Client.send(new ListObjectsCommand(bucketParams));
    if (data.Contents) {
      let fileName = '';
      const arrayOfPromises = data.Contents.map(async (element) => {
        if (element.Key) {
          fileName = element.Key.split('/')[1];
        }

        return {
          fileName: fileName,
          lastModified: element.LastModified,
          size: element.Size,
          url: await signedUrl(bucket, userName + '/' + fileName),
        };
      });
      result = await Promise.all(arrayOfPromises);
    } else result = [];
    return result;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const deleteObject = async (bucket: string, key: string) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Key: key,
    };

    return await s3Client.send(new DeleteObjectCommand(bucketParams));
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};
