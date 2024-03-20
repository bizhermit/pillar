// generate by script
// do not edit

type AppRoutePath = "/"
  | "/[uid]"
  | "/sign-in";

type AppApiPath = "/api"
  | "/api/auth/[...nextauth]";

type TypeofAppApi = {
  "/api": typeof import("app/api/route.ts");
  "/api/auth/[...nextauth]": typeof import("app/api/auth/[...nextauth]/route.ts");
};

type PagesRoutePath = "/404";

type PagesApiPath = "";

type TypeofPagesApi = {

};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
