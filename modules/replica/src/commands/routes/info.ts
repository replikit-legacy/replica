import {
    renderRoute,
    ReplicaRoutePermission,
    Route,
    routeAuthorization,
    RouteChannelMode
} from "@replica/replica";
import { Command, required } from "@replikit/commands";
import { CommandResult } from "@replikit/commands/typings";
import { fromCode } from "@replikit/messages";
import { Channel } from "@replikit/storage";
import { ManagementLocale } from "@services/management";

export class InfoCommand extends Command {
    name = "info";

    route = required(Route);

    middleware = [routeAuthorization(ReplicaRoutePermission.ManageRoute)];

    async execute(): Promise<CommandResult> {
        const user = await this.getUser();
        const manager = this.route.getManager(user)!;
        const title = renderRoute(this.route, manager.roles);
        const channelRepository = this.connection.getRepository(Channel);
        const channelIds = this.route.channels.map(x => x.channelId);
        const channels = await channelRepository.findMany({ _id: { $in: channelIds } });
        const locale = this.getLocale(ManagementLocale);
        const channelInfoPromises = this.route.channels.map(async routeChannel => {
            const channel = channels.find(x => x._id === routeChannel.channelId)!;
            const info = await channel.getChannelInfo();
            const title = info?.title ?? locale.channelUnavailable;
            return `[${routeChannel.channelId}] [${RouteChannelMode[routeChannel.mode]}] ${title}`;
        });
        const channelInfos = await Promise.all(channelInfoPromises);
        return fromCode(`${title}\n${locale.channels}:\n${channelInfos.join("\n")}`);
    }
}
