import fs from "fs";
import path from "path";

const projectRoot = path.join(import.meta.dirname, "..");

const removeDirContents = (dir) => {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(name => {
    const fullName = path.join(dir, name);
    if (fs.statSync(fullName).isDirectory()) {
      removeDirContents(fullName);
      fs.rmdirSync(fullName);
      return;
    }
    fs.rmSync(fullName);
  });
};

removeDirContents(path.join(projectRoot, ".next"));
removeDirContents(path.join(projectRoot, ".playwright"));
removeDirContents(path.join(projectRoot, "dist/out"));
