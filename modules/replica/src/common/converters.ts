import { ConverterBuilderFactory } from "@replikit/commands/typings";
import {
    Route,
    ReplicaLocale,
    ChannelModeParameter,
    getEnumNames,
    RouteChannelMode
} from "@replica/replica";
import { CommandsLocale } from "@replikit/commands";
import { PermissionsLocale } from "@replikit/permissions";
import { HasFields } from "@replikit/core/typings";

export function registerReplicaConverters(converter: ConverterBuilderFactory): void {
    converter(Route)
        .validator((context, param) => {
            const id = +param;
            const locale = context.getLocale(CommandsLocale);
            if (isNaN(id)) {
                return locale.numberRequired;
            }
            return id > 0 ? id : locale.positiveNumberRequired;
        })
        .resolver(async (context, id) => {
            const repo = context.connection.getRepository(Route);
            const route = await repo.findOne({ _id: id });
            return route ?? context.getLocale(ReplicaLocale).routeNotFound;
        })
        .register();

    converter(ChannelModeParameter)
        .validator((context, param) => {
            const names = getEnumNames(RouteChannelMode);
            if (names.includes(param)) {
                const mode = (RouteChannelMode as HasFields)[param];
                return new ChannelModeParameter(mode as number);
            }
            const invalidMode = context.getLocale(ReplicaLocale).invalidMode;
            const validValues = context.getLocale(PermissionsLocale).validValues(names);
            return `${invalidMode}. ${validValues}`;
        })
        .register();
}
