import { getFear, subscribe } from "@/lib/fearStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current value immediately
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ value: getFear() })}\n\n`));

      // Subscribe to future updates
      const unsub = subscribe((v) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ value: v })}\n\n`));
        } catch {
          // no-op if closed
        }
      });

      // Keep-alive ping
      const ka = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // no-op
        }
      }, 15000);

      // Clean up
      const close = () => {
        clearInterval(ka);
        unsub();
        try {
          controller.close();
        } catch {/* already closed */}
      };

      // If client disconnects
      // @ts-expect-error not typed on web Request in Node
      controller.signal?.addEventListener?.("abort", close);
    },
    cancel() {
      // handled by close() above
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
