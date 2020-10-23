import { Configuration } from "@replikit/core/typings";

import "@services/management";
import "@services/profile";
import "@replica/replica";
import "@replikit/telegram";
import "@replikit/vk";
import "@replikit/discord";

const config: Configuration = {
    discord: {
        token: process.env.DISCORD_TOKEN!
    },
    vk: {
        token: process.env.VK_TOKEN!,
        pollingGroup: +process.env.VK_GROUP!
    },
    telegram: {
        token: process.env.TELEGRAM_TOKEN!
    },
    storage: {
        connection: process.env.MONGO_CONNECTION!
    },
    i18n: {
        defaultLocale: process.env.DEFAULT_LOCALE
    },
    management: {
        admins: process.env.ADMINS?.split(",").map(x => x.trim()) ?? []
    }
};

export default config;
