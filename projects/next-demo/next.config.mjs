// @ts-check
/** @type {import('next').NextConfig} */

const IMAGE_SUPPORT = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/private/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "**",
      },
    ],
  },
}

function getConfig() {
  if (process.env.NODE_ENV === "production") {
    console.log("Using PRODUCTION Next config.")
    return {
      ...IMAGE_SUPPORT,
    }
  }
  if (process.env.DEV_MODE === "strict-mode-off") {
    console.log("Strict mode off.")
    return {
      ...IMAGE_SUPPORT,
      reactStrictMode: false,
    }
  }
  console.log("Using DEFAULT Next config.")
  return { ...IMAGE_SUPPORT }
}

const config = getConfig()

export default config
