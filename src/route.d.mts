// generate by script
// do not edit

type AppRoutePath = "/";

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
