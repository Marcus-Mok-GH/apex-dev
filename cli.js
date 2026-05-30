#!/usr/bin/env node

import { runAuto } from "./index.js";

const args = process.argv.slice(2);

runAuto(args).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
