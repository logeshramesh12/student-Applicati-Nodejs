import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const styles = {
  global: {
    body: {
      bg: "#0f172a",
      color: "#e2e8f0",
    },
  },
};

export const theme = extendTheme({ config, styles });