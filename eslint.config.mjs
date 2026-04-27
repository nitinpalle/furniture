import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "extracted/**",
      "scripts/**/*.cjs",
      "next-env.d.ts",
      "public/**",
      "dist/**",
      "build/**",
    ],
  },
];

export default config;
