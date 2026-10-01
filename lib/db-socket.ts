import dns from "node:dns";
import net from "node:net";

// On some networks the OS resolver (getaddrinfo) intermittently fails for the
// Supabase pooler host (ENOTFOUND / EAI_AGAIN) even though DNS itself answers.
// Database sockets therefore resolve through this lookup instead: OS resolver
// first, then public DNS servers queried directly, then the last address that
// worked. Only the DB connection uses it — nothing global is patched.

type Address = { address: string; family: number };
type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void;

const FALLBACK_SERVERS = ["1.1.1.1", "8.8.8.8"];
const lastGood = new Map<string, Address[]>();

function osLookup(hostname: string): Promise<Address[]> {
  return new Promise((resolve, reject) =>
    dns.lookup(hostname, { all: true }, (err, addresses) => (err ? reject(err) : resolve(addresses))),
  );
}

async function publicDnsLookup(hostname: string): Promise<Address[]> {
  const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 2 });
  resolver.setServers(FALLBACK_SERVERS);
  const ips = await resolver.resolve4(hostname);
  return ips.map((address) => ({ address, family: 4 }));
}

async function resolveHost(hostname: string): Promise<Address[]> {
  if (net.isIP(hostname)) return [{ address: hostname, family: net.isIP(hostname) }];
  try {
    const found = await osLookup(hostname);
    if (found.length) {
      lastGood.set(hostname, found);
      return found;
    }
  } catch {
    // fall through to public DNS
  }
  try {
    const found = await publicDnsLookup(hostname);
    if (found.length) {
      lastGood.set(hostname, found);
      return found;
    }
  } catch {
    // fall through to the cache
  }
  const cached = lastGood.get(hostname);
  if (cached) return cached;
  const err: NodeJS.ErrnoException = new Error(`getaddrinfo ENOTFOUND ${hostname}`);
  err.code = "ENOTFOUND";
  throw err;
}

/** A dns.lookup-compatible function (net.connect's `lookup` option) backed by resolveHost. */
export function resilientLookup(hostname: string, options: dns.LookupOptions | number | LookupCallback, callback?: LookupCallback) {
  const cb = (typeof options === "function" ? options : callback) as LookupCallback;
  const opts = typeof options === "object" ? options : {};
  resolveHost(hostname).then(
    (addresses) => {
      const wanted = opts.family ? addresses.filter((a) => a.family === opts.family) : addresses;
      const list = wanted.length ? wanted : addresses;
      if (opts.all) cb(null, list);
      else cb(null, list[0].address, list[0].family);
    },
    (err: NodeJS.ErrnoException) => cb(err, ""),
  );
}

/** Socket whose connect() resolves the host with resilientLookup (pg calls socket.connect(port, host)). */
class ResilientSocket extends net.Socket {
  connect(...args: unknown[]): this {
    if (typeof args[0] === "number" && typeof args[1] === "string") {
      const [port, host, listener] = args as [number, string, (() => void) | undefined];
      return super.connect({ port, host, lookup: resilientLookup as unknown as net.LookupFunction }, listener);
    }
    return super.connect(...(args as Parameters<net.Socket["connect"]>));
  }
}

/** pg `stream` factory: plain TCP sockets that survive flaky OS name resolution. */
export function createDbSocket(): net.Socket {
  return new ResilientSocket();
}
