// generate by script
// do not edit

type AppRoutePath = "/"
  | "/home"
  | "/sandbox"
  | "/sandbox/datetime"
  | "/sandbox/element"
  | "/sandbox/fetch"
  | "/sandbox/intercepting-routes"
  | "/sandbox/intercepting-routes/task/[[...id]]"
  | "/sandbox/intercepting-routes/tasks"
  | "/sandbox/listview"
  | "/sandbox/mailaddress"
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
  | "/sign-in";

type AppApiPath = "/home/api"
  | "/api"
  | "/api/auth/[...nextauth]"
  | "/sandbox/datetime/api"
  | "/sandbox/fetch/api";

type TypeofAppApi = {
  "/home/api": typeof import("src/app/(nav)/home/api/route.ts");
  "/api": typeof import("src/app/api/route.ts");
  "/api/auth/[...nextauth]": typeof import("src/app/api/auth/[...nextauth]/route.ts");
  "/sandbox/datetime/api": typeof import("src/app/sandbox/datetime/api/route.ts");
  "/sandbox/fetch/api": typeof import("src/app/sandbox/fetch/api/route.mock.ts");
};

type PagesRoutePath = "";

type PagesApiPath = "";

type TypeofPagesApi = {

};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
