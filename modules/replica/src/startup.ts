import { createScope, hook, applyMixins, updateConfig } from "@replikit/core";
import { connection } from "@replikit/storage";
import {
    Route,
    RouteManager,
    ReplicaMemberPermission,
    registerReplicaConverters,
    ReplicaUserPermission
} from "@replica/replica";
import { HasPermissions } from "@replikit/permissions";
import { ManagementMemberRole, ManagementUserRole } from "@services/management";
import { converter } from "@replikit/commands";

/** @internal */
export const logger = createScope("replica");

hook("storage:database:done", () => {
    connection.registerRepository("routes", Route, { autoIncrement: true });
});

applyMixins(RouteManager, [HasPermissions]);

ManagementMemberRole.Admin.permissions.push(ReplicaMemberPermission.ManageRoutes);

ManagementUserRole.Admin.permissions.push(
    ReplicaUserPermission.SyncAnyChannels,
    ReplicaUserPermission.ListAllRoutes
);

registerReplicaConverters(converter);

updateConfig({ commands: { prefix: "/" } });
