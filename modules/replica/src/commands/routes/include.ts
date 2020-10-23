import { Command, required, rest } from "@replikit/commands";
import { CommandResult } from "@replikit/commands/typings";
import { routeAuthorization, ReplicaRoutePermission, Route, ReplicaLocale } from "@replica/replica";
import { Channel } from "@replikit/storage";
import { fromCode } from "@replikit/messages";

export class IncludeCommand extends Command {
    name = "include";

    middleware = [routeAuthorization(ReplicaRoutePermission.ManageRoute)];

    route = required(Route);
    channels = rest(Channel);

    async execute(): Promise<CommandResult> {
        const locale = this.getLocale(ReplicaLocale);

        for (const channel of this.channels) {
            if (!this.route.addChannel(channel)) {
                return fromCode(locale.routeAlreadyContainsChannel);
            }
        }

        await this.route.save();
        return fromCode(locale.routeUpdated);
    }
}
