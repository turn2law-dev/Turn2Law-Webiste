const path = require("path");
const { spawnSync } = require("child_process");

// Keep the existing .eslintrc.json configuration usable with ESLint 9 while
// keeping the command portable across Windows and Linux CI runners.
process.env.ESLINT_USE_FLAT_CONFIG = "false";

const eslintBin = path.join(__dirname, "..", "node_modules", "eslint", "bin", "eslint.js");
const result = spawnSync(process.execPath, [eslintBin, "src", "--ext", ".ts,.tsx,.js,.jsx"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
