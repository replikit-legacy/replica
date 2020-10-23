import { MessageContext } from "@replikit/router";
import { Channel, FallbackStrategy } from "@replikit/storage";
import { Handler } from "@replikit/router/typings";
import {
    Route,
    RouteChannelMode,
    logger,
    ReplicationContext,
    transformers
} from "@replica/replica";
import { config, resolveController } from "@replikit/core";

export type ReplicationCallback = (replicationContext: ReplicationContext) => Promise<void>;

export function createReplicationHandler(callback: ReplicationCallback): Handler<MessageContext> {
    return async (context, next) => {
        const message = context.message;
        const isEmptyMessage =
            !message.text &&
            !message.attachments.length &&
            !message.forwarded.length &&
            !message.reply;

        if (isEmptyMessage) {
            return next();
        }

        if (context.message.text?.startsWith(config.commands.prefix)) {
            return next();
        }

        const channel = await context.getChannel(FallbackStrategy.Undefined);
        if (!channel) {
            return next();
        }

        const channelRepository = context.connection.getRepository(Channel);
        const routeRepository = context.connection.getRepository(Route);

        const routes = await routeRepository.findMany({
            channels: { $elemMatch: { channelId: channel._id } }
        });

        for (const route of routes) {
            const currentRouteChannel = route.channels.find(x => x.channelId === channel._id);
            if (currentRouteChannel!.mode === RouteChannelMode.Read) {
                continue;
            }
            for (const routeChannel of route.channels) {
                if (routeChannel.channelId === channel._id) {
                    continue;
                }
                if (routeChannel.mode === RouteChannelMode.Write) {
                    continue;
                }
                const targetChannel = await channelRepository.findOne({
                    _id: routeChannel.channelId
                });
                if (!targetChannel) {
                    logger.warn(
                        `Unable to find channel ${routeChannel.channelId} linked with route ${route._id}`
                    );
                    continue;
                }
                const targetController = resolveController(targetChannel.controller);
                const replicationContext = new ReplicationContext(
                    context,
                    targetChannel,
                    targetController
                );
                await transformers.transform(replicationContext);
                await callback(replicationContext);
            }
        }
        return next();
    };
}
