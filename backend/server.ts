const { buildApp } = require("./app") as typeof import("./app");

async function start(): Promise<void> {
  const app = buildApp();
  const host = process.env.HOST || "0.0.0.0";
  const port = Number(process.env.PORT) || 8080;

  try {
    await app.listen({
      host,
      port,
    });
  } catch (error) {
    app.log.error(error);
    console.error(error);
    process.exit(1);
  }
}

void start();
