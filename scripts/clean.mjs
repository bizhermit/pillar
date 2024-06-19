import fs from "fs";
import path from "path";

const projectRoot = path.join(import.meta.dirname, "..");

const removeDirContents = (rootDir) => {
  if (!fs.existsSync(rootDir)) return;
  fs.readdirSync(rootDir).forEach(name => {
    const fullName = path.join(rootDir, name);
    fs.statSync(fullName).isDirectory() ? fs.rmdirSync(fullName, { recursive: true }) : fs.rmSync(fullName);
  });
};

removeDirContents(path.join(projectRoot, ".next"));
removeDirContents(path.join(projectRoot, ".server"));
