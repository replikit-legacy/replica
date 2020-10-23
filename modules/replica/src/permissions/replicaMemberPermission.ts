import { Permission, EntityType, Enum } from "@replikit/permissions";

@Enum("replica")
export class ReplicaMemberPermission extends Permission(EntityType.Member) {
    static readonly ManageRoutes = new ReplicaMemberPermission();
}
