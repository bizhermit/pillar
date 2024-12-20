// generate by script
// do not edit

type AppRoutePath = "/"
  | "/calendar"
  | "/home"
  | "/project"
  | "/settings"
  | "/sign-in";

type AppApiPath = "/api/auth/[...nextauth]";

type TypeofAppApi = {
  "/api/auth/[...nextauth]": typeof import("src/app/api/auth/[...nextauth]/route.ts");
};

type PagesRoutePath = "";

type PagesApiPath = "";

type TypeofPagesApi = {

};

type PagePath = AppRoutePath | PagesRoutePath;

type TypeofApi = TypeofAppApi & TypeofPagesApi;
