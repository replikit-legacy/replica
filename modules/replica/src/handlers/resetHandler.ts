import { router } from "@replikit/router";
import { messageDispatcher } from "@replica/replica";

router.of("message:received").use((context, next) => {
    messageDispatcher.reset(context.controller, context.channel.id);
    return next();
});
