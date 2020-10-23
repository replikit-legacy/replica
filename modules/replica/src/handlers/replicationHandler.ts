import { router } from "@replikit/router";
import {
    createReplicationHandler,
    messageDispatcher,
    logger,
    createMessageFilter,
    byChannel,
    replicateMessage
} from "@replica/replica";
import { MessageGroup } from "@replica/replica/typings";
import { resolveController, TextTokenProp } from "@replikit/core";
import { MessageBuilder } from "@replikit/messages";

const receivedHandler = createReplicationHandler(replicationContext => {
    return Promise.resolve(messageDispatcher.dispatch(replicationContext));
});

const editedHandler = createReplicationHandler(async replicationContext => {
    const { context, targetChannel } = replicationContext;
    const connection = context.connection;
    const messages = connection.getRawCollection<MessageGroup>("messages");
    const filter = createMessageFilter(context, context.message);
    const result = await messages.findOne(filter);
    if (!result) {
        logger.debug("Unable to find message group");
        return;
    }
    const existing = result.messages.find(byChannel(targetChannel));
    if (!existing) {
        logger.debug(`Unable to find message replication of type ${targetChannel.controller}`);
        return;
    }
    const targetController = resolveController(targetChannel.controller);
    const builder = new MessageBuilder();
    if (existing.hasHeader) {
        builder.addTokens(replicationContext.buildHeader());
        if (targetController.name !== "vk") {
            builder.addText(" ").addText("(edited)", [TextTokenProp.Bold]);
        }
        builder.addLine();
    }
    builder.pipe(replicateMessage, context.controller, context.message);
    builder.useMetadata(existing);
    await targetController.editMessage(targetChannel.localId, builder.build());
});

router.of("message:received").use(receivedHandler);
router.of("message:edited").use(editedHandler);
