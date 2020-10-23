import { Permission, Enum } from "@replikit/permissions";
import { ReplicaEntityType } from "@replica/replica";

@Enum("replica")
export class ReplicaRoutePermission extends Permission(ReplicaEntityType.Route) {
    static readonly ManageRoute = new ReplicaRoutePermission();
}
