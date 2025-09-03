import {
  ApolloLink,
  Observable
} from "./chunk-EYUATQ4O.js";
import {
  __rest
} from "./chunk-DN2RLX4J.js";

// node_modules/.pnpm/@apollo+client@3.14.0_graphql-ws@6.0.6_graphql@16.11.0_ws@8.18.3__graphql@16.11.0/node_modules/@apollo/client/link/context/index.js
function setContext(setter) {
  return new ApolloLink(function(operation, forward) {
    var request = __rest(operation, []);
    return new Observable(function(observer) {
      var handle;
      var closed = false;
      Promise.resolve(request).then(function(req) {
        return setter(req, operation.getContext());
      }).then(operation.setContext).then(function() {
        if (closed) return;
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer)
        });
      }).catch(observer.error.bind(observer));
      return function() {
        closed = true;
        if (handle) handle.unsubscribe();
      };
    });
  });
}
export {
  setContext
};
//# sourceMappingURL=@apollo_client_link_context.js.map
