import { ChannelInfo } from "@replikit/core/typings";

export class ReplicaLocale {
    static readonly namespace = "replica";

    routes: string;
    noRoutesFound: string;
    routeCreated: string;
    routeAlreadyExists: string;
    routeDeleted: string;
    routeNotFound: string;
    hasDuplicates: string;
    messageFrom: string;
    totalMessages: string;
    routeAlreadyContainsChannel: string;
    routeDoesNotContainChannel: string;
    routeUpdated: string;
    invalidMode: string;
    modeUpdated: string;

    forwardedFrom: (channel: ChannelInfo) => string;
}
