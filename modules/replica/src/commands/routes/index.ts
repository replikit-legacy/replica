import { CommandContainer } from "@replikit/commands";
import { DeleteCommand } from "./delete";
import { ExcludeCommand } from "./exclude";
import { IncludeCommand } from "./include";
import { InfoCommand } from "./info";
import { ListCommand } from "./list";
import { ModeCommand } from "./mode";
import { SyncCommand } from "./sync";

export class RoutesCommand extends CommandContainer {
    name = "routes";
    aliases = ["r"];
    default = "list";

    commands = [
        DeleteCommand,
        ExcludeCommand,
        IncludeCommand,
        ListCommand,
        SyncCommand,
        ModeCommand,
        InfoCommand
    ];
}
