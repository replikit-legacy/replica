import { AccountInfo, TextToken, InMessage } from "@replikit/core/typings";
import { ReplicaLocale, renderHeader } from "@replica/replica";
import { TextTokenKind, ChannelType } from "@replikit/core";

export class HeaderDescription {
    forwardedTarget?: InMessage;

    shortHeader = false;

    constructor(
        public controller: string,
        public account: AccountInfo,
        private targetController: string
    ) {}

    equals(other: HeaderDescription): boolean {
        return this.controller === other.controller && this.account.id === other.account.id;
    }

    createForwardedHeader(): TextToken {
        if (this.forwardedTarget!.channel.type === ChannelType.PostChannel) {
            return renderHeader(
                this.controller,
                this.targetController,
                this.forwardedTarget!.channel
            );
        }
        return renderHeader(this.controller, this.targetController, this.forwardedTarget!.account);
    }

    createAccountHeader(account: AccountInfo): TextToken {
        return renderHeader(this.controller, this.targetController, account);
    }

    buildForwarded(locale: ReplicaLocale): TextToken[] {
        if (!this.forwardedTarget) {
            throw new Error("No forwarded target");
        }
        return [
            {
                kind: TextTokenKind.Text,
                text: `${locale.forwardedFrom(this.forwardedTarget.channel)} `,
                props: []
            },
            this.createForwardedHeader()
        ];
    }

    build(locale: ReplicaLocale): TextToken[] {
        const result: TextToken[] = [];
        result.push(this.createAccountHeader(this.account));
        if (this.forwardedTarget) {
            const forwardedFrom = this.shortHeader
                ? " ⤷ "
                : ` ⤷ ${locale.forwardedFrom(this.forwardedTarget.channel)} `;
            result.push({
                kind: TextTokenKind.Text,
                text: forwardedFrom,
                props: []
            });
            result.push(this.createForwardedHeader());
        }
        return result;
    }
}
