import { HasPermissions } from "@replikit/permissions";
import { CacheResult, User, UserNotFoundError, EmbeddedEntity } from "@replikit/storage";
import { ReplicaEntityType } from "@replica/replica";

export class RouteManager extends EmbeddedEntity {
    userId: number;

    @CacheResult
    async getUser(): Promise<User> {
        const repository = this.repository.connection.getRepository(User);
        const user = await repository.findOne({ _id: this.userId });
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteManager extends HasPermissions<typeof ReplicaEntityType.Route> {}
