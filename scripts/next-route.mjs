import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const quiet = process.argv.find(arg => arg === "--quiet");

const projectRoot = path.join(import.meta.dirname, "..");

const loadEnv = (name) => {
  const fullName = path.resolve(projectRoot, name);
  if (!fs.existsSync(fullName)) return false;
  dotenv.config({ path: fullName, override: true });
  return true;
};
loadEnv(".env");
loadEnv(".env.local");

const appMode = process.env.APP_MODE || "prod";

const srcRoot = path.join(projectRoot, "src");
const appAlias = "app";
const appRoot = path.join(srcRoot, appAlias);
const pageAlias = "pages";
const pageRoot = path.join(srcRoot, pageAlias);

const extensions = ["ts", "tsx", "mts", "cts", "mock.ts", "mock.tsx"].sort((a, b) => b.length - a.length);

const pagesRoutes = [];
const pagesApiRoutes = [];
const appRoutes = [];
const appApiRoutes = [];

const isNextPathName = (fileName) => {
  return extensions.find(ex => fileName.endsWith("." + ex));
};

const findNextPathName = (fileName, findPathname) => {
  return extensions.find(ex => fileName === `${findPathname}.${ex}`);
};

const mainForApp = (dirName, nestLevel = 0) => {
  const items = fs.readdirSync(dirName);
  items.sort((a, b) => {
    if (fs.statSync(path.join(dirName, a)).isDirectory()) return 1;
    if (fs.statSync(path.join(dirName, b)).isDirectory()) return -1;
    if (findNextPathName(a, "index")) return -1;
    if (findNextPathName(b, "index")) return 1;
    return 0;
  }).forEach(name => {
    if (name.startsWith("@")) return;

    const fullName = path.join(dirName, name);
    if (fs.statSync(fullName).isDirectory()) {
      mainForApp(fullName, nestLevel + 1);
      return;
    }

    if (!isNextPathName(name)) return;

    if (findNextPathName(name, "route")) {
      appApiRoutes.push(`/${path.relative(appRoot, fullName).replace(/\\/g, "/")}`);
    }

    if (findNextPathName(name, "page")) {
      appRoutes.push(`/${path.relative(appRoot, fullName).replace(/\\/g, "/").replace(/\/\([^)]*\)/g, "")}`);
    }
  });
};
if (fs.existsSync(appRoot)) mainForApp(appRoot);

const mainForPages = (dirName, nestLevel = 0, isApi = false) => {
  const items = fs.readdirSync(dirName);
  items.sort((a, b) => {
    if (fs.statSync(path.join(dirName, a)).isDirectory()) return 1;
    if (fs.statSync(path.join(dirName, b)).isDirectory()) return -1;
    if (findNextPathName(a, "index")) return -1;
    if (findNextPathName(b, "index")) return 1;
    return 0;
  }).forEach(name => {
    let api = isApi;
    if (nestLevel === 0) {
      if (name.startsWith("_")) return;
      if (name === "api") api = true;
    }
    const fullName = path.join(dirName, name);
    if (fs.statSync(fullName).isDirectory()) {
      mainForPages(fullName, nestLevel + 1, api);
      return;
    }

    if (api) {
      const relativePathName = `/${path.relative(pageRoot, fullName).replace(/\\/g, "/")}`;
      pagesApiRoutes.push(relativePathName);
      return;
    }

    pagesRoutes.push(`/${path.relative(pageRoot, fullName).replace(/\\/g, "/")}`);
    return;
  });
}
if (fs.existsSync(pageRoot)) mainForPages(pageRoot);

const pickNextPathName = (fileName) => {
  const ex = isNextPathName(fileName);
  if (ex) return fileName.replace(/\(.+\)\//g, "").replace(`.${ex}`, "");
  return "";
};

const pickNextPathNameAsPages = (fileName) => {
  const pn = pickNextPathName(fileName);
  return pn.match(/(.*)\/index/)?.[1] ?? pn;
};

const routeMap = {};
appApiRoutes.forEach(pathName => {
  const pn = pickNextPathName(pathName).match(/(.*)\/route/)?.[1] || "/";
  if (routeMap[pn] == null) routeMap[pn] = [];
  routeMap[pn].push(pathName);
});
Object.keys(routeMap).forEach(pn => {
  const pathList = routeMap[pn];
  if (pathList.length === 1) return;
  pathList.forEach(pathName => {
    if (appMode === "mock") {
      if (!pathName.match(/\.mock\.tsx?/)) {
        appApiRoutes.splice(appApiRoutes.findIndex(route => route === pathName), 1);
      }
    } else {
      if (pathName.match(/\.mock\.tsx?/)) {
        appApiRoutes.splice(appApiRoutes.findIndex(route => route === pathName), 1);
      }
    }
  });
});

const contents = `// generate by script
// do not edit

type AppRoutePath = ${(() => {
    !quiet && process.stdout.write(`-- app route -- ${appRoutes.length}\n`);
    if (appRoutes.length === 0) return "\"\"";
    return appRoutes.map(pathName => {
      const pn = pickNextPathName(pathName).match(/(.*)\/page/)?.[1] || "/";
      !quiet && process.stdout.write(`${pathName} -> ${pn}\n`);
      return `"${pn}"`;
    }).join("\n  | ");
  })()};

type AppApiPath = ${(() => {
    !quiet && process.stdout.write(`\n-- app api -- ${appApiRoutes.length}\n`);
    if (appApiRoutes.length === 0) return "\"\"";
    return appApiRoutes.map(pathName => {
      const pn = pickNextPathName(pathName).match(/(.*)\/route/)?.[1] || "/";
      !quiet && process.stdout.write(`${pathName} -> ${pn}\n`);
      return `"${pn}"`;
    }).join("\n  | ");
  })()};

type TypeofAppApi = {
${(() => {
    return appApiRoutes.map(pathName => {
      const pn = pickNextPathName(pathName)?.match(/(.*)\/route/)?.[1] || "/";
      return `  "${pn}": typeof import("src/${appAlias}${pathName}");`;
    }).join("\n");
  })()}
};

type PagesRoutePath = ${(() => {
    !quiet && process.stdout.write(`\n-- pages route -- ${pagesRoutes.length}\n`);
    if (pagesRoutes.length === 0) return "\"\"";
    return pagesRoutes.map(pathName => {
      const pn = pickNextPathNameAsPages(pathName);
      !quiet && process.stdout.write(`${pathName} -> ${pn}\n`);
      return `"${pn}"`;
    }).join("\n  | ");
  })()};

type PagesApiPath = ${(() => {
    !quiet && process.stdout.write(`\n-- pages api -- ${pagesApiRoutes.length}\n`);
    if (pagesApiRoutes.length === 0) return "\"\"";
    return pagesApiRoutes.map(pathName => {
      const pn = pickNextPathNameAsPages(pathName);
      !quiet && process.stdout.write(`${pathName} -> ${pn}\n`);
      return `"${pn}"`;
    }).join("\n  | ");
  })()};

type TypeofPagesApi = {
${(() => {
    return pagesApiRoutes.map(pathName => {
      const pn = pickNextPathNameAsPages(pathName);
      return `  "${pn}": typeof import("src/${pageAlias}${pathName}");`;
    }).join("\n");
  })()}
};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
`;
const typesDir = path.join(srcRoot, "types");
if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });
fs.writeFileSync(path.join(srcRoot, "types/route.d.mts"), contents);

const duplicatedRoutes = [];
appRoutes.forEach(appRoute => {
  for (const pagesRoute of pagesRoutes) {
    if (pagesRoute === appRoute) {
      duplicatedRoutes.push(appRoute)
      return;
    }
  }
});

if (duplicatedRoutes.length > 0) {
  process.stdout.write(`\n-- duplicated route -- ${duplicatedRoutes.length}\n`);
  duplicatedRoutes.forEach(pathName => {
    process.stdout.write(`${pathName}\n`);
  });
}

const duplicatedApiRoutes = [];
appApiRoutes.forEach(apiRoute => {
  for (const pagesApiRoute of pagesApiRoutes) {
    if (pagesApiRoute === apiRoute) {
      duplicatedApiRoutes.push(apiRoute);
      return;
    }
  }
});

if (duplicatedApiRoutes.length > 0) {
  process.stdout.write(`\n-- duplicated api -- ${duplicatedApiRoutes.length}\n`);
  duplicatedApiRoutes.forEach(pathName => {
    process.stdout.write(`${pathName}\n`);
  });
}

process.stdout.write("\n");
