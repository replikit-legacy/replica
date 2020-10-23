import {
    ReplicaLocale,
    ReplicationContext,
    byChannel,
    createMessageFilter,
    replicateMessage,
    whitespaceToken,
    renderHeader,
    formatPlainText
} from "@replica/replica";
import { MessageGroup } from "@replica/replica/typings";
import { TextTokenProp, TextTokenKind } from "@replikit/core";
import { ControllerName, OutMessage } from "@replikit/core/typings";
import { createPlainTextToken, MessageBuilder } from "@replikit/messages";
import { VKController } from "@replikit/vk";

type MessageTransformerResult = (OutMessage | MessageBuilder)[] | void;

type MessageTransformerHandler = (
    replicationContext: ReplicationContext
) => MessageTransformerResult | Promise<MessageTransformerResult>;

interface MessageTransformer {
    from?: string[];
    notFrom?: string[];
    to?: string[];
    notTo?: string[];
    edit?: boolean;
    handler: MessageTransformerHandler;
}

type TransformerRoutePoint = ControllerName[] | ControllerName | undefined;

interface TransformerRoute {
    from?: TransformerRoutePoint;
    notFrom?: TransformerRoutePoint;
    to?: TransformerRoutePoint;
    notTo?: TransformerRoutePoint;
    edit?: boolean;
}

function byDestination(from: string, to: string): (value: MessageTransformer) => boolean {
    return x =>
        (!x.from || x.from.includes(from)) &&
        (!x.notFrom || !x.notFrom.includes(from)) &&
        (!x.to || x.to.includes(to)) &&
        (!x.notTo || !x.notTo.includes(to));
}

function normalizeRoutePoint(point: TransformerRoutePoint): string[] | undefined {
    if (!point) return undefined;
    return typeof point === "string" ? [point] : point;
}

class MessageTransformerStorage {
    private readonly transformers: MessageTransformer[] = [];

    add(route: TransformerRoute, handler: MessageTransformerHandler): void {
        this.transformers.push({
            from: normalizeRoutePoint(route.from),
            to: normalizeRoutePoint(route.to),
            notFrom: normalizeRoutePoint(route.notFrom),
            notTo: normalizeRoutePoint(route.notTo),
            handler,
            edit: route.edit
        });
    }

    async transform(replicationContext: ReplicationContext): Promise<void> {
        const from = replicationContext.context.controller.name;
        const to = replicationContext.targetChannel.controller;
        const transformers = this.transformers.filter(byDestination(from, to));
        const additionalMessages = replicationContext.additionalMessages;

        for (const transformer of transformers) {
            if (replicationContext.isEdit && !transformer.edit) continue;

            const result = await transformer.handler(replicationContext);
            if (!result) continue;
            for (const messageLike of result) {
                const sideMessage =
                    messageLike instanceof MessageBuilder ? messageLike.build() : messageLike;
                if (replicationContext.preventMainMessageReplication) {
                    // TODO Transformers for side messages
                    const outMessage = replicationContext.builder.build();
                    sideMessage.header = outMessage.header;
                }
                additionalMessages.push(sideMessage);
            }
        }
    }
}

function addReplyHeader(
    builder: MessageBuilder,
    replicationContext: ReplicationContext
): MessageBuilder {
    const { context, targetController } = replicationContext;
    const locale = context.getLocale(ReplicaLocale);
    return builder.addTokens([
        {
            kind: TextTokenKind.Text,
            text: locale.messageFrom,
            props: [TextTokenProp.Bold]
        },
        whitespaceToken,
        renderHeader(
            context.controller.name,
            targetController.name,
            context.message.reply!.account
        ),
        { kind: TextTokenKind.Text, text: "\n", props: [] }
    ]);
}

export const transformers = new MessageTransformerStorage();

transformers.add({ from: "tg", notTo: "tg" }, replicationContext => {
    const { context, headerDescription } = replicationContext;
    const message = context.message;
    if (!message.forwarded.length) return;
    const forwardedMessage = message.forwarded[0];
    headerDescription.forwardedTarget = forwardedMessage;
    replicationContext.preventMainMessageReplication = true;
});

transformers.add({ to: "dc" }, replicationContext => {
    const { builder, context } = replicationContext;
    replicationContext.preventHeader = true;
    replicationContext.headerDescription.shortHeader = true;
    const formatted = formatPlainText(replicationContext.buildHeader());
    builder.addHeader({
        username: formatted,
        avatar: context.account.avatar?.url
    });
});

transformers.add({ from: "tg", notTo: "tg" }, replicationContext => {
    const { builder, context } = replicationContext;
    const message = context.message;
    if (!message.forwarded.length) return;
    const forwardedMessage = message.forwarded[0];
    const forwardedImitation = new MessageBuilder()
        .pipe(replicateMessage, context.controller, forwardedMessage)
        .build();
    builder.edit(message => (message.forwarded = []));
    return [forwardedImitation];
});

transformers.add({ from: "vk" }, async ({ context }) => {
    const metadata = context.message.metadata;
    if (metadata.globalId && metadata.globalId > 0) return;
    const { backend } = context.controller as VKController;
    const messages = backend.api.messages;
    const result = await messages.getByConversationMessageId({
        peer_id: context.message.channel.id as number,
        conversation_message_ids: metadata.messageIds as number[]
    });
    metadata.globalId = result.items[0].id;
});

transformers.add({ edit: true, notTo: "tg" }, async replicationContext => {
    const { builder, context, targetChannel } = replicationContext;
    if (!context.message.reply) return;
    const replyMessage = context.message.reply;

    const collection = context.connection.getRawCollection<MessageGroup>("messages");
    const filter = createMessageFilter(context, replyMessage);
    const result = await collection.findOne(filter);

    const existing = result?.messages.find(byChannel(targetChannel));
    // TODO vk controller reply in edited messages
    if (existing) {
        builder.addReply(existing.metadata);
        return;
    }

    const replyImitation = new MessageBuilder()
        .pipe(addReplyHeader, replicationContext)
        .pipe(replicateMessage, context.controller, replyMessage)
        .build();
    return [replyImitation];
});

transformers.add({ to: "dc" }, replicationContext => {
    const { builder, context } = replicationContext;
    if (!context.message.reply?.text) {
        return;
    }

    const quote = context.message.reply.text
        .split("\n")
        .map(x => `> ${x}`)
        .join("\n");
    const replyText = `${quote}\n@${context.message.reply.account.username} `;

    builder.edit(message => {
        message.tokens = [createPlainTextToken(replyText), ...message.tokens];
    });
});
