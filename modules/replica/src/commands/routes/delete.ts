import { Command, required } from "@replikit/commands";
import { fromCode } from "@replikit/messages";
import { CommandResult } from "@replikit/commands/typings";
import { ReplicaRoutePermission, routeAuthorization, Route, ReplicaLocale } from "@replica/replica";

export class DeleteCommand extends Command {
    name = "delete";

    middleware = [routeAuthorization(ReplicaRoutePermission.ManageRoute)];

    route = required(Route);

    async execute(): Promise<CommandResult> {
        await this.route.delete();

        const locale = this.getLocale(ReplicaLocale);
        return fromCode(locale.routeDeleted);
    }
}
