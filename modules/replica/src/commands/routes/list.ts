import { Command } from "@replikit/commands";
import { Route, ReplicaLocale, renderRouteWithChannels } from "@replica/replica";
import { addPageFilter, page, renderEntityList } from "@services/management";
import { fromCode } from "@replikit/messages";
import { CommandResult } from "@replikit/commands/typings";

export class ListCommand extends Command {
    name = "list";

    page = page();

    async execute(): Promise<CommandResult> {
        const user = await this.getUser();

        const filter = { managers: { $elemMatch: { userId: user._id } } };

        const repository = this.connection.getRepository(Route);
        const routes = await repository.query(q => {
            addPageFilter(q, this.page);
            return q.filter(filter);
        });

        const totalRoutes = await repository.collection.estimatedDocumentCount(filter);

        const locale = this.getLocale(ReplicaLocale);
        const message = renderEntityList(
            routes.map(x => {
                const roles = x.managers.find(x => x.userId === user._id)!.roles;
                return renderRouteWithChannels(x, roles);
            }),
            this.page,
            totalRoutes,
            locale.routes,
            locale.noRoutesFound
        );
        return fromCode(message);
    }
}
