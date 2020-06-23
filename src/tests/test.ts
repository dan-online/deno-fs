import { assertEquals } from "./test_deps.ts";
import { DenoFs } from "../../mod.ts";
import { FsFile } from "../utils/File.ts";
import { FsError } from "../handlers/Error.ts";

const { resolve } = DenoFs;

let file: DenoFs;

let fileContents = "The quick brown fox jumps over the lazy dog";

Deno.test("open file", () => {
  file = new DenoFs(resolve("./src/tests/test.txt"));
  if (!(file instanceof DenoFs)) {
    throw new Error("not an instance of DenoFs");
  }
});
Deno.test("sync read file", () => {
  const read = file.reader.sync();
  assertEquals(read.contents, fileContents);
});
Deno.test("cb read file", async () => {
  await new Promise((res, rej) => {
    file.reader.callback((err?: Error | FsError, file?: FsFile) => {
      if (err) rej(err);
      assertEquals(file?.contents, fileContents);
      res(file);
    });
  });
});

Deno.test("promise read file", async () => {
  const fileD = await file.reader.promise({});
  assertEquals(fileD.contents, fileContents);
});

Deno.test("sync default read", async () => {
  const fileD = file.read();
  assertEquals(fileD.contents, fileContents);
});

Deno.test("cb default read", async () => {
  await new Promise((res, rej) => {
    file.read((err?: Error | FsError, file?: FsFile) => {
      if (err) rej(err || new Error("File didn't return"));
      assertEquals(file?.contents, fileContents);
      res(file);
    });
  });
});

Deno.test("cb default delete", async () => {
  const delFile = new DenoFs(resolve("./src/tests/del.txt"));
  const val = Math.random();
  delFile.write(val);
  delFile.delete();
  let c;
  try {
    c = delFile.read();
  } catch {}
  if (c) {
    throw new Error("File found: " + c?.contents);
  }
});
