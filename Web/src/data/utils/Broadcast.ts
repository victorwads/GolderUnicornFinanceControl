type Message<T, P> = {
  type: T;
  payload: P;
  tabId: string;
};
type Channel<T, P = void> = {
  publish: (type: T, payload?: P, now?: boolean) => void;
  subscribe: (callback: (type: T, payload: P) => void, ignoreSameOrigin?: boolean) => () => void;
};

const TAB_ID = Math.random().toString(16).slice(2);

export default function getBroadcastChannel<Types, Payload = void>(
  channelName: string
): Channel<Types, Payload> {
  const channel = new BroadcastChannel(channelName);
  let timeOut: NodeJS.Timeout | null = null;

  return {
    publish: async (type: Types, payload?: Payload, now: boolean = false) => {
      if (timeOut) clearTimeout(timeOut);
      if (now) {
        return channel.postMessage({ type, payload, tabId: TAB_ID })
      }
      timeOut = setTimeout(() => {
        channel.postMessage({ type, payload, tabId: TAB_ID })
      }, 200)
    },

    subscribe: (
      callback: (type: Types, payload: Payload) => void,
      ignoreSameOrigin: boolean = true
    ) => {
      const onMsg = async (e: MessageEvent<Message<Types, Payload>>) => {
        if (ignoreSameOrigin && e.data.tabId === TAB_ID) return;
        callback(e.data.type, e.data.payload);
      };
      channel.addEventListener("message", onMsg);
      return () => channel.removeEventListener("message", onMsg);
    },
  };
}
