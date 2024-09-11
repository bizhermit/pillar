declare namespace Api {

  type Message = {
    type: "e" | "w" | "i";
    title?: string;
    body?: string;
  };

  type Methods = "get" | "put" | "post" | "delete";

  type RequestObject = { [v: string]: any };

  type ResponseObject = { [v: string]: any };

  type MethodInterface = {
    req: { [v: string]: any };
    res: { [v: string]: any };
  };

  type Import<T extends TypeofApi> = {
    [P in keyof T]: {
      get: {
        req: P extends keyof TypeofAppApi ? T[P]["GET"]["req"] : T[P]["default"]["GET"]["req"];
        res: P extends keyof TypeofAppApi ? T[P]["GET"]["res"] : T[P]["default"]["GET"]["res"];
      };
      put: {
        req: P extends keyof TypeofAppApi ? T[P]["PUT"]["req"] : T[P]["default"]["PUT"]["req"];
        res: P extends keyof TypeofAppApi ? T[P]["PUT"]["res"] : T[P]["default"]["PUT"]["res"];
      };
      post: {
        req: P extends keyof TypeofAppApi ? T[P]["POST"]["req"] : T[P]["default"]["POST"]["req"];
        res: P extends keyof TypeofAppApi ? T[P]["POST"]["res"] : T[P]["default"]["POST"]["res"];
      };
      delete: {
        req: P extends keyof TypeofAppApi ? T[P]["DELETE"]["req"] : T[P]["default"]["DELETE"]["req"];
        res: P extends keyof TypeofAppApi ? T[P]["DELETE"]["res"] : T[P]["default"]["DELETE"]["res"];
      };
    };
  };

  type Context = Import<TypeofApi>;

  type Request<U extends keyof Context, M extends Methods> =
    Context extends { [P in U]: infer Url } ? (
      Url extends { [P in M]: infer Method } ? (
        Method extends { req: infer Req } ? Req : RequestObject
      ) : RequestObject
    ) : RequestObject;

  type Response<U extends keyof Context, M extends Methods> =
    Context extends { [P in U]: infer Url } ? (
      Url extends { [P in M]: infer Method } ? (
        Method extends { res: infer Res } ? Res : ResponseObject
      ) : ResponseObject
    ) : ResponseObject;

}

type ApiPath = keyof Api.Context;
