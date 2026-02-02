import { hc } from "@hono/hono/client";
import { AppType } from "steamutils-backend";
import config from "../../config.ts";

const client = hc<AppType>(config.apiUrl);

export default client;
