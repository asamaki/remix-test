import { PassThrough } from "stream";
import type { UploadHandler } from "@remix-run/node";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const {
  STORAGE_ACCESS_KEY,
  STORAGE_SECRET,
  STORAGE_REGION,
  STORAGE_BUCKET,
  STORAGE_ENDPOINT,
} = process.env;

if (
  !(
    STORAGE_ACCESS_KEY &&
    STORAGE_SECRET &&
    STORAGE_REGION &&
    STORAGE_BUCKET &&
    STORAGE_ENDPOINT
  )
) {
  throw new Error("Storageに必要な設定がありません。");
}

const s3Client = new S3Client({
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY,
    secretAccessKey: STORAGE_SECRET,
  },
  region: STORAGE_REGION,
  endpoint: STORAGE_ENDPOINT,
});

const uploadStream = ({ Key }: { Key: string }) => {
  const pass = new PassThrough();
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: STORAGE_BUCKET,
      Key,
      Body: pass,
    },
  });

  return {
    writeStream: pass,
    promise: upload.done(),
  };
};

async function uploadStreamToS3(
  data: AsyncIterable<Uint8Array>,
  filename: string,
) {
  const stream = uploadStream({ Key: filename });
  await writeAsyncIterableToWritable(data, stream.writeStream);
  await stream.promise;
  const location = await getSignedUrl(
    s3Client,
    new GetObjectCommand({ Bucket: STORAGE_BUCKET, Key: filename }),
    { expiresIn: 3600 },
  );
  return location;
}

export const s3UploadHandler: UploadHandler = async ({
  name,
  filename,
  data,
}) => {
  if (name !== "img") {
    return undefined;
  }
  const uploadedFileLocation = await uploadStreamToS3(data, filename!);
  return uploadedFileLocation;
};
