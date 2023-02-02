import { PluginInstanceContainerController } from "../PluginInstanceContainerController";
const Minio = require("minio");

async function getMinioClient(
  containerController: PluginInstanceContainerController,
) {
  const env = await containerController.getEnv();
  return new Minio.Client({
    endPoint: env.MINIO_CDN_END_POINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });
}

async function tryCreateBucket(
  containerController: PluginInstanceContainerController,
  bucket: "MINIO_PUBLIC_BUCKET" | "MINIO_PRIVATE_BUCKET",
) {
  const env = await containerController.getEnv();
  return new Promise(async (resolve, reject) => {
    const minioClient = await getMinioClient(containerController);
    minioClient.bucketExists(
      env[bucket],
      async function (err: any, exists: boolean) {
        if (exists) return resolve(true);
        if (err) return reject(err);
        minioClient.makeBucket(env[bucket], "us-east-1", function (err: any) {
          if (err) return reject(err);
          if (bucket === "MINIO_PUBLIC_BUCKET") {
            minioClient.setBucketPolicy(
              env[bucket],
              JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: [
                      "s3:GetBucketLocation",
                      "s3:ListBucket",
                      "s3:ListBucketMultipartUploads",
                    ],
                    Resource: ["arn:aws:s3:::public"],
                  },
                  {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: [
                      "s3:DeleteObject",
                      "s3:GetObject",
                      "s3:ListMultipartUploadParts",
                      "s3:PutObject",
                      "s3:AbortMultipartUpload",
                    ],
                    Resource: ["arn:aws:s3:::public/*"],
                  },
                ],
              }),
              function (err: any) {
                if (err) return reject(err);
                return resolve(true);
              },
            );
          } else {
            return resolve(true);
          }
        });
      },
    );
  });
}

export async function createBucket(
  containerController: PluginInstanceContainerController,
) {
  let count = 0;

  return new Promise((resolve, reject) => {
    ["MINIO_PUBLIC_BUCKET", "MINIO_PRIVATE_BUCKET"].map(
      (bucket: "MINIO_PUBLIC_BUCKET" | "MINIO_PRIVATE_BUCKET") => {
        let interval = setInterval(async () => {
          await tryCreateBucket(containerController, bucket)
            .then((res: any) => {
              clearInterval(interval);
              return resolve(true);
            })
            .catch((e) => {
              console.log("Bucket not created", count, e.message);
            });
          if (count > 10) {
            return reject("Bucket not created");
          }
          ++count;
        }, 5000);
      },
    );
  });
}
