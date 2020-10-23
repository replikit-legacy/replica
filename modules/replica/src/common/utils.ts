import { renderRoles, renderDisplayName } from "@services/management";
import { Channel, FallbackStrategy } from "@replikit/storage";
import { MessageContext } from "@replikit/router";
import { Route, UnsupportedControllerError, ReplicaEntityType } from "@replica/replica";
import {
    AccountInfo,
    InMessage,
    ForwardedMessage,
    Condition,
    TextToken,
    HasFields
} from "@replikit/core/typings";
import { PermissionInstance } from "@replikit/permissions";
import { Middleware } from "@replikit/commands/typings";
import { MiddlewareStage } from "@replikit/commands";
import { AuthorizationLocale } from "@replikit/authorization";
import { fromCode, MessageBuilder } from "@replikit/messages";
import { MessageGroup, Message } from "@replica/replica/typings";
import { FilterQuery } from "mongodb";
import { Controller, TextTokenKind, TextTokenProp, config } from "@replikit/core";

export const newlineToken: TextToken = {
    kind: TextTokenKind.Text,
    text: "\n",
    props: []
};

export const whitespaceToken: TextToken = {
    kind: TextTokenKind.Text,
    text: " ",
    props: []
};

export function renderHeader(
    controller: string,
    targetController: string,
    account: AccountInfo
): TextToken {
    if (targetController === "vk") {
        return {
            kind: TextTokenKind.Link,
            text: renderDisplayName(account),
            url: `https://vk.com/public${config.vk.pollingGroup}`,
            props: []
        };
    }
    return {
        kind: TextTokenKind.Link,
        text: renderDisplayName(account),
        url: createAccountHeaderLink(controller, account),
        props: [TextTokenProp.Bold]
    };
}

export function renderRouteWithChannels(route: Route, roles: string[]): string {
    const channels = route.channels.map(x => x.channelId).join(" ⇆ ");
    return `${renderRoute(route, roles)} ${channels}`;
}

export function renderRoute(route: Route, roles: string[]): string {
    const roleSection = renderRoles(ReplicaEntityType.Route, roles);
    return `[${route._id}] [${roleSection}]`;
}

export function formatPlainText(tokens: TextToken[]): string {
    return tokens.map(x => x.text ?? "").join("");
}

export function createAccountHeaderLink(controller: string, account: AccountInfo): string {
    switch (controller) {
        case "vk":
            return `https://vk.com/id${account.id}`;
        case "tg":
            return `https://t.me/${account.username ?? "username"}`;
        case "dc":
            return `https://discordapp.com`;
        default:
            throw new UnsupportedControllerError(controller);
    }
}

export function routeAuthorization(
    permission: PermissionInstance<typeof ReplicaEntityType.Route>
): Middleware {
    return {
        stage: MiddlewareStage.AfterResolution,
        handler: async (context, next) => {
            const route = context.params["route"] as Route;
            const user = await context.getUser(FallbackStrategy.Undefined);
            const locale = context.getLocale(AuthorizationLocale);
            function replyAccessDenied(): unknown {
                return context.reply(fromCode(locale.accessDenied));
            }
            if (!user) {
                return replyAccessDenied();
            }
            const manager = route.getManager(user);
            if (!manager) {
                return replyAccessDenied();
            }
            return manager.hasPermission(permission) ? next() : replyAccessDenied();
        }
    };
}

export function createMessageFilter(
    context: MessageContext,
    message: InMessage
): FilterQuery<MessageGroup> {
    const controllerName = (message as ForwardedMessage).controllerName ?? context.controller.name;
    return {
        messages: {
            $elemMatch: {
                controller: controllerName,
                channelId: message.channel.id,
                $or: [
                    { "metadata.messageIds": { $in: message.metadata.messageIds } },
                    { "metadata.globalId": { $exists: true, $eq: message.metadata.globalId } }
                ]
            }
        }
    };
}

export function byChannel(targetChannel: Channel): Condition<Message> {
    return x => x.controller === targetChannel.controller && x.channelId === targetChannel.localId;
}

export function replicateMessage<T extends MessageBuilder>(
    builder: T,
    controller: Controller,
    message: InMessage
): T {
    const tokens = controller.tokenizeText(message);
    return builder.addTokens(tokens).addAttachments(message.attachments);
}
export function getEnumNames(enumLike: HasFields): string[] {
    return Object.keys(enumLike)
        .map(key => enumLike[key])
        .filter(value => typeof value === "string") as string[];
}
