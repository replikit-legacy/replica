import PQueue from "p-queue";
import { Controller } from "@replikit/core";
import { InMessage, SendedMessage, Identifier } from "@replikit/core/typings";
import { Message, MessageGroup } from "@replica/replica/typings";
import { connection } from "@replikit/storage";
import { ReplicationContext, HeaderDescription } from "@replica/replica";

interface ChannelThread {
    queue: PQueue;
    headerDescription?: HeaderDescription;
    timeout?: NodeJS.Timeout;
}

export class MessageDispatcher {
    private threadMap = new Map<string, ChannelThread>();

    private getThreadKey(controller: Controller, localId: Identifier): string {
        return `${controller.name}${localId.toString()}`;
    }

    public reset(controller: Controller, localId: Identifier): void {
        const key = this.getThreadKey(controller, localId);
        const thread = this.threadMap.get(key);
        if (thread) {
            thread.headerDescription = undefined;
            if (thread.timeout) {
                clearTimeout(thread.timeout);
            }
        }
    }

    async saveMessages(
        originalController: Controller,
        targetController: Controller,
        channelId: Identifier,
        source: InMessage,
        messages: SendedMessage[],
        hasHeader: boolean
    ): Promise<void> {
        const result: Message[] = [
            {
                channelId: source.channel.id,
                accountId: source.account.id,
                controller: originalController.name,
                metadata: source.metadata
            }
        ];
        for (const [i, message] of messages.entries()) {
            result.push({
                channelId,
                controller: targetController.name,
                metadata: message.metadata,
                hasHeader: i === 0 ? hasHeader : false
            });
        }
        await connection.getRawCollection<MessageGroup>("messages").insertOne({ messages: result });
    }

    public dispatch(replicationContext: ReplicationContext): void {
        const { targetController, targetChannel, headerDescription, context } = replicationContext;
        const key = this.getThreadKey(targetController, targetChannel.localId);
        let thread = this.threadMap.get(key);
        if (!thread) {
            thread = { queue: new PQueue({ concurrency: 1 }) };
            this.threadMap.set(key, thread);
        }

        void thread.queue.add(async () => {
            const oldHeader = thread!.headerDescription;
            const needHeader = !oldHeader || !oldHeader.equals(headerDescription);
            const messages = replicationContext.build(needHeader);
            if (needHeader) {
                thread!.headerDescription = headerDescription;
                thread!.timeout = setTimeout(
                    this.reset.bind(this, targetController, targetChannel.localId),
                    60000
                );
            }
            const sendedMessages: SendedMessage[] = [];
            for (const message of messages) {
                const sended = await targetController.sendMessage(targetChannel.localId, message);
                sendedMessages.push(sended);
            }
            void this.saveMessages(
                context.controller,
                targetController,
                targetChannel.localId,
                context.message,
                sendedMessages,
                needHeader
            );
        });
    }
}

export const messageDispatcher = new MessageDispatcher();
