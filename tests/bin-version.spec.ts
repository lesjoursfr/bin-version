import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import binaryVersion from "../src/index.js";

const versionRegex = /\d+\.\d+\.\d+/;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixture = path.join.bind(path, __dirname, "fixtures");

it("does-not-exist", async () => {
  await assert.rejects(binaryVersion("does-not-exist"), { message: /Couldn't find/ });
}).timeout(5000);

it("non-executable", async () => {
  await assert.rejects(binaryVersion(fixture("non-executable.js")));
}).timeout(5000);

it("non-versioned", async () => {
  await assert.rejects(binaryVersion(fixture("non-versioned.js")), { message: /Couldn't find version/ });
}).timeout(5000);

it("anything accepting `--version`", async () => {
  assert.strictEqual(await binaryVersion(fixture("versioned-type1.js")), "1.2.3");
}).timeout(5000);

it("anything accepting `version`", async () => {
  assert.strictEqual(await binaryVersion(fixture("versioned-type2.js")), "1.2.3");
}).timeout(5000);

it("curl", async () => {
  assert.match(await binaryVersion("curl"), versionRegex);
}).timeout(5000);

it("npm", async () => {
  assert.match(await binaryVersion("npm"), versionRegex);
}).timeout(5000);

it("openssl", async () => {
  assert.match(await binaryVersion("openssl"), versionRegex);
}).timeout(5000);

it("custom args", async () => {
  assert.match(await binaryVersion(fixture("versioned-type1.js"), { args: ["--version"] }), versionRegex);
}).timeout(5000);

it("php", async () => {
  assert.strictEqual(await binaryVersion(fixture("php.js")), "7.0.0");
}).timeout(5000);
