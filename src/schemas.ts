import { z } from "zod";

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

export const ImageKitVersionInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ImageKitAITagSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(100),
  source: z.string().optional(),
});

// ─── Core file schema (matches /api/v1/files/upload response) ─────────────────

export const ImageKitFileSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  size: z.number().int().nonnegative(),
  versionInfo: ImageKitVersionInfoSchema,
  filePath: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  fileType: z.enum(["image", "non-image", "video", "audio", "pdf", "other"]),
  height: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  orientation: z.number().int().optional(),
  AITags: z.array(ImageKitAITagSchema).nullable().optional(),
  tags: z.array(z.string()).optional(),
  customMetadata: z.record(z.string(), z.unknown()).optional(),
  isPrivateFile: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// The upload endpoint returns the same shape as a file object
export const ImageKitUploadResponseSchema = ImageKitFileSchema;

// ─── Inferred types ───────────────────────────────────────────────────────────

export type ImageKitVersionInfo = z.infer<typeof ImageKitVersionInfoSchema>;
export type ImageKitAITag = z.infer<typeof ImageKitAITagSchema>;
export type ImageKitFile = z.infer<typeof ImageKitFileSchema>;
export type ImageKitUploadResponse = z.infer<typeof ImageKitUploadResponseSchema>;

// ─── Webhook schemas ──────────────────────────────────────────────────────────

export const ImageKitWebhookBaseSchema = z.object({
  type: z.string(),
  id: z.string(),
  created_at: z.string().datetime(),
  data: z.record(z.string(), z.unknown()),
});

// Narrow discriminated union for well-known event types
export const FileUploadedWebhookSchema = ImageKitWebhookBaseSchema.extend({
  type: z.literal("file.uploaded"),
  data: ImageKitFileSchema,
});

export const VideoTransformationReadyWebhookSchema =
  ImageKitWebhookBaseSchema.extend({
    type: z.literal("video.transformation.ready"),
    data: z.object({
      fileId: z.string(),
      url: z.string().url(),
      transformation: z.string(),
    }),
  });

export const PreTransformSuccessWebhookSchema =
  ImageKitWebhookBaseSchema.extend({
    type: z.literal("upload.pre-transform.success"),
    data: ImageKitFileSchema,
  });

// Union of all known event schemas; unknown events fall back to the base schema
export const ImageKitWebhookSchema = z.discriminatedUnion("type", [
  FileUploadedWebhookSchema,
  VideoTransformationReadyWebhookSchema,
  PreTransformSuccessWebhookSchema,
]);

export type ImageKitWebhookBase = z.infer<typeof ImageKitWebhookBaseSchema>;
export type FileUploadedWebhook = z.infer<typeof FileUploadedWebhookSchema>;
export type VideoTransformationReadyWebhook = z.infer<
  typeof VideoTransformationReadyWebhookSchema
>;
export type PreTransformSuccessWebhook = z.infer<
  typeof PreTransformSuccessWebhookSchema
>;
export type ImageKitWebhook = z.infer<typeof ImageKitWebhookSchema>;
