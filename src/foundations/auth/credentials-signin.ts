import { signIn } from "next-auth/react";
import { convertFormDataToStruct } from "../objects/form-data/convert";

const electron = (global as any).electron;

const credentialsSignIn = async (inputs: FormData | { [v: string | number | symbol]: any } | null | undefined): Promise<{ ok: true; status: number; message?: undefined; } | { ok: false; status: number; message: string; }> => {
  if (electron) {
    const res = await electron.signIn(inputs instanceof FormData ? convertFormDataToStruct(inputs) : inputs);
    // eslint-disable-next-line no-console
    console.log("electron signIn:", res);
    return {
      ok: true,
      status: 200,
    };
  }

  const res = await signIn("credentials", {
    ...(inputs instanceof FormData ? convertFormDataToStruct(inputs) : inputs),
    redirect: false,
  });

  if (res == null || !res.ok) {
    return {
      ok: false,
      ...(() => {
        if (res?.error == null) {
          return {
            status: 401,
            message: "sign-in failed."
          };
        }
        return JSON.parse(res.error);
      })(),
    };
  }

  return {
    ok: true,
    status: 200,
  };
};

export default credentialsSignIn;
