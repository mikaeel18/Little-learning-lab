import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Private file storage on Cloudflare R2. Files here have NO public web address.
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
export const putFile = (key, body, type) =>
  r2.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key, Body: body, ContentType: type }));
export const deleteFile = (key) =>
  r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
