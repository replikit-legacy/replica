import { ChannelModeParameter, ReplicaLocale, Route } from "@replica/replica";
import { Command, required } from "@replikit/commands";
import { CommandResult } from "@replikit/commands/typings";
import { fromCode } from "@replikit/messages";
import { channel } from "@replikit/storage";

export class ModeCommand extends Command {
    name = "mode";

    route = required(Route);
    channelParam = channel({ name: "channel", required: true });
    mode = required(ChannelModeParameter);

    async execute(): Promise<CommandResult> {
        const { route, channelParam, mode } = this;

        const locale = this.getLocale(ReplicaLocale);

        const channel = route.getChannel(channelParam);
        if (!channel) {
            return locale.routeDoesNotContainChannel;
        }

        channel.mode = mode.mode;
        await route.save();

        return fromCode(locale.modeUpdated);
    }
}
