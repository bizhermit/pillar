// generate by script
// do not edit

type AppRoutePath = "/"
  | "/sandbox"
  | "/sandbox/element"
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
  | "/sandbox/page-transition/ssr/path-params-req/[...id]";

type AppApiPath = "/api";

type TypeofAppApi = {
  "/api": typeof import("app/api/route.ts");
};

type PagesRoutePath = "";

type PagesApiPath = "";

type TypeofPagesApi = {

};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
