// Tipos utilitários
type ServiceFactory<T, TContainer> = (container: TContainer) => T;
type ServiceExtender<T, TContainer> = (original: T, container: TContainer) => T;

interface Provider<TContainer> {
    register: (container: TContainer) => void;
}

// Interface que define o mapeamento de chaves para tipos
interface ServiceMap {}

// Tipos condicionais para extrair o tipo correto
type ServiceType<TMap, TKey extends keyof TMap> = TMap[TKey];

type InitialServiceMap<TMap, TContainer> = {[TKey in keyof TMap]: TMap[TKey] |  ServiceFactory<ServiceType<TMap, TKey>, TContainer>};

function assert(ok: boolean, message: string): asserts ok {
    if (!ok) {
        throw new Error(message);
    }
}

function isFunction(fn: unknown): fn is Function {
    return Object.prototype.toString.call(fn) === "[object Function]" &&
        (fn as any).constructor.name === "Function";
}

function isAsyncFunction(fn: unknown): fn is Function {
    return Object.prototype.toString.call(fn) === "[object AsyncFunction]" &&
        (fn as any).constructor.name === "AsyncFunction";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
}

function checkDefined<TMap extends ServiceMap, TKey extends keyof TMap>(
    container: Jimple<TMap>,
    key: TKey
): void {
    assert(container.has(key), `Identifier "${String(key)}" is not defined.`);
}

function addFunctionTo<T extends Function>(set: Set<T>, fn: T): void {
    assert(isFunction(fn), "Service definition is not a Closure or invokable object");
    set.add(fn);
}

/**
 * The Jimple Container class with TypeScript support
 */
export default class Jimple<TMap extends ServiceMap = ServiceMap> {
    private _items: Record<string, unknown> = {};
    private _instances = new Map<Function, unknown>();
    private _factories = new Set<Function>();
    private _protected = new Set<Function>();

    static provider<TContainer>(
        register: (container: TContainer) => void
    ): Provider<TContainer> {
        return { register };
    }

    /**
     * Create a Jimple Container.
     */
    constructor(values?: Partial<InitialServiceMap<TMap, Jimple<TMap>>>) {
        if (isPlainObject(values)) {
            Object.keys(values).forEach((key) => {
                const value = values[key as keyof TMap];
                if (!!value)  {
                    this.set(key as keyof TMap, value);
                }
            });
        }
    }

    /**
     * Return the specified parameter or service with correct typing
     */
    get<TKey extends keyof TMap>(key: TKey): ServiceType<TMap, TKey> {
        checkDefined(this, key);
        const item = this._items[key as string];

        if (isFunction(item) || isAsyncFunction(item)) {
            if (this._protected.has(item)) {
                return item as ServiceType<TMap, TKey>;
            } else if (this._instances.has(item)) {
                return this._instances.get(item) as ServiceType<TMap, TKey>;
            } else {
                const obj = (item as ServiceFactory<ServiceType<TMap, TKey>, this>)(this);
                if (!this._factories.has(item)) {
                    this._instances.set(item, obj);
                }
                return obj as ServiceType<TMap, TKey>;
            }
        } else {
            return item as ServiceType<TMap, TKey>;
        }
    }

    /**
     * Defines a new parameter or service
     */
    set<TKey extends keyof TMap>(
        key: TKey,
        value: ServiceType<TMap, TKey> | ServiceFactory<ServiceType<TMap, TKey>, this>
    ): void {
        this._items[key as string] = value;
    }

    /**
     * Returns if a service or parameter is defined
     */
    has<TKey extends keyof TMap>(key: TKey): boolean {
        return this._items.hasOwnProperty(key as string);
    }

    /**
     * Defines a service as a factory
     */
    factory<T extends Function>(fn: T): T {
        addFunctionTo(this._factories, fn);
        return fn;
    }

    /**
     * Defines a function as a parameter
     */
    protect<T extends Function>(fn: T): T {
        addFunctionTo(this._protected, fn);
        return fn;
    }

    /**
     * Return all the keys registered in the container
     */
    keys(): (keyof TMap)[] {
        return Object.keys(this._items) as (keyof TMap)[];
    }

    /**
     * Extends a service already registered in the container
     */
    extend<TKey extends keyof TMap, TResult extends ServiceType<TMap, TKey>>(
        key: TKey,
        fn: ServiceExtender<TResult, this>
    ): void {
        checkDefined(this, key);
        const originalItem = this._items[key as string] as ServiceFactory<TResult, this>;

        assert(
            isFunction(originalItem) && !this._protected.has(originalItem),
            `Identifier '${String(key)}' does not contain a service definition`
        );
        assert(isFunction(fn), `The 'new' service definition for '${String(key)}' is not a invokable object.`);

        this._items[key as string] = (app: this) => {
            return fn(originalItem(app), app);
        };

        if (this._factories.has(originalItem)) {
            this._factories.delete(originalItem);
            this._factories.add(this._items[key as string] as Function);
        }
    }

    /**
     * Uses a provider to extend the service
     */
    register(provider: Provider<this>): void {
        provider.register(this);
    }

    /**
     * Returns the raw value of a service or parameter
     */
    raw<TKey extends keyof TMap>(key: TKey): ServiceType<TMap, TKey> | ServiceFactory<ServiceType<TMap, TKey>, this> {
        checkDefined(this, key);
        return this._items[key as string] as ServiceType<TMap, TKey> | ServiceFactory<ServiceType<TMap, TKey>, this>;
    }
}