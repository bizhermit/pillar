// generate by script
// do not edit

type AppRoutePath = "/"
  | "/sandbox"
  | "/sandbox/element"
  | "/sandbox/intercepting-routes"
  | "/sandbox/intercepting-routes/task/[[...id]]"
  | "/sandbox/intercepting-routes/tasks"
  | "/sandbox/page-transition/csr"
  | "/sandbox/page-transition/csr/path-param"
  | "/sandbox/page-transition/csr/path-param/[id]"
  | "/sandbox/page-transition/csr/path-params/[[...id]]"
  | "/sandbox/page-transition/csr/path-params-req"
  | "/sandbox/page-transition/csr/path-params-req/[...id]"
  | "/sandbox/page-transition/ssr"
  | "/sandbox/page-transition/ssr/path-param"
  | "/sandbox/page-transition/ssr/path-param/[id]"
  | "/sandbox/page-transition/ssr/path-params/[[...id]]"
  | "/sandbox/page-transition/ssr/path-params-req"
  | "/sandbox/page-transition/ssr/path-params-req/[...id]"
  | "/sandbox/paralell-route-modal"
  | "/sandbox/paralell-route-modal/[id]"
  | "/sandbox/paralell-routes"
  | "/sandbox/paralell-routes/hoge"
  | "/sign-in"
  | "/user";

type AppApiPath = "/api"
  | "/api/auth/[...nextauth]";

type TypeofAppApi = {
  "/api": typeof import("app/api/route.ts");
  "/api/auth/[...nextauth]": typeof import("app/api/auth/[...nextauth]/route.ts");
};

type PagesRoutePath = "";

type PagesApiPath = "";

type TypeofPagesApi = {

};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
