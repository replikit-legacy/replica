export class UnsupportedControllerError extends Error {
    constructor(name: string) {
        super(`Controller ${name} not supported`);
    }
}
