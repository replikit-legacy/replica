import { MessageMetadata, Identifier } from "@replikit/core/typings";

export interface Message {
    controller: string;
    channelId: Identifier;
    accountId?: Identifier;
    hasHeader?: boolean;
    metadata: MessageMetadata;
}
