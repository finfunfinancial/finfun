import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Portal pages (login, My courses, admin) read Supabase rows without generated types, and show small
    // images straight from /public. ponytail: generate types with `supabase gen types` to type these rows.
    files: ["app/admin/**", "app/my-courses/**", "app/certificate/**", "app/verify/**", "components/lms/**", "lib/lms/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off", "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The LMS (lms/) is a separate app with its own config.
    "lms/**",
    // Static games copied in as-is (e.g. Pocket Money Manager) keep their own style.
    "public/games/**",
  ]),
]);

export default eslintConfig;
