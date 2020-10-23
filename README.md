# Replica

There is no detailed documentation here. Just deploy the docker image and specify folowing environment variables. Use `/help` to discover commands.

```
docker run replikit/replica
```

## Environment variables

| Variable                  | Description                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| DISCORD_TOKEN             | Token for Discord                                                                             |
| TELEGRAM_TOKEN            | Token for Telegram                                                                            |
| VK_TOKEN                  | Token for VK                                                                                  |
| VK_GROUP                  | Group id for VK                                                                               |
| REPLIKIT_EXCLUDED_MODULES | Comma-separated list of modules to disable. For example, `@replikit/vk` to disable vk support |
| DEFAULT_LOCALE            | Locale to use as default                                                                      |
| MONGO_CONNECTION          | MongoDB connection string. Should include database name                                       |
| ADMINS                    | Comma-separated list of usernames to be assigned the SuperAdmin role                          |
