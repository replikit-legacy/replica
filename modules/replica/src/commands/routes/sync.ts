import { Command, rest } from "@replikit/commands";
import { Channel } from "@replikit/storage";
import { fromCode } from "@replikit/messages";
import {
    RouteChannelMode,
    Route,
    ReplicaLocale,
    ReplicaMemberPermission,
    ReplicaRouteRole,
    ReplicaUserPermission,
    renderRouteWithChannels
} from "@replica/replica";
import { AuthorizationLocale } from "@replikit/authorization";
import { CommandResult } from "@replikit/commands/typings";

export class SyncCommand extends Command {
    name = "sync";

    channels = rest(Channel, { minCount: 2 });

    async execute(): Promise<CommandResult> {
        const { channels } = this;

        const hasDuplicates = channels.some(x => channels.filter(y => y._id === x._id).length > 1);
        if (hasDuplicates) {
            const locale = this.getLocale(ReplicaLocale);
            return fromCode(locale.hasDuplicates);
        }

        const user = await this.getUser();
        if (!user.hasPermission(ReplicaUserPermission.SyncAnyChannels)) {
            for (const channel of channels) {
                const member = await user.getMember(channel.controller, channel.localId);
                if (!member?.hasPermission(ReplicaMemberPermission.ManageRoutes)) {
                    const locale = this.getLocale(AuthorizationLocale);
                    return fromCode(locale.accessDenied);
                }
            }
        }

        const repository = this.connection.getRepository(Route);
        const existing = await repository.collection
            .find({ channels: { $all: channels.map(x => ({ $elemMatch: { channelId: x._id } })) } })
            .limit(1)
            .count();

        const locale = this.getLocale(ReplicaLocale);
        if (existing) {
            return fromCode(locale.routeAlreadyExists);
        }

        const manager = { roles: [ReplicaRouteRole.Owner.id], permissions: [], userId: user._id };
        const route = repository.create({
            channels: channels.map(x => ({
                channelId: x._id as number,
                mode: RouteChannelMode.Both
            })),
            managers: [manager]
        });
        await route.save();

        const routeInfo = renderRouteWithChannels(route, manager.roles);
        const result = `${locale.routeCreated}\n${routeInfo}`;
        return fromCode(result);
    }
}
