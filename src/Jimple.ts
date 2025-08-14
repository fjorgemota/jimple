type ServiceFactory<T, TContainer> = (container: TContainer) => T;
type ServiceExtender<T, TContainer> = (original: T, container: TContainer) => T;

export interface ServiceProvider<TMap extends ServiceMap = ServiceMap> {
  register(container: JimpleWithProxy<TMap>): void;
}

interface ServiceMap {}

type ServiceType<TMap, TKey extends keyof TMap> = TMap[TKey];

type InitialServiceMap<TMap, TContainer> = {
  [TKey in keyof TMap]:
    | TMap[TKey]
    | ServiceFactory<ServiceType<TMap, TKey>, TContainer>;
};

export type JimpleWithProxy<TMap extends ServiceMap> = Jimple<TMap> & {
  readonly [TKey in keyof TMap]: ServiceType<TMap, TKey>;
};

function assert(ok: boolean, message: string): asserts ok {
  if (!ok) {
    throw new Error(message);
  }
}

function isFunction(fn: unknown): fn is Function {
  return (
    Object.prototype.toString.call(fn) === "[object Function]" &&
    (fn as any).constructor.name === "Function"
  );
}

function isAsyncFunction(fn: unknown): fn is Function {
  return (
    Object.prototype.toString.call(fn) === "[object AsyncFunction]" &&
    (fn as any).constructor.name === "AsyncFunction"
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function checkDefined<TMap extends ServiceMap, TKey extends keyof TMap>(
  container: Jimple<TMap>,
  key: TKey,
): void {
  assert(container.has(key), `Identifier "${String(key)}" is not defined.`);
}

function addFunctionTo<T extends Function>(set: Set<T>, fn: T): void {
  assert(
    isFunction(fn),
    "Service definition is not a Closure or invokable object",
  );
  set.add(fn);
}

/**
 * The Jimple Container class with TypeScript support
 */
export default class Jimple<TMap extends ServiceMap = ServiceMap> {
  private readonly _items: Record<string, unknown> = {};
  private readonly _instances = new Map<Function, unknown>();
  private readonly _factories = new Set<Function>();
  private readonly _protected = new Set<Function>();
  private readonly _bind: JimpleWithProxy<TMap>;

  static provider<TMap extends ServiceMap = ServiceMap>(
    register: ServiceProvider<TMap>["register"],
  ): ServiceProvider<TMap> {
    return { register };
  }

  static create<TMap extends ServiceMap = ServiceMap>(
    values?: Partial<InitialServiceMap<TMap, JimpleWithProxy<TMap>>>,
  ): JimpleWithProxy<TMap> {
    return new this<TMap>(values) as JimpleWithProxy<TMap>;
  }

  /**
   * Create a Jimple Container.
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
        assert( !(prop in target) || typeof prop !== "string",
            `Cannot set method '${String(prop)}'. Use the method 'set' to set this value instead.`);
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
        assert( !(prop in target) || typeof prop !== "string",
            `Cannot unset method '${String(prop)}'. Use the method 'unset' to unset this key instead.`);
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
   * Defines a new parameter or service
   */
  set<TKey extends keyof TMap>(
    key: TKey,
    value:
      | ServiceType<TMap, TKey>
      | ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>,
  ): void {
    const originalItem = this._items[key as string];
    assert( (! isFunction(originalItem) && ! isAsyncFunction(originalItem)) || !this._instances.has(originalItem),  `Cannot redefine service '${String(key)}' because it is already instantiated.`);
    this._items[key as string] = value;
  }

  /**
   * Unsets a parameter or service
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
   * Returns if a service or parameter is defined
   */
  has<TKey extends keyof TMap>(key: TKey): boolean {
    return this._items.hasOwnProperty(key as string);
  }

  /**
   * Defines a service as a factory
   */
  factory<
    TKey extends keyof TMap,
    T extends ServiceFactory<ServiceType<TMap, TKey>, JimpleWithProxy<TMap>>,
  >(fn: T): T {
    addFunctionTo(this._factories, fn);
    return fn;
  }

  /**
   * Defines a function as a parameter
   */
  protect<T extends (...args: any[]) => any>(fn: T): T {
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
        ! this._instances.has(originalItem),
        `Cannot extend service '${String(key)}' because it is already instantiated.`,
    )

    this._items[key as string] = (app: JimpleWithProxy<TMap>) => {
      return fn(originalItem(app), this._bind);
    };

    if (this._factories.has(originalItem)) {
      this._factories.delete(originalItem);
      this._factories.add(this._items[key as string] as Function);
    }
  }

  /**
   * Uses a provider to extend the service
   */
  register<K extends keyof TMap>(
    provider: ServiceProvider<Pick<TMap, K>>,
  ): void {
    provider.register(this._bind as unknown as JimpleWithProxy<Pick<TMap, K>>);
  }

  /**
   * Returns the raw value of a service or parameter
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
