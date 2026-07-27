import {
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  handleImageOptimization,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import {
  setRuntimeBindings,
  type RuntimeD1Database,
  type RuntimeBindings,
} from "../platform/runtime-bindings";

interface Env extends RuntimeBindings {
  // Structural stand-in for Cloudflare's `Fetcher` binding type, so the repo
  // typechecks without pulling in @cloudflare/workers-types globally (which
  // would conflict with DOM lib types used by the Next.js app).
  ASSETS?: { fetch(request: Request): Promise<Response> };
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: {
          format: string;
          quality: number;
        }): Promise<{ response(): Response }>;
      };
    };
  };
  DB: RuntimeD1Database;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    setRuntimeBindings(env);
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const transformImage = env.IMAGES
        ? async (
            body: ReadableStream,
            { width, format, quality }: {
              width: number;
              format: string;
              quality: number;
            },
          ) => {
            const result = await env.IMAGES!.input(body)
              .transform(width > 0 ? { width } : {})
              .output({ format, quality });
            return result.response();
          }
        : undefined;
      return handleImageOptimization(
        request,
        {
          fetchAsset: (path) => {
            const sourceRequest = new Request(new URL(path, request.url));
            return env.ASSETS?.fetch(sourceRequest) ?? fetch(sourceRequest);
          },
          transformImage,
        },
        allowedWidths,
      );
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
