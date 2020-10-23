import { Entity, Embedded, Channel, User } from "@replikit/storage";
import { RouteChannel } from "@replica/replica/typings";
import { RouteManager, RouteChannelMode } from "@replica/replica";
import { Type } from "class-transformer";

export class Route extends Entity {
    _id: number;
    channels: RouteChannel[];

    @Type(() => RouteManager)
    @Embedded
    managers: RouteManager[];

    getChannel(channel: Channel): RouteChannel | undefined {
        return this.channels.find(x => x.channelId === channel._id);
    }

    getManager(user: User): RouteManager | undefined {
        return this.managers.find(x => x.userId === user._id);
    }

    addChannel(channel: Channel): boolean {
        if (this.getChannel(channel)) {
            return false;
        }
        this.channels.push({ channelId: channel._id as number, mode: RouteChannelMode.Both });
        return true;
    }

    removeChannel(channel: Channel): boolean {
        const index = this.channels.findIndex(x => x.channelId === channel._id);
        if (index === -1) {
            return false;
        }
        this.channels.splice(index, 1);
        return true;
    }
}
