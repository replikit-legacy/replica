import { Channel } from "@replikit/storage";
import { Controller } from "@replikit/core";
import {
    HeaderDescription,
    ReplicatingMessageBuilder,
    ReplicaLocale,
    newlineToken
} from "@replica/replica";
import { MessageContext } from "@replikit/router";
import { OutMessage, TextToken } from "@replikit/core/typings";

export class ReplicationContext {
    headerDescription: HeaderDescription;
    builder: ReplicatingMessageBuilder;
    isEdit: boolean;
    additionalMessages: OutMessage[] = [];
    preventMainMessageReplication = false;
    preventHeader = false;

    constructor(
        public context: MessageContext,
        public targetChannel: Channel,
        public targetController: Controller
    ) {
        this.headerDescription = new HeaderDescription(
            context.controller.name,
            context.account,
            targetController.name
        );
        this.builder = new ReplicatingMessageBuilder(context.controller, context.message);
        this.isEdit = context.event.type === "message:edited";
    }

    buildForwardedHeader(): TextToken[] {
        const locale = this.context.getLocale(ReplicaLocale);
        return this.headerDescription.buildForwarded(locale);
    }

    buildHeader(): TextToken[] {
        const locale = this.context.getLocale(ReplicaLocale);
        return this.headerDescription.build(locale);
    }

    build(mainHeader?: boolean): OutMessage[] {
        if (mainHeader && !this.preventHeader) {
            const header = this.buildHeader();
            this.builder.edit(message => {
                message.tokens = [...header, newlineToken, ...message.tokens];
            });
        }
        if (this.preventMainMessageReplication && !this.preventHeader) {
            const header = mainHeader ? this.buildHeader() : this.buildForwardedHeader();
            this.additionalMessages[0].tokens.unshift(...header, newlineToken);
            return this.additionalMessages;
        }
        const mainMessage = this.builder.build();
        return [mainMessage, ...this.additionalMessages];
    }
}
