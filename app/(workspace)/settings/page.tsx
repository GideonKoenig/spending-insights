import { Settings } from "@/components/settings";

export default function Page() {
  return (
    <Settings
      endpoint={
        new URL(
          "/api/mcp",
          process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
        ).href
      }
    />
  );
}
