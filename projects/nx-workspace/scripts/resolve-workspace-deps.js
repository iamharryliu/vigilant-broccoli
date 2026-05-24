const fs = require('fs');
const path = require('path');

const WORKSPACE_PROTOCOL = 'workspace:*';
const PACKAGE_JSON = 'package.json';
const LIBS_DIR = path.resolve(__dirname, '../libs');

const pkgPath = path.resolve(PACKAGE_JSON);
const pkg = JSON.parse(fs.readFileSync(pkgPath));

for (const [name, version] of Object.entries(pkg.dependencies || {})) {
  if (version === WORKSPACE_PROTOCOL) {
    const depPkg = JSON.parse(
      fs.readFileSync(path.join(LIBS_DIR, name, PACKAGE_JSON)),
    );
    pkg.dependencies[name] = depPkg.version;
  }
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
