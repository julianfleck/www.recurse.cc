import { createOpenAPI } from "fumadocs-openapi/server";
import minimalAccentDark from "../styles/minimal-accent-dark.json" with {
  type: "json",
};
import minimalAccentLight from "../styles/minimal-accent-light.json" with {
  type: "json",
};

export const openapi = createOpenAPI({
  // the OpenAPI schema, you can also give it an external URL.
  input: process.env.NEXT_PUBLIC_API_BASE_URL 
    ? [`${process.env.NEXT_PUBLIC_API_BASE_URL}/openapi.json`]
    : [],
  shikiOptions: {
    themes: {
      light: minimalAccentLight as unknown as any,
      dark: minimalAccentDark as unknown as any,
    },
  },
});
