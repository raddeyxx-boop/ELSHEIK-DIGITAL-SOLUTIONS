// Check the existing fallback policy before downloading the Three.js renderer.
// The renderer consumes this same context, so capability checks never create a
// second GPU context on a normal visit.
type PixelContext = {
  canvas: HTMLCanvasElement;
  context: WebGL2RenderingContext;
};
let prepared: PixelContext | null | undefined;
let claimed = false;
let release = 0;
const software = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function preparePixelContext(): PixelContext | null {
  if (prepared === null) return null;
  if (prepared && !prepared.context.isContextLost()) return prepared;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!context) return (prepared = null);
  const info = context.getExtension("WEBGL_debug_renderer_info");
  if (
    software.test(
      String(
        context.getParameter(
          info ? info.UNMASKED_RENDERER_WEBGL : context.RENDERER,
        ),
      ),
    )
  ) {
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return (prepared = null);
  }
  prepared = { canvas, context };
  claimed = false;
  window.clearTimeout(release);
  release = window.setTimeout(() => {
    if (claimed) return;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    prepared = undefined;
  }, 2000);
  return prepared;
}

export function acquirePixelContext(): PixelContext | null {
  const result = preparePixelContext();
  if (result) {
    claimed = true;
    window.clearTimeout(release);
  }
  return result;
}
