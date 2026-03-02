// DISABLED: AWS S3 service is no longer used. The application now uses Vercel Blob Storage.
// Code is kept for reference but commented out to reduce dependencies and configuration complexity.

// import {
//   type _Object,
//   ListObjectsV2Command,
//   S3Client,
// } from '@aws-sdk/client-s3';
// import { Upload } from '@aws-sdk/lib-storage';

// import { config } from '../config';

// export class S3Service {
//   private readonly s3: S3Client;

//   constructor(s3: S3Client) {
//     this.s3 = s3;
//   }

//   async getBucketContents(): Promise<_Object[] | undefined> {
//     const listCommand = new ListObjectsV2Command({
//       Bucket: config.s3Bucket,
//     });
//     const response = await this.s3.send(listCommand);
//     return response.Contents;
//   }

//   async uploadFile(
//     filename: string,
//     file: Buffer,
//   ): Promise<string | undefined> {
//     const upload = new Upload({
//       client: this.s3,
//       params: {
//         Bucket: config.s3Bucket,
//         Key: filename,
//         Body: file,
//       },
//     });

//     upload.on('httpUploadProgress', (progress) => {
//       console.log(progress);
//     });

//     const response = await upload.done();

//     return response.Location;
//   }
// }

// export const s3Service = new S3Service(
//   new S3Client({
//     endpoint: config.awsEndpoint,
//     region: config.awsRegion,
//     forcePathStyle: config.env === 'development',
//   }),
// );
