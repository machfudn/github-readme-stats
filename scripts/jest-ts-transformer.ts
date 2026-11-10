import { stripTypeScriptTypes } from "node:module";

export default {
  process(sourceText: string, sourcePath: string) {
    if (!sourcePath.endsWith(".ts")) {
      return { code: sourceText };
    }
    return {
      code: stripTypeScriptTypes(sourceText, { mode: "strip" }),
    };
  },
};
