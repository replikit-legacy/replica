import { Role, Enum } from "@replikit/permissions";
import { ReplicaEntityType, ReplicaRoutePermission } from "@replica/replica";

@Enum("replica")
export class ReplicaRouteRole extends Role(ReplicaEntityType.Route) {
    static readonly Admin = new ReplicaRouteRole({
        permissions: [ReplicaRoutePermission.ManageRoute]
    });

    static readonly Owner = new ReplicaRouteRole({
        fallbackRoles: [ReplicaRouteRole.Admin]
    });
}
