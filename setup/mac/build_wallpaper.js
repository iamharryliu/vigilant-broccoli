// Usage: osascript -l JavaScript build_wallpaper.js <output.heic> <image> <fill-mode> [<dark-image> <dark-fill-mode>]
// Fill modes: fill, fit, stretch, center. With a dark image, the first image is the light one and
// the output switches with the system appearance.
// JXA instead of Swift: it calls ImageIO with no compiler, so it works on machines whose
// Command Line Tools Swift toolchain is missing or broken.
ObjC.import('AppKit');
ObjC.import('ImageIO');
ObjC.import('stdlib');

const USAGE =
  'Usage: osascript -l JavaScript build_wallpaper.js <output.heic> <image> <fill-mode> [<dark-image> <dark-fill-mode>]\n' +
  'Fill modes: fill, fit, stretch, center';

const FILL_MODE_SCALE = {
  fill: (widthRatio, heightRatio) => Math.max(widthRatio, heightRatio),
  fit: (widthRatio, heightRatio) => Math.min(widthRatio, heightRatio),
  center: () => 1,
};

const fail = message => {
  console.log(message);
  $.exit(1);
};

// JXA returns NULL CF pointers as truthy Refs, so validate through the image count instead;
// size_t comes back as a string.
const loadImage = path => {
  const source = $.CGImageSourceCreateWithURL(
    $.NSURL.fileURLWithPath(path),
    null,
  );
  if (Number($.CGImageSourceGetCount(source)) === 0)
    fail(`Could not read image: ${path}`);
  return $.CGImageSourceCreateImageAtIndex(source, 0, null);
};

const mainScreenPixelSize = () => {
  const screen = $.NSScreen.mainScreen;
  const scale = screen.backingScaleFactor;
  return {
    width: screen.frame.size.width * scale,
    height: screen.frame.size.height * scale,
  };
};

const EDGE_SAMPLES_PER_SIDE = 16;
const EDGE_COLOR_BUCKETS_PER_CHANNEL = 8;

// Fit and center leave screen area uncovered; filling it with the dominant edge color blends the
// image in (e.g. white for a page with white margins) instead of boxing it in black. A plain
// average is muddied by dark panel borders, so the largest bucket of similar colors wins.
const edgeColor = image => {
  const rep = $.NSBitmapImageRep.alloc.initWithCGImage(image);
  const maxX = Number(rep.pixelsWide) - 1;
  const maxY = Number(rep.pixelsHigh) - 1;
  const points = [];
  for (let i = 0; i < EDGE_SAMPLES_PER_SIDE; i++) {
    const t = i / (EDGE_SAMPLES_PER_SIDE - 1);
    const x = Math.round(t * maxX);
    const y = Math.round(t * maxY);
    points.push([x, 0], [x, maxY], [0, y], [maxX, y]);
  }
  const buckets = {};
  points.forEach(([x, y]) => {
    const color = rep
      .colorAtXY(x, y)
      .colorUsingColorSpace($.NSColorSpace.sRGBColorSpace);
    const rgb = [color.redComponent, color.greenComponent, color.blueComponent];
    const key = rgb
      .map(component =>
        Math.min(
          EDGE_COLOR_BUCKETS_PER_CHANNEL - 1,
          Math.floor(component * EDGE_COLOR_BUCKETS_PER_CHANNEL),
        ),
      )
      .join();
    buckets[key] = [...(buckets[key] || []), rgb];
  });
  const dominant = Object.values(buckets).reduce((largest, bucket) =>
    bucket.length > largest.length ? bucket : largest,
  );
  return [0, 1, 2].map(
    channel =>
      dominant.reduce((sum, rgb) => sum + rgb[channel], 0) / dominant.length,
  );
};

// The dynamic wallpaper provider has no fill-mode setting and always fills the screen, and
// NSWorkspace saves macOS's default blue as the background for static images. Rendering onto a
// canvas the size of the main display applies the fill mode and background up front instead.
const renderForScreen = (image, fillMode, screen) => {
  const imageWidth = Number($.CGImageGetWidth(image));
  const imageHeight = Number($.CGImageGetHeight(image));
  const scaleFor = FILL_MODE_SCALE[fillMode];
  const scale =
    scaleFor &&
    scaleFor(screen.width / imageWidth, screen.height / imageHeight);
  const width = scaleFor ? imageWidth * scale : screen.width;
  const height = scaleFor ? imageHeight * scale : screen.height;

  const context = $.CGBitmapContextCreate(
    null,
    screen.width,
    screen.height,
    8,
    0,
    $.CGColorSpaceCreateWithName($.kCGColorSpaceSRGB),
    $.kCGImageAlphaPremultipliedLast,
  );
  const [red, green, blue] = edgeColor(image);
  $.CGContextSetRGBFillColor(context, red, green, blue, 1);
  $.CGContextFillRect(context, { origin: { x: 0, y: 0 }, size: screen });
  $.CGContextSetInterpolationQuality(context, $.kCGInterpolationHigh);
  $.CGContextDrawImage(
    context,
    {
      origin: {
        x: (screen.width - width) / 2,
        y: (screen.height - height) / 2,
      },
      size: { width, height },
    },
    image,
  );
  return $.CGBitmapContextCreateImage(context);
};

// macOS treats a HEIC as an appearance-based dynamic wallpaper when its first image carries
// apple_desktop:apr, a base64 binary plist mapping light (l) and dark (d) to image indexes.
const appearanceMetadata = () => {
  const appearance =
    $.NSPropertyListSerialization.dataWithPropertyListFormatOptionsError(
      // JS numbers bridge to doubles; macOS expects integer indexes.
      $({ l: $.NSNumber.numberWithInt(0), d: $.NSNumber.numberWithInt(1) }),
      $.NSPropertyListBinaryFormat_v1_0,
      0,
      null,
    ).base64EncodedStringWithOptions(0);
  const namespace = $('http://ns.apple.com/namespace/1.0/');
  const prefix = $('apple_desktop');
  const metadata = $.CGImageMetadataCreateMutable();
  $.CGImageMetadataRegisterNamespaceForPrefix(
    metadata,
    namespace,
    prefix,
    null,
  );
  const tag = $.CGImageMetadataTagCreate(
    namespace,
    prefix,
    $('apr'),
    $.kCGImageMetadataTypeString,
    appearance,
  );
  $.CGImageMetadataSetTagWithPath(metadata, null, $('apple_desktop:apr'), tag);
  return metadata;
};

function run(argv) {
  if (argv.length !== 3 && argv.length !== 5) fail(USAGE);
  const [outputPath, ...layers] = argv;
  const isFillMode = mode => mode in FILL_MODE_SCALE || mode === 'stretch';
  const screen = mainScreenPixelSize();
  // Render before creating the destination, which creates an empty output file immediately.
  const images = [];
  for (let i = 0; i < layers.length; i += 2) {
    if (!isFillMode(layers[i + 1])) fail(USAGE);
    images.push(renderForScreen(loadImage(layers[i]), layers[i + 1], screen));
  }

  const destination = $.CGImageDestinationCreateWithURL(
    $.NSURL.fileURLWithPath(outputPath),
    $('public.heic'),
    images.length,
    null,
  );
  $.CGImageDestinationAddImageAndMetadata(
    destination,
    images[0],
    images.length > 1 ? appearanceMetadata() : null,
    null,
  );
  images
    .slice(1)
    .forEach(image => $.CGImageDestinationAddImage(destination, image, null));
  if (!$.CGImageDestinationFinalize(destination))
    fail(`Could not write HEIC at: ${outputPath}`);
}
