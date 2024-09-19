import { DateTime } from "@/objects/datetime";

const f = (dt: DateTime) => {
  return `${dt.toString()}  / ${dt.getTimezone()}`;
};

const fs = (p: string) => {
  return `${f(new DateTime().set(p))} <- ${p}`;
};

const Page = () => {
  return (
    <div style={{ fontSize: "1.2rem" }}>
      <span>timezone: {new DateTime().getTimezone()}</span>
      <span>{process.env.TZ}</span>
      <ul>
        <li>{f(new DateTime())}</li>
        <li>{f(new DateTime().set(null))}</li>
        <li>{f(new DateTime().set(new Date()))}</li>
        <li>---------------------------</li>
        <li>{f(new DateTime().setTimezone("UTC"))}</li>
        <li>{f(new DateTime().setTimezone("UTC").set(null))}</li>
        <li>{f(new DateTime().setTimezone("UTC").set(new Date()))}</li>
        <li>---------------------------</li>
        <li>{f(new DateTime().setTimezone("America/Los_Angeles"))}</li>
        <li>{f(new DateTime().setTimezone("America/Los_Angeles").set(null))}</li>
        <li>{f(new DateTime().setTimezone("America/Los_Angeles").set(new Date()))}</li>
        <li>---------------------------</li>
        <li>{f(new DateTime("2024-01-23T01:23:45+09:00"))}</li>
        <li>{f(new DateTime("2024-01-23T01:23:45Z"))}</li>
        <li>---------------------------</li>
        <li>{fs("20240913")}</li>
        <li>{fs("20240913T012345")}</li>
        <li>{fs("20240913 012345")}</li>
        <li>{fs("2024/09/03")}</li>
        <li>{fs("2024/9/3")}</li>
        <li>{fs("2024-09-13T01:23:45")}</li>
        <li>{fs("2024-09-13 01:23:45")}</li>
        <li>{fs("2024-9-2 1:23:45")}</li>
        <li>{fs("2024-9-3 1:23:45")}</li>
        <li>{fs("2024/9/3 1:23:45")}</li>
        <li>---------------------------</li>
        <li>{fs("2024-09-13T01:23:45Z")}</li>
        <li>{fs("2024-09-13T01:23:45.010Z")}</li>
        <li>---------------------------</li>
        <li>{fs("2024-09-13T01:23:45+09:00")}</li>
        <li>{fs("2024-09-13T01:23:45+0900")}</li>
        <li>---------------------------</li>
        <li>{fs("2024-09-13T01:23:45-08:30")}</li>
        <li>---------------------------</li>
        <li>json: {JSON.stringify({ d: new Date(), dt: new DateTime() })}</li>
        <li>string: {JSON.stringify({ d: new Date().toString(), dt: new DateTime().toString() })}</li>
        <li>iso: {JSON.stringify({ d: new Date().toISOString(), dt: new DateTime().toISOString() })}</li>
        <li>---------------------------</li>
        <li>{new DateTime().toDateString()}</li>
        <li>{new DateTime().toTimeString()}</li>
      </ul>
    </div>
  );
};

export default Page;
