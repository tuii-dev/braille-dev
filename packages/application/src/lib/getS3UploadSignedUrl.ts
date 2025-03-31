import { getSignedUrl } from "aws-cloudfront-sign";

export const getS3UploadSignedUrl = (src: string) => {
  if (!process.env.SIGNING_KEY_ID || !process.env.SIGNING_PRIVATE_KEY) {
    return src;
  }
  return getSignedUrl(src, {
    keypairId: process.env.SIGNING_KEY_ID!,
    privateKeyString: process.env.SIGNING_PRIVATE_KEY!,
    expireTime: Date.now() + 1000 * 60 * 30,
  });
};
