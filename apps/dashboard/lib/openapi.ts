import { createOpenAPI } from "fumadocs-openapi/server";
import minimalAccentDark from "../styles/minimal-accent-dark.json" with {
  type: "json",
};
import minimalAccentLight from "../styles/minimal-accent-light.json" with {
  type: "json",
};

export const openapi = createOpenAPI({
  // the OpenAPI schema - not used during build since docs are pre-generated
  // This is only used for runtime rendering of APIPage components
  input: [],
  shikiOptions: {
    themes: {
      light: minimalAccentLight as unknown as any,
      dark: minimalAccentDark as unknown as any,
    },
  },
});
