'use client';

// urql./node_modules/graphql-sse/
import React, {useMemo} from "react";
import {authExchange} from "@urql/exchange-auth";
import {
cacheExchange,
createClient as createClient2,
fetchExchange,
ssrExchange,
subscriptionExchange,
UrqlProvider
} from "@urql/next";

// /home/enalm/code/public/next-gql/node_modules/graphql-sse/lib/utils.mjs
function isObject(val) {
  return typeof val === "object" && val !== null;
}

// /home/enalm/code/public/next-gql/node_modules/graphql-sse/lib/common.mjs
function validateStreamEvent(e) {
  e = e;
  if (e !== "next" && e !== "complete")
    throw new Error(`Invalid stream event "${e}"`);
  return e;
}
function parseStreamData(e, data) {
  if (data) {
    try {
      data = JSON.parse(data);
    } catch {
      throw new Error("Invalid stream data");
    }
  }
  if (e === "next" && !data)
    throw new Error('Stream data must be an object for "next" events');
  return data || null;
}
var TOKEN_HEADER_KEY = "x-graphql-event-stream-token";
// /home/enalm/code/public/next-gql/node_modules/graphql-sse/lib/handler.mjs
import {getOperationAST, parse, validate as graphqlValidate, execute as graphqlExecute, subscribe as graphqlSubscribe} from "graphql";
// /home/enalm/code/public/next-gql/node_modules/graphql-sse/lib/parser.mjs
function createParser() {
  let buffer;
  let position;
  let fieldLength;
  let discardTrailingNewline = false;
  let message = { event: "", data: "" };
  let pending = [];
  const decoder = new TextDecoder;
  return function parse(chunk) {
    if (buffer === undefined) {
      buffer = chunk;
      position = 0;
      fieldLength = -1;
    } else {
      const concat = new Uint8Array(buffer.length + chunk.length);
      concat.set(buffer);
      concat.set(chunk, buffer.length);
      buffer = concat;
    }
    const bufLength = buffer.length;
    let lineStart = 0;
    while (position < bufLength) {
      if (discardTrailingNewline) {
        if (buffer[position] === ControlChars.NewLine) {
          lineStart = ++position;
        }
        discardTrailingNewline = false;
      }
      let lineEnd = -1;
      for (;position < bufLength && lineEnd === -1; ++position) {
        switch (buffer[position]) {
          case ControlChars.Colon:
            if (fieldLength === -1) {
              fieldLength = position - lineStart;
            }
            break;
          case ControlChars.CchunkiageReturn:
            discardTrailingNewline = true;
          case ControlChars.NewLine:
            lineEnd = position;
            break;
        }
      }
      if (lineEnd === -1) {
        break;
      } else if (lineStart === lineEnd) {
        if (message.event || message.data) {
          if (!message.event)
            throw new Error("Missing message event");
          const event = validateStreamEvent(message.event);
          const data = parseStreamData(event, message.data);
          pending.push({
            event,
            data
          });
          message = { event: "", data: "" };
        }
      } else if (fieldLength > 0) {
        const line = buffer.subarray(lineStart, lineEnd);
        const field = decoder.decode(line.subarray(0, fieldLength));
        const valueOffset = fieldLength + (line[fieldLength + 1] === ControlChars.Space ? 2 : 1);
        const value = decoder.decode(line.subarray(valueOffset));
        switch (field) {
          case "event":
            message.event = value;
            break;
          case "data":
            message.data = message.data ? message.data + "\n" + value : value;
            break;
        }
      }
      lineStart = position;
      fieldLength = -1;
    }
    if (lineStart === bufLength) {
      buffer = undefined;
      const messages = [...pending];
      pending = [];
      return messages;
    } else if (lineStart !== 0) {
      buffer = buffer.subarray(lineStart);
      position -= lineStart;
    }
  };
}
var ControlChars;
(function(ControlChars2) {
  ControlChars2[ControlChars2["NewLine"] = 10] = "NewLine";
  ControlChars2[ControlChars2["CchunkiageReturn"] = 13] = "CchunkiageReturn";
  ControlChars2[ControlChars2["Space"] = 32] = "Space";
  ControlChars2[ControlChars2["Colon"] = 58] = "Colon";
})(ControlChars || (ControlChars = {}));

// /home/enalm/code/public/next-gql/node_modules/graphql-sse/lib/client.mjs
function createClient(options) {
  const {
    singleConnection = false,
    lazy = true,
    lazyCloseTimeout = 0,
    onNonLazyError = console.error,
    generateID = function generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    },
    retryAttempts = 5,
    retry = async function randomisedExponentialBackoff(retries2) {
      let retryDelay = 1000;
      for (let i = 0;i < retries2; i++) {
        retryDelay *= 2;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay + Math.floor(Math.random() * (3000 - 300) + 300)));
    },
    credentials = "same-origin",
    referrer,
    referrerPolicy,
    onMessage,
    on: clientOn
  } = options;
  const fetchFn = options.fetchFn || fetch;
  const AbortControllerImpl = options.abortControllerImpl || AbortController;
  const client = (() => {
    let disposed = false;
    const listeners = [];
    return {
      get disposed() {
        return disposed;
      },
      onDispose(cb) {
        if (disposed) {
          setTimeout(() => cb(), 0);
          return () => {
          };
        }
        listeners.push(cb);
        return () => {
          listeners.splice(listeners.indexOf(cb), 1);
        };
      },
      dispose() {
        if (disposed)
          return;
        disposed = true;
        for (const listener of [...listeners]) {
          listener();
        }
      }
    };
  })();
  let connCtrl, conn, locks = 0, retryingErr = null, retries = 0;
  async function getOrConnect() {
    try {
      if (client.disposed)
        throw new Error("Client has been disposed");
      return await (conn !== null && conn !== undefined ? conn : conn = (async () => {
        var _a, _b, _c;
        if (retryingErr) {
          await retry(retries);
          if (connCtrl.signal.aborted)
            throw new Error("Connection aborted by the client");
          retries++;
        }
        (_a = clientOn === null || clientOn === undefined ? undefined : clientOn.connecting) === null || _a === undefined || _a.call(clientOn, !!retryingErr);
        connCtrl = new AbortControllerImpl;
        const unlistenDispose = client.onDispose(() => connCtrl.abort());
        connCtrl.signal.addEventListener("abort", () => {
          unlistenDispose();
          conn = undefined;
        });
        const url = typeof options.url === "function" ? await options.url() : options.url;
        if (connCtrl.signal.aborted)
          throw new Error("Connection aborted by the client");
        const headers = typeof options.headers === "function" ? await options.headers() : (_b = options.headers) !== null && _b !== undefined ? _b : {};
        if (connCtrl.signal.aborted)
          throw new Error("Connection aborted by the client");
        let res;
        try {
          res = await fetchFn(url, {
            signal: connCtrl.signal,
            method: "PUT",
            credentials,
            referrer,
            referrerPolicy,
            headers
          });
        } catch (err) {
          throw new NetworkError(err);
        }
        if (res.status !== 201)
          throw new NetworkError(res);
        const token = await res.text();
        headers[TOKEN_HEADER_KEY] = token;
        const connected = await connect({
          signal: connCtrl.signal,
          headers,
          credentials,
          referrer,
          referrerPolicy,
          url,
          fetchFn,
          onMessage: (msg) => {
            var _a2;
            (_a2 = clientOn === null || clientOn === undefined ? undefined : clientOn.message) === null || _a2 === undefined || _a2.call(clientOn, msg);
            onMessage === null || onMessage === undefined || onMessage(msg);
          }
        });
        (_c = clientOn === null || clientOn === undefined ? undefined : clientOn.connected) === null || _c === undefined || _c.call(clientOn, !!retryingErr);
        connected.waitForThrow().catch(() => conn = undefined);
        return connected;
      })());
    } catch (err) {
      conn = undefined;
      throw err;
    }
  }
  if (singleConnection && !lazy) {
    (async () => {
      locks++;
      for (;; ) {
        try {
          const { waitForThrow } = await getOrConnect();
          await waitForThrow();
        } catch (err) {
          if (client.disposed)
            return;
          if (!(err instanceof NetworkError))
            return onNonLazyError === null || onNonLazyError === undefined ? undefined : onNonLazyError(err);
          conn = undefined;
          if (!retryAttempts || retries >= retryAttempts)
            return onNonLazyError === null || onNonLazyError === undefined ? undefined : onNonLazyError(err);
          retryingErr = err;
        }
      }
    })();
  }
  function subscribe(request, sink, on) {
    if (!singleConnection) {
      const control2 = new AbortControllerImpl;
      const unlisten2 = client.onDispose(() => {
        unlisten2();
        control2.abort();
      });
      (async () => {
        var _a, _b, _c, _d, _e;
        let retryingErr2 = null, retries2 = 0;
        for (;; ) {
          try {
            if (retryingErr2) {
              await retry(retries2);
              if (control2.signal.aborted)
                throw new Error("Connection aborted by the client");
              retries2++;
            }
            (_a = clientOn === null || clientOn === undefined ? undefined : clientOn.connecting) === null || _a === undefined || _a.call(clientOn, !!retryingErr2);
            (_b = on === null || on === undefined ? undefined : on.connecting) === null || _b === undefined || _b.call(on, !!retryingErr2);
            const url = typeof options.url === "function" ? await options.url() : options.url;
            if (control2.signal.aborted)
              throw new Error("Connection aborted by the client");
            const headers = typeof options.headers === "function" ? await options.headers() : (_c = options.headers) !== null && _c !== undefined ? _c : {};
            if (control2.signal.aborted)
              throw new Error("Connection aborted by the client");
            const { getResults } = await connect({
              signal: control2.signal,
              headers: {
                ...headers,
                "content-type": "application/json; charset=utf-8"
              },
              credentials,
              referrer,
              referrerPolicy,
              url,
              body: JSON.stringify(request),
              fetchFn,
              onMessage: (msg) => {
                var _a2, _b2;
                (_a2 = clientOn === null || clientOn === undefined ? undefined : clientOn.message) === null || _a2 === undefined || _a2.call(clientOn, msg);
                (_b2 = on === null || on === undefined ? undefined : on.message) === null || _b2 === undefined || _b2.call(on, msg);
                onMessage === null || onMessage === undefined || onMessage(msg);
              }
            });
            (_d = clientOn === null || clientOn === undefined ? undefined : clientOn.connected) === null || _d === undefined || _d.call(clientOn, !!retryingErr2);
            (_e = on === null || on === undefined ? undefined : on.connected) === null || _e === undefined || _e.call(on, !!retryingErr2);
            for await (const result of getResults()) {
              retryingErr2 = null;
              retries2 = 0;
              sink.next(result);
            }
            return control2.abort();
          } catch (err) {
            if (control2.signal.aborted)
              return;
            if (!(err instanceof NetworkError))
              throw err;
            if (!retryAttempts || retries2 >= retryAttempts)
              throw err;
            retryingErr2 = err;
          }
        }
      })().then(() => sink.complete()).catch((err) => sink.error(err));
      return () => control2.abort();
    }
    locks++;
    const control = new AbortControllerImpl;
    const unlisten = client.onDispose(() => {
      unlisten();
      control.abort();
    });
    (async () => {
      const operationId = generateID();
      request = {
        ...request,
        extensions: { ...request.extensions, operationId }
      };
      let complete = null;
      for (;; ) {
        complete = null;
        try {
          const { url, headers, getResults } = await getOrConnect();
          let res;
          try {
            res = await fetchFn(url, {
              signal: control.signal,
              method: "POST",
              credentials,
              referrer,
              referrerPolicy,
              headers: {
                ...headers,
                "content-type": "application/json; charset=utf-8"
              },
              body: JSON.stringify(request)
            });
          } catch (err) {
            throw new NetworkError(err);
          }
          if (res.status !== 202)
            throw new NetworkError(res);
          complete = async () => {
            let res2;
            try {
              const control2 = new AbortControllerImpl;
              const unlisten2 = client.onDispose(() => {
                unlisten2();
                control2.abort();
              });
              res2 = await fetchFn(url + "?operationId=" + operationId, {
                signal: control2.signal,
                method: "DELETE",
                credentials,
                referrer,
                referrerPolicy,
                headers
              });
            } catch (err) {
              throw new NetworkError(err);
            }
            if (res2.status !== 200)
              throw new NetworkError(res2);
          };
          for await (const result of getResults({
            signal: control.signal,
            operationId
          })) {
            retryingErr = null;
            retries = 0;
            sink.next(result);
          }
          complete = null;
          return control.abort();
        } catch (err) {
          if (control.signal.aborted)
            return await (complete === null || complete === undefined ? undefined : complete());
          if (!(err instanceof NetworkError)) {
            control.abort();
            throw err;
          }
          if (lazy) {
            conn = undefined;
          }
          if (!retryAttempts || retries >= retryAttempts) {
            control.abort();
            throw err;
          }
          retryingErr = err;
        } finally {
          if (control.signal.aborted && --locks === 0) {
            if (isFinite(lazyCloseTimeout) && lazyCloseTimeout > 0) {
              setTimeout(() => {
                if (!locks)
                  connCtrl.abort();
              }, lazyCloseTimeout);
            } else {
              connCtrl.abort();
            }
          }
        }
      }
    })().then(() => sink.complete()).catch((err) => sink.error(err));
    return () => control.abort();
  }
  return {
    subscribe,
    iterate(request, on) {
      const pending = [];
      const deferred = {
        done: false,
        error: null,
        resolve: () => {
        }
      };
      const dispose = subscribe(request, {
        next(val) {
          pending.push(val);
          deferred.resolve();
        },
        error(err) {
          deferred.done = true;
          deferred.error = err;
          deferred.resolve();
        },
        complete() {
          deferred.done = true;
          deferred.resolve();
        }
      }, on);
      const iterator = async function* iterator() {
        for (;; ) {
          if (!pending.length) {
            await new Promise((resolve) => deferred.resolve = resolve);
          }
          while (pending.length) {
            yield pending.shift();
          }
          if (deferred.error) {
            throw deferred.error;
          }
          if (deferred.done) {
            return;
          }
        }
      }();
      iterator.throw = async (err) => {
        if (!deferred.done) {
          deferred.done = true;
          deferred.error = err;
          deferred.resolve();
        }
        return { done: true, value: undefined };
      };
      iterator.return = async () => {
        dispose();
        return { done: true, value: undefined };
      };
      return iterator;
    },
    dispose() {
      client.dispose();
    }
  };
}
var isResponseLike = function(val) {
  return isObject(val) && typeof val["ok"] === "boolean" && typeof val["status"] === "number" && typeof val["statusText"] === "string";
};
async function connect(options) {
  const { signal, url, credentials, headers, body, referrer, referrerPolicy, fetchFn, onMessage } = options;
  const waiting = {};
  const queue = {};
  let res;
  try {
    res = await fetchFn(url, {
      signal,
      method: body ? "POST" : "GET",
      credentials,
      referrer,
      referrerPolicy,
      headers: {
        ...headers,
        accept: "text/event-stream"
      },
      body
    });
  } catch (err) {
    throw new NetworkError(err);
  }
  if (!res.ok)
    throw new NetworkError(res);
  if (!res.body)
    throw new Error("Missing response body");
  let error = null;
  let waitingForThrow;
  (async () => {
    var _a;
    try {
      const parse2 = createParser();
      for await (const chunk of toAsyncIterator(res.body)) {
        if (typeof chunk === "string")
          throw error = new Error(`Unexpected string chunk "${chunk}"`);
        let msgs;
        try {
          msgs = parse2(chunk);
        } catch (err) {
          throw error = err;
        }
        if (!msgs)
          continue;
        for (const msg of msgs) {
          try {
            onMessage === null || onMessage === undefined || onMessage(msg);
          } catch (err) {
            throw error = err;
          }
          const operationId = msg.data && "id" in msg.data ? msg.data.id : "";
          if (!(operationId in queue))
            queue[operationId] = [];
          switch (msg.event) {
            case "next":
              if (operationId)
                queue[operationId].push(msg.data.payload);
              else
                queue[operationId].push(msg.data);
              break;
            case "complete":
              queue[operationId].push("complete");
              break;
            default:
              throw error = new Error(`Unexpected message event "${msg.event}"`);
          }
          (_a = waiting[operationId]) === null || _a === undefined || _a.proceed();
        }
      }
      if (Object.keys(waiting).length) {
        throw new Error("Connection closed while having active streams");
      }
    } catch (err) {
      if (!error && Object.keys(waiting).length) {
        error = new NetworkError(err);
      } else {
        error = err;
      }
      waitingForThrow === null || waitingForThrow === undefined || waitingForThrow(error);
    } finally {
      Object.values(waiting).forEach(({ proceed }) => proceed());
    }
  })();
  return {
    url,
    headers,
    waitForThrow: () => new Promise((_, reject) => {
      if (error)
        return reject(error);
      waitingForThrow = reject;
    }),
    async* getResults(options2) {
      var _a;
      const { signal: signal2, operationId = "" } = options2 !== null && options2 !== undefined ? options2 : {};
      try {
        for (;; ) {
          while ((_a = queue[operationId]) === null || _a === undefined ? undefined : _a.length) {
            const result = queue[operationId].shift();
            if (result === "complete")
              return;
            yield result;
          }
          if (error)
            throw error;
          if (signal2 === null || signal2 === undefined ? undefined : signal2.aborted)
            throw new Error("Getting results aborted by the client");
          await new Promise((resolve) => {
            const proceed = () => {
              signal2 === null || signal2 === undefined || signal2.removeEventListener("abort", proceed);
              delete waiting[operationId];
              resolve();
            };
            signal2 === null || signal2 === undefined || signal2.addEventListener("abort", proceed);
            waiting[operationId] = { proceed };
          });
        }
      } finally {
        delete queue[operationId];
      }
    }
  };
}
var toAsyncIterator = function(val) {
  if (typeof Object(val)[Symbol.asyncIterator] === "function") {
    val = val;
    return val[Symbol.asyncIterator]();
  }
  return async function* () {
    const reader = val.getReader();
    let result;
    do {
      result = await reader.read();
      if (result.value !== undefined)
        yield result.value;
    } while (!result.done);
  }();
};

class NetworkError extends Error {
  constructor(msgOrErrOrResponse) {
    let message, response;
    if (isResponseLike(msgOrErrOrResponse)) {
      response = msgOrErrOrResponse;
      message = "Server responded with " + msgOrErrOrResponse.status + ": " + msgOrErrOrResponse.statusText;
    } else if (msgOrErrOrResponse instanceof Error)
      message = msgOrErrOrResponse.message;
    else
      message = String(msgOrErrOrResponse);
    super(message);
    this.name = this.constructor.name;
    this.response = response;
  }
}
// urql./node_modules/graphql-sse/
function UrqlWrapper(props) {
  const {
    url,
    isLoggedIn,
    cookie,
    cacheExchange: cacheExchangeManual,
    nonce,
    children,
    ...clientOptions
  } = props;
  const [client2, ssr] = useMemo(() => {
    const auth = createAuth(cookie);
    const ssr2 = ssrExchange();
    const sseClient = createClient({
      url,
      headers: {
        "x-graphql-csrf": "true"
      }
    });
    const client3 = createClient2({
      url,
      exchanges: [
        cacheExchangeManual || cacheExchange,
        auth,
        ssr2,
        fetchExchange,
        subscriptionExchange({
          forwardSubscription(operation) {
            return {
              subscribe: (sink) => {
                const dispose = sseClient.subscribe(operation, sink);
                return {
                  unsubscribe: dispose
                };
              }
            };
          }
        })
      ],
      suspense: true,
      requestPolicy: "cache-first",
      fetchOptions: {
        headers: {
          "x-graphql-csrf": "true"
        }
      },
      ...clientOptions
    });
    return [client3, ssr2];
  }, [isLoggedIn]);
  return React.createElement(UrqlProvider, {
    client: client2,
    ssr,
    nonce
  }, children);
}

var createAuth = (cookie) => {
  return authExchange(async (utilities) => {
    return {
      addAuthToOperation(operation) {
        const isSSR = typeof window === "undefined";
        if (!isSSR || !cookie)
          return operation;
        return utilities.appendHeaders(operation, {
          cookie
        });
      },
      didAuthError(error) {
        return error.graphQLErrors.some((e) => e.extensions?.code === "UNAUTHORIZED");
      },
      refreshAuth: async () => {
      }
    };
  });
};
export {
  UrqlWrapper
};
