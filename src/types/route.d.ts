// generate by script
// do not edit

type AppRoutePath = "/[uid]"
 | "/"
 | "/sign-in";

type AppApiPath = "/api/auth/[...nextauth]"
 | "/api/fetch"
 | "/api";

type TypeofAppApi = {
  "/api/auth/[...nextauth]": typeof import("app/api/auth/[...nextauth]/route");
  "/api/fetch": typeof import("app/api/fetch/route");
  "/api": typeof import("app/api/route");
};

type PagesRoutePath = "/404"
 | "/pages"
 | "/root"
 | "/sandbox/nest/[id]"
 | "/sandbox/pages"
 | "/sandbox/post/recipient"
 | "/sandbox/route";

type PagesApiPath = "/api/form"
 | "/api/hello";

type TypeofPagesApi = {
  "/api/form": typeof import("pages/api/form");
  "/api/hello": typeof import("pages/api/hello");
};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
