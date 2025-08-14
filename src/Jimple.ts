/**
 * Factory function type that creates a service instance.
 * @template T - The type of service being created
 * @template TContainer - The type of the container being injected
 */
type ServiceFactory<T, TContainer> = (container: TContainer) => T;

/**
 * Extender function type that modifies an existing service.
 * @template T - The type of service being extended
 * @template TContainer - The type of the container being injected
 */
type ServiceExtender<T, TContainer> = (original: T, container: TContainer) => T;

/**
 * Interface for service providers that can register services with a container.
 * @template TMap - The service map type extending ServiceMap
 */
export interface ServiceProvider<TMap extends ServiceMap = ServiceMap> {
  /**
   * Registers services with the provided container.
   * @param container - The container to register services with
   */
  register(container: JimpleWithProxy<TMap>): void;
}

/**
 * Base interface for service mapping. Extend this interface to define your service types.
 * @example
 * ```typescript
 * interface MyServiceMap extends ServiceMap {
 *   userService: UserService;
 *   logger: Logger;
 * }
 * ```
 */
interface ServiceMap {}

/**
 * Utility type to extract the service type from a service map.
 * @template TMap - The service map
 * @template TKey - The key in the service map
 */
type ServiceType<TMap, TKey extends keyof TMap> = TMap[TKey];

/**
 * Type for initial service registration, allowing either concrete instances or factory functions.
 * @template TMap - The service map
 * @template TContainer - The container type
 */
type InitialServiceMap<TMap, TContainer> = {
  [TKey in keyof TMap]:
    | TMap[TKey]
    | ServiceFactory<ServiceType<TMap, TKey>, TContainer>;
};

/**
 * Proxy-enhanced Jimple container with direct property access to services.
 * @template TMap - The service map extending ServiceMap
 */
export type JimpleWithProxy<TMap extends ServiceMap> = Jimple<TMap> & {
  readonly [TKey in keyof TMap]: ServiceType<TMap, TKey>;
};

/**
 * Assertion function that throws an error if the condition is false.
 * @param ok - The condition to assert
 * @param message - Error message to throw if condition is false
 * @throws {Error} When the assertion fails
 */
function assert(ok: boolean, message: string): asserts ok {
  if (!ok) {
    throw new Error(message);
  }
}

/**
 * Type guard to check if a value is a regular function.
 * @param fn - The value to check
 * @returns True if the value is a function
 */
function isFunction(fn: unknown): fn is Function {
  return (
    Object.prototype.toString.call(fn) === "[object Function]" &&
    (fn as any).constructor.name === "Function"
  );
}

/**
 * Type guard to check if a value is an async function.
 * @param fn - The value to check
 * @returns True if the value is an async function
 */
function isAsyncFunction(fn: unknown): fn is Function {
  return (
    Object.prototype.toString.call(fn) === "[object AsyncFunction]" &&
    (fn as any).constructor.name === "AsyncFunction"
  );
}

/**
 * Type guard to check if a value is a plain object (not an array, function, etc.).
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Checks if a service is defined in the container and throws an error if not.
 * @template TMap - The service map
 * @template TKey - The service key type
 * @param container - The container to check
 * @param key - The service key to check
 * @throws {Error} When the service is not defined
 */
function checkDefined<TMap extends ServiceMap, TKey extends keyof TMap>(
  container: Jimple<TMap>,
  key: TKey,
): void {
  assert(container.has(key), `Identifier "${String(key)}" is not defined.`);
}

/**
 * Adds a function to a set after validating it's a proper function.
 * @template T - The function type
 * @param set - The set to add the function to
 * @param fn - The function to add
 * @throws {Error} When the value is not a function
 */
function addFunctionTo<T extends Function>(set: Set<T>, fn: T): void {
  assert(
    isFunction(fn),
    "Service definition is not a Closure or invokable object",
  );
  set.add(fn);
}

/**
 * The Jimple Container class with TypeScript support.
 * A dependency injection container that manages services and parameters.
 *
 * @template TMap - The service map extending ServiceMap
 *
 * @example
 * ```typescript
 * interface MyServices extends ServiceMap {
 *   logger: Logger;
 *   userService: UserService;
 * }
 *
 * const container = Jimple.create<MyServices>();
 * container.set('logger', () => new ConsoleLogger());
 * container.set('userService', (c) => new UserService(c.logger));
 *
 * const userService = container.userService; // Typed as UserService
 * ```
 */
export default class Jimple<TMap extends ServiceMap = ServiceMap> {
  /** Internal storage for service definitions and parameters */
  private readonly _items: Record<string, unknown> = {};

  /** Cache for instantiated services */
  private readonly _instances = new Map<Function, unknown>();

  /** Set of functions marked as factories (always return new instances) */
  private readonly _factories = new Set<Function>();

  /** Set of functions marked as protected (returned as-is, not called) */
  private readonly _protected = new Set<Function>();

  /** Proxy-enhanced version of this container for property access */
  private readonly _bind: JimpleWithProxy<TMap>;

  /**
   * Creates a service provider object.
   * @template TMap - The service map
   * @param register - Function that registers services with a container
   * @returns A service provider object
   *
   * @example
   * ```typescript
   * const myProvider = Jimple.provider<MyServices>((container) => {
   *   container.set('logger', () => new Logger());
   * });
   * ```
   */
  static provider<TMap extends ServiceMap = ServiceMap>(
    register: ServiceProvider<TMap>["register"],
  ): ServiceProvider<TMap> {
    return { register };
  }

  /**
   * Creates a new Jimple container instance with proxy support.
   * @template TMap - The service map
   * @param values - Initial services and parameters to register
   * @returns A proxy-enhanced container
   *
   * @example
   * ```typescript
   * const container = Jimple.create<MyServices>({
   *   logger: () => new ConsoleLogger(),
   *   apiUrl: 'https://api.example.com'
   * });
   * ```
   */
  static create<TMap extends ServiceMap = ServiceMap>(
    values?: Partial<InitialServiceMap<TMap, JimpleWithProxy<TMap>>>,
  ): JimpleWithProxy<TMap> {
    return new this<TMap>(values) as JimpleWithProxy<TMap>;
  }

  /**
   * Create a Jimple Container.
   * @param values - Initial services and parameters to register
   *
   * @example
   * ```typescript
   * const container = new Jimple<MyServices>({
   *   config: { apiUrl: 'https://api.example.com' },
   *   logger: (c) => new Logger(c.config)
   * });
   * ```
   */
  constructor(
    values?: Partial<InitialServiceMap<TMap, JimpleWithProxy<TMap>>>,
  ) {
    if (isPlainObject(values)) {
      Object.keys(values).forEach((key) => {
        const value = values[key as keyof TMap];
        if (typeof value !== "undefined") {
          this.set(key as keyof TMap, value);
        }
      });
    }

    this._bind = new Proxy(this, {
      get(target: Jimple<TMap>, prop: string | symbol): any {
        if (prop in target && typeof prop === "string") {
          const value = (target as any)[prop];
          if (isFunction(value)) {
            return value.bind(target);
          }
        }
        return target.get(prop as keyof TMap);
      },

      set(target: Jimple<TMap>, prop: string | symbol, value: any): boolean {
        assert(
          !(prop in target) || typeof prop !== "string",
          `Cannot set method '${String(prop)}'. Use the method 'set' to set this value instead.`,
        );
        target.set(prop as keyof TMap, value);
        return true;
      },

      has(target: Jimple<TMap>, prop: string | symbol): boolean {
        if (prop in target) {
          return true;
        }

        return target.has(prop as keyof TMap);
      },

      deleteProperty(target: Jimple<TMap>, prop: string | symbol): boolean {
        assert(
          !(prop in target) || typeof prop !== "string",
          `Cannot unset method '${String(prop)}'. Use the method 'unset' to unset this key instead.`,
        );
        target.unset(prop as keyof TMap);
        return true;
      },

      ownKeys(target: Jimple<TMap>): ArrayLike<string | symbol> {
        const classKeys = Object.getOwnPropertyNames(target);
        const serviceKeys = target.keys().map((k) => String(k));
        return [...new Set([...classKeys, ...serviceKeys])];
      },

      getOwnPropertyDescriptor(target: Jimple<TMap>, prop: string | symbol) {
        if (prop in target) {
          return Object.getOwnPropertyDescriptor(target, prop);
        }

        if (typeof prop === "string" && target.has(prop as keyof TMap)) {
          return {
            enumerable: true,
            configurable: true,
            get: () => target.get(prop as keyof TMap),
            set: (value: any) => target.set(prop as keyof TMap, value),
          };
        }

        return undefined;
      },
    }) as JimpleWithProxy<TMap>;
    return this._bind;
  }

  /**
   * Return the specified parameter or service with correct typing.
   * Services defined as functions are instantiated when first accessed (singleton pattern).
   * Services marked as factories are instantiated on every access.
   * Services marked as protected are returned as-is without being called.
   *
   * @template TKey - The service key type
   * @param key - The service key to retrieve
   * @returns The service instance or parameter value
   * @throws {Error} When the service is not defined
   *
   * @example
   * ```typescript
   * const logger = container.get('logger');
   * const apiUrl = container.get('apiUrl');
   * ```
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
        const obj = (
          item as ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>
        )(this._bind);
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
   * Defines a new parameter or service.
   * Functions are treated as service factories unless marked as protected.
   *
   * @template TKey - The service key type
   * @param key - The service key
   * @param value - The service value, instance, or factory function
   * @throws {Error} When trying to redefine an already instantiated service
   *
   * @example
   * ```typescript
   * // Parameter
   * container.set('apiUrl', 'https://api.example.com');
   *
   * // Service factory
   * container.set('logger', (c) => new Logger(c.apiUrl));
   *
   * // Service instance
   * container.set('cache', new MemoryCache());
   * ```
   */
  set<TKey extends keyof TMap>(
    key: TKey,
    value:
      | ServiceType<TMap, TKey>
      | ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>,
  ): void {
    const originalItem = this._items[key as string];
    assert(
      (!isFunction(originalItem) && !isAsyncFunction(originalItem)) ||
        !this._instances.has(originalItem),
      `Cannot redefine service '${String(key)}' because it is already instantiated.`,
    );
    this._items[key as string] = value;
  }

  /**
   * Unsets a parameter or service, removing it from the container.
   * Also clears any cached instances and metadata for the service.
   *
   * @template TKey - The service key type
   * @param key - The service key to remove
   *
   * @example
   * ```typescript
   * container.unset('logger');
   * console.log(container.has('logger')); // false
   * ```
   */
  unset<TKey extends keyof TMap>(key: TKey): void {
    const item = this._items[key as string];
    if (isFunction(item) || isAsyncFunction(item)) {
      this._instances.delete(item);
      this._factories.delete(item);
      this._protected.delete(item);
    }
    delete this._items[key as string];
  }

  /**
   * Returns if a service or parameter is defined in the container.
   *
   * @template TKey - The service key type
   * @param key - The service key to check
   * @returns True if the service is defined
   *
   * @example
   * ```typescript
   * if (container.has('logger')) {
   *   const logger = container.get('logger');
   * }
   * ```
   */
  has<TKey extends keyof TMap>(key: TKey): boolean {
    return this._items.hasOwnProperty(key as string);
  }

  /**
   * Defines a service as a factory that creates new instances on every access.
   * Unlike regular services (which are singletons), factories always call the function.
   *
   * @template TKey - The service key type
   * @template T - The factory function type
   * @param fn - The factory function to mark
   * @returns The same function (for chaining)
   * @throws {Error} When the value is not a function
   *
   * @example
   * ```typescript
   * container.set('requestId', container.factory(() => Math.random().toString()));
   *
   * const id1 = container.get('requestId'); // Different value each time
   * const id2 = container.get('requestId'); // Different value each time
   * ```
   */
  factory<
    TKey extends keyof TMap,
    T extends ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>,
  >(fn: T): T {
    addFunctionTo(this._factories, fn);
    return fn;
  }

  /**
   * Defines a function as a parameter (protected from being called as a service factory).
   * The function will be returned as-is when accessed, not executed.
   *
   * @template T - The function type
   * @param fn - The function to protect
   * @returns The same function (for chaining)
   * @throws {Error} When the value is not a function
   *
   * @example
   * ```typescript
   * const callback = (data: any) => console.log(data);
   * container.set('onComplete', container.protect(callback));
   *
   * const fn = container.get('onComplete'); // Returns the function itself
   * fn('Hello'); // Can be called later
   * ```
   */
  protect<T extends (...args: any[]) => any>(fn: T): T {
    addFunctionTo(this._protected, fn);
    return fn;
  }

  /**
   * Return all the keys registered in the container.
   *
   * @returns Array of all service keys
   *
   * @example
   * ```typescript
   * const keys = container.keys();
   * console.log('Registered services:', keys);
   * ```
   */
  keys(): (keyof TMap)[] {
    return Object.keys(this._items) as (keyof TMap)[];
  }

  /**
   * Extends a service already registered in the container.
   * Allows decorating or modifying an existing service definition.
   *
   * @template TKey - The service key type
   * @template TResult - The extended service type
   * @param key - The service key to extend
   * @param fn - Function that receives the original service and returns the extended version
   * @throws {Error} When the service is not defined, not a function, protected, or already instantiated
   *
   * @example
   * ```typescript
   * container.set('logger', () => new Logger());
   *
   * container.extend('logger', (logger, c) => {
   *   return new LoggerDecorator(logger, c.config);
   * });
   * ```
   */
  extend<TKey extends keyof TMap, TResult extends ServiceType<TMap, TKey>>(
    key: TKey,
    fn: ServiceExtender<TResult, JimpleWithProxy<TMap>>,
  ): void {
    checkDefined(this, key);
    const originalItem = this._items[key as string] as ServiceFactory<
      TResult,
      JimpleWithProxy<TMap>
    >;

    assert(
      isFunction(originalItem) && !this._protected.has(originalItem),
      `Identifier '${String(key)}' does not contain a service definition`,
    );
    assert(
      isFunction(fn),
      `The 'new' service definition for '${String(key)}' is not a invokable object.`,
    );
    assert(
      !this._instances.has(originalItem),
      `Cannot extend service '${String(key)}' because it is already instantiated.`,
    );

    this._items[key as string] = (app: JimpleWithProxy<TMap>) => {
      return fn(originalItem(app), this._bind);
    };

    if (this._factories.has(originalItem)) {
      this._factories.delete(originalItem);
      this._factories.add(this._items[key as string] as Function);
    }
  }

  /**
   * Uses a provider to extend the service container.
   * Providers are objects with a register method that can add multiple services.
   *
   * @template K - The subset of service keys the provider manages
   * @param provider - The service provider to register
   *
   * @example
   * ```typescript
   * const databaseProvider = Jimple.provider<MyServices>((container) => {
   *   container.set('db', () => new Database(container.config));
   *   container.set('userRepo', (c) => new UserRepository(c.db));
   * });
   *
   * container.register(databaseProvider);
   * ```
   */
  register<K extends keyof TMap>(
    provider: ServiceProvider<Pick<TMap, K>>,
  ): void {
    provider.register(this._bind as unknown as JimpleWithProxy<Pick<TMap, K>>);
  }

  /**
   * Returns the raw value of a service or parameter without instantiation.
   * For services defined as functions, returns the function itself rather than calling it.
   *
   * @template TKey - The service key type
   * @param key - The service key
   * @returns The raw service definition or parameter value
   * @throws {Error} When the service is not defined
   *
   * @example
   * ```typescript
   * const factory = container.raw('logger'); // Returns the factory function
   * const logger = factory(container); // Manually instantiate
   * ```
   */
  raw<TKey extends keyof TMap>(
    key: TKey,
  ):
    | ServiceType<TMap, TKey>
    | ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>> {
    checkDefined(this, key);
    return this._items[key as string] as
      | ServiceType<TMap, TKey>
      | ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>;
  }
}
