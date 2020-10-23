import { MessageBuilder } from "@replikit/messages";
import { OutMessage, InMessage } from "@replikit/core/typings";
import { Controller } from "@replikit/core";
import { replicateMessage } from "@replica/replica";

type MessageEditCallback = (message: OutMessage) => void;

export class ReplicatingMessageBuilder extends MessageBuilder {
    constructor(controller: Controller, message: InMessage) {
        super();
        this.pipe(replicateMessage, controller, message);
    }

    edit(callback: MessageEditCallback): this {
        callback(this.message);
        return this;
    }
}
