import {
  PutObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from './libs';

type AnswerFiles = {
  failName: string;
  lastModified: Date;
  size: number;
  url: Promise<unknown>;
};
const signedUrl = async (bucket: string | undefined, key: string) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Key: key,
    };
    const client: any = s3Client;
    const command: any = new GetObjectCommand(bucketParams);
    console.log('command', command);
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const putObject = async (
  bucket: string | undefined,
  key: string,
  body: string
) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Key: key,
      Body: body,
    };
    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    console.log('Success', data);
    return data;
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const listObjects = async (
  bucket: string | undefined,
  userName: string
) => {
  try {
    const bucketParams = {
      Bucket: bucket,
      Prefix: userName,
    };
    let result: AnswerFiles[] | unknown[] = [];
    const data = await s3Client.send(new ListObjectsCommand(bucketParams));
    console.log('data', data);
    if (data.Contents) {
      let fileName = '';
      const arrayOfPromises = data.Contents.map(async (element) => {
        if (element.Key) {
          fileName = element.Key.split('/')[1];
        }

        return {
          failName: fileName,
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

export const filesGetLink = async (
  bucket: string | undefined,
  userName: string,
  fileName: string
) => {
  try {
    return await signedUrl(bucket, userName + '/' + fileName);
  } catch (err) {
    console.error('Error', err);
    return err;
  }
};

export const deleteObject = async (bucket: string | undefined, key: string) => {
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
