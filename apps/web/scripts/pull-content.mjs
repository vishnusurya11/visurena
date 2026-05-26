// scripts/pull-content.mjs — pull the content bucket into a local cache for an
// S3-sourced build. Reading from S3 (download) only — never writes to the bucket.
//
//   VR_CONTENT_S3_BUCKET   default: visurena-content-alpha
//   VR_CONTENT_S3_REGION   default: us-west-2   (infra lives in us-west-2)
//
// Usage:  VR_CONTENT_SOURCE=s3  →  pnpm content:pull  →  pnpm build
// The build (lib/content.ts) reads .content-cache when VR_CONTENT_SOURCE=s3.

import { execSync } from "node:child_process";
import path from "node:path";

const bucket = process.env.VR_CONTENT_S3_BUCKET || "visurena-content-alpha";
const region = process.env.VR_CONTENT_S3_REGION || "us-west-2";
const dest = path.resolve(process.cwd(), ".content-cache");

console.log(`[content] pulling s3://${bucket} -> ${dest}  (${region})`);
try {
  execSync(`aws s3 sync "s3://${bucket}" "${dest}" --region ${region} --delete --no-progress`, { stdio: "inherit" });
  console.log("[content] pull complete");
} catch (err) {
  console.error("[content] pull failed:", err.message);
  process.exit(1);
}
