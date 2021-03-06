import elliptic from 'elliptic'
// @ts-ignore
import regeneratorRuntime from 'regenerator-runtime'
Object.assign(globalThis, { elliptic, regeneratorRuntime })

/**
 * Workaround of https://github.com/PeculiarVentures/webcrypto-liner/issues/76
 */
{
    const MaybeWorkerGlobalScope: WindowOrWorkerGlobalScope = Object.getPrototypeOf(Object.getPrototypeOf(globalThis))
    const crypto = Object.getOwnPropertyDescriptor(MaybeWorkerGlobalScope, 'crypto')
    // The crypto is defined in [WorkerGlobalScope], let's move it to [DedicatedWorkerGlobalScope]
    if (crypto) {
        // @ts-ignore
        delete MaybeWorkerGlobalScope.crypto
        Object.defineProperty(globalThis, 'crypto', crypto)
    }
}
