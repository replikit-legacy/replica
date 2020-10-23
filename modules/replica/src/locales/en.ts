import { locales } from "@replikit/i18n";
import { ReplicaLocale } from "@replica/replica";
import { descriptions } from "@replikit/help";

locales.add("en", ReplicaLocale, {
    routeAlreadyExists: "Route already exists",
    routeCreated: "Route created",
    routes: "Routes",
    noRoutesFound: "No routes found",
    routeDeleted: "Route deleted",
    routeNotFound: "Route not found",
    hasDuplicates: "List of channels has duplicates",
    messageFrom: "Message from",
    forwardedFrom: () => `Forwarded from`,
    totalMessages: "Total messages",
    routeDoesNotContainChannel: "The route does not contain the specified channel",
    routeAlreadyContainsChannel: "The route already contain the specified channel",
    routeUpdated: "Route updated",
    invalidMode: "Invalid mode",
    modeUpdated: "Mode updated"
});

descriptions.add("en", {
    routes: {
        delete: "Deletes the route",
        exclude: "Exclude the channel from the route",
        include: "Include a channel to the route",
        info: "Displays the route info",
        list: "Displays a list of routes",
        mode: "Sets the channel mode in the route",
        sync: "Creates a route between channels"
    }
});
