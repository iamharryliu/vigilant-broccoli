// Usage: osascript -l JavaScript apply_wallpaper_to_all_spaces.js <wallpaper> [dynamic]
// Run after NSWorkspace setDesktopImageURL, then restart WallpaperAgent. That API only records the
// wallpaper for the current Space, and other Spaces fall back to stale per-display and system
// defaults, so this copies its store entry to every desktop entry. It also always records a static
// image, so with `dynamic` the entry switches to the provider System Settings uses for light/dark
// HEICs. The store format is private and was copied from entries System Settings wrote on macOS 15.
ObjC.import('Foundation');
ObjC.import('stdlib');

const STORE_PATH = $(
  '~/Library/Application Support/com.apple.wallpaper/Store/Index.plist',
).stringByExpandingTildeInPath;
const IMAGE_PROVIDER = 'com.apple.wallpaper.choice.image';
const DYNAMIC_PROVIDER = 'com.apple.wallpaper.choice.dynamic';
const AUTOMATIC_APPEARANCE_STYLE = 0;

const fail = message => {
  console.log(message);
  $.exit(1);
};

const toBinaryPlist = value =>
  $.NSPropertyListSerialization.dataWithPropertyListFormatOptionsError(
    value,
    $.NSPropertyListBinaryFormat_v1_0,
    0,
    null,
  );

// Missing keys come back as a nil wrapper with no methods besides isNil.
const isKind = (value, objcClass) =>
  !value.isNil() && value.isKindOfClass(objcClass);

const forEachChild = (node, callback) => {
  const children = isKind(node, $.NSDictionary) ? node.allValues : node;
  if (!isKind(children, $.NSArray)) return;
  for (let i = 0; i < children.count; i++) callback(children.objectAtIndex(i));
};

const referencesFile = (choice, fileUrl) => {
  const files = choice.objectForKey('Files');
  if (!isKind(files, $.NSArray)) return false;
  for (let i = 0; i < files.count; i++) {
    if (
      ObjC.unwrap(files.objectAtIndex(i).objectForKey('relative')) === fileUrl
    )
      return true;
  }
  return false;
};

const findChoice = (node, fileUrl) => {
  if (
    isKind(node, $.NSDictionary) &&
    isKind(node.objectForKey('Provider'), $.NSString)
  ) {
    return referencesFile(node, fileUrl) ? node : null;
  }
  let found = null;
  forEachChild(node, child => {
    found = found || findChoice(child, fileUrl);
  });
  return found;
};

// Desktop entries live under SystemDefault, Displays/<display>, Spaces/<space>/Default and
// Spaces/<space>/Displays/<display>; Idle entries (screen saver) are left alone.
const forEachDesktopContent = (node, callback) => {
  if (isKind(node, $.NSDictionary)) {
    const desktop = node.objectForKey('Desktop');
    if (isKind(desktop, $.NSDictionary))
      callback(desktop.objectForKey('Content'));
  }
  forEachChild(node, child => forEachDesktopContent(child, callback));
};

function run(argv) {
  if (
    argv.length < 1 ||
    argv.length > 2 ||
    (argv[1] && argv[1] !== 'dynamic')
  ) {
    fail(
      'Usage: osascript -l JavaScript apply_wallpaper_to_all_spaces.js <wallpaper> [dynamic]',
    );
  }
  const fileUrl = ObjC.unwrap($.NSURL.fileURLWithPath(argv[0]).absoluteString);

  const store =
    $.NSPropertyListSerialization.propertyListWithDataOptionsFormatError(
      $.NSData.dataWithContentsOfFile(STORE_PATH),
      $.NSPropertyListMutableContainersAndLeaves,
      null,
      null,
    );
  if (!isKind(store, $.NSDictionary))
    fail(`Could not read wallpaper store: ${ObjC.unwrap(STORE_PATH)}`);

  const choice = findChoice(store, fileUrl);
  if (!choice) fail(`No wallpaper store entry references ${fileUrl}`);
  if (
    argv[1] === 'dynamic' &&
    ObjC.unwrap(choice.objectForKey('Provider')) === IMAGE_PROVIDER
  ) {
    choice.setObjectForKey($(DYNAMIC_PROVIDER), 'Provider');
    choice.setObjectForKey(
      toBinaryPlist(
        $({ style: $.NSNumber.numberWithInt(AUTOMATIC_APPEARANCE_STYLE) }),
      ),
      'Configuration',
    );
  }

  forEachDesktopContent(store, content => {
    if (isKind(content, $.NSMutableDictionary)) {
      content.setObjectForKey(
        $.NSMutableArray.arrayWithObject(choice.mutableCopy),
        'Choices',
      );
    }
  });

  if (!toBinaryPlist(store).writeToFileAtomically(STORE_PATH, true)) {
    fail(`Could not write wallpaper store: ${ObjC.unwrap(STORE_PATH)}`);
  }
}
