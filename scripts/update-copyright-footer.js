const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const RESUMES_DIR = path.resolve(process.cwd(), "resumes");

const FILES_TO_CHECK = new Set(
    fs
        .readdirSync(RESUMES_DIR, { encoding: "utf8" })
        .filter((file) => file.endsWith(".json"))
        .map((file) => `resumes/${file}`)
);

function getStagedFiles() {
    return execSync("git diff --cached --name-only", {
        encoding: "utf8",
    })
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean);
}

function updateJsonFile(relativePath) {
    const absolutePath = path.resolve(process.cwd(), relativePath);

    const raw = fs.readFileSync(absolutePath, "utf8");
    const json = JSON.parse(raw);
    const date = new Date()

    json.footer.copyright = `© ${date.getFullYear()} Chakradhar Reddy Devireddy`
    // Aug 2025 format
    json.footer.lastUpdated = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
    });

    fs.writeFileSync(absolutePath, JSON.stringify(json, null, 2) + "\n");

    execSync(`git add "${relativePath}"`);
}

function main() {
    if (!fs.existsSync(RESUMES_DIR)) {
        console.error(
            "Resumes directory does not exist. Please run this script from the root directory of the repository.")
        process.exit(0);
    }

    const stagedFiles = getStagedFiles();

    const changedResumeFiles = stagedFiles.filter((file) =>
        FILES_TO_CHECK.has(file)
    );

    for (const file of changedResumeFiles) {
        updateJsonFile(file);
    }
}

main();