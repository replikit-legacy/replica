import { Permission, EntityType, Enum } from "@replikit/permissions";

@Enum("replica")
export class ReplicaUserPermission extends Permission(EntityType.User) {
    static readonly SyncAnyChannels = new ReplicaUserPermission();
    static readonly ListAllRoutes = new ReplicaUserPermission();
}
