// generate by script
// do not edit

type AppRoutePath = "/"
  | "/sandbox"
  | "/sandbox/element"
  | "/sandbox/page-transition/client"
  | "/sandbox/page-transition/client/path-param/[id]"
  | "/sandbox/page-transition/client/path-params/[[...id]]"
  | "/sandbox/page-transition/client/path-params-req/[...id]"
  | "/sandbox/page-transition/server"
  | "/sandbox/page-transition/server/path-param/[id]"
  | "/sandbox/page-transition/server/path-params/[[...id]]"
  | "/sandbox/page-transition/server/path-params-req/[...id]";

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
