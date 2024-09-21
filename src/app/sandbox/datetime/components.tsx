import { DateTime, parseOffsetString, TimeZone } from "@/objects/datetime";

const f = (dt: DateTime) => {
  return `${dt.toString("yyyy/MM/dd hh:mm t")}`;
  // return `${dt.toString("yyyy/MM/dd hh:mm:ss.SSS t")}`;
};

const fs = (p: string, tz?: TimeZone) => {
  return (
    <div>
      <span>{f(new DateTime(p, tz))} &lt;- {p}</span>
      <br />
      <span>{f(new DateTime(null, tz).set(p))} &lt;- {p}</span>
      <br />
      <span>----</span>
    </div>
  );
};

export const DateTimeList = () => {
  return (
    <div>
      <span>env.TZ: {process.env.TZ || "null"}</span>
      <br />
      <span>DateTime timezone: {new DateTime().getTimezone()}</span>
      <br />
      <span>system timezone: {parseOffsetString(new Date().getTimezoneOffset())}</span>
      <h3>create instance</h3>
      <ul>
        <li>{f(new DateTime())}</li>
        <li>{f(new DateTime(null))}</li>
        <li>{f(new DateTime(null, "UTC"))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires"))}</li>
      </ul>
      <h3>after set timezone</h3>
      <ul>
        <li>{f(new DateTime())}</li>
        <li>{f(new DateTime().setTimezone("UTC"))}</li>
        <li>{f(new DateTime().setTimezone("America/Argentina/Buenos_Aires"))}</li>
      </ul>
      <h3>set null</h3>
      <ul>
        <li>{f(new DateTime(0).set(null))}</li>
        <li>{f(new DateTime(0, "UTC").set(null))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(null))}</li>
      </ul>
      <h3>set DateTime</h3>
      <ul>
        <li>{f(new DateTime(0).set(new DateTime()))}</li>
        <li>{f(new DateTime(0).set(new DateTime(null, "UTC")))}</li>
        <li>{f(new DateTime(0).set(new DateTime(null, "America/Argentina/Buenos_Aires")))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime(0, "UTC").set(new DateTime()))}</li>
        <li>{f(new DateTime(0, "UTC").set(new DateTime(null, "UTC")))}</li>
        <li>{f(new DateTime(0, "UTC").set(new DateTime(null, "America/Argentina/Buenos_Aires")))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime()))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime(null, "UTC")))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime(null, "America/Argentina/Buenos_Aires")))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime(), "America/Argentina/Buenos_Aires"))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime(null, "UTC"), "America/Argentina/Buenos_Aires"))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires").set(new DateTime(), "UTC"))}</li>
      </ul>
      <h3>set new Date</h3>
      <ul>
        <li>{Math.floor((new Date().getTime() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} | {new Date().getTimezoneOffset()}</li>
        <li>{f(new DateTime().set(new Date()))}</li>
        <li>{f(new DateTime(new Date()))}</li>
        <li>----</li>
        <li>{f(new DateTime(null, "UTC").set(new Date()))}</li>
        <li>{f(new DateTime(new Date(), "UTC"))}</li>
        <li>----</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(new Date()))}</li>
        <li>{f(new DateTime(new Date(), "America/Argentina/Buenos_Aires"))}</li>
      </ul>
      <h3>set new Date(2024-01-01T00:00:00.000)</h3>
      <ul>
        <li>{Math.floor((new Date("2024-01-01T00:00:00.000").getTime() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} | {new Date("2024-01-01T00:00:00.000Z").getTimezoneOffset()}</li>
        <li>{f(new DateTime().set(new Date("2024-01-01T00:00:00.000")))}</li>
        <li>{f(new DateTime(null, "UTC").set(new Date("2024-01-01T00:00:00.000")))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(new Date("2024-01-01T00:00:00.000")))}</li>
      </ul>
      <h3>set new Date(2024-01-01T00:00:00.000Z)</h3>
      <ul>
        <li>{Math.floor((new Date("2024-01-01T00:00:00.000Z").getTime() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} | {new Date("2024-01-01T00:00:00.000Z").getTimezoneOffset()}</li>
        <li>{f(new DateTime().set(new Date("2024-01-01T00:00:00.000Z")))}</li>
        <li>{f(new DateTime(null, "UTC").set(new Date("2024-01-01T00:00:00.000Z")))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(new Date("2024-01-01T00:00:00.000Z")))}</li>
      </ul>
      <h3>set new Date(2024-01-01T00:00:00.000+09:00)</h3>
      <ul>
        <li>{Math.floor((new Date("2024-01-01T00:00:00.000+09:00").getTime() % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} | {new Date("2024-01-01T00:00:00.000+09:00").getTimezoneOffset()}</li>
        <li>{f(new DateTime().set(new Date("2024-01-01T00:00:00.000+09:00")))}</li>
        <li>{f(new DateTime(null, "UTC").set(new Date("2024-01-01T00:00:00.000+09:00")))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(new Date("2024-01-01T00:00:00.000+09:00")))}</li>
      </ul>
      <h3>set string</h3>
      <ul>
        <li>{fs("2024-12-31T01:23:45.789")}</li>
        <li>{fs("2024-12-31T01:23:45Z")}</li>
        <li>{fs("2024-12-31T01:23:45+09:00")}</li>
        <li>{fs("2024-12-31T01:23:45-03:00")}</li>
        <li>--------------------------------</li>
        <li>{fs("2024-12-31T01:23:45.789", "UTC")}</li>
        <li>{fs("2024-12-31T01:23:45Z", "UTC")}</li>
        <li>{fs("2024-12-31T01:23:45+09:00", "UTC")}</li>
        <li>{fs("2024-12-31T01:23:45-03:00", "UTC")}</li>
        <li>--------------------------------</li>
        <li>{fs("2024-12-31T01:23:45.789", "America/Argentina/Buenos_Aires")}</li>
        <li>{fs("2024-12-31T01:23:45Z", "America/Argentina/Buenos_Aires")}</li>
        <li>{fs("2024-12-31T01:23:45+09:00", "America/Argentina/Buenos_Aires")}</li>
        <li>{fs("2024-12-31T01:23:45-03:00", "America/Argentina/Buenos_Aires")}</li>
      </ul>
      <h3>set number</h3>
      <ul>
        <li>{f(new DateTime(0))}</li>
        <li>{f(new DateTime(0, "UTC"))}</li>
        <li>{f(new DateTime(0, "America/Argentina/Buenos_Aires"))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime().set(0))}</li>
        <li>{f(new DateTime(null, "UTC").set(0))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(0))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000))}</li>
        <li>{f(new DateTime(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000, "UTC"))}</li>
        <li>{f(new DateTime(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000, "America/Argentina/Buenos_Aires"))}</li>
        <li>--------------------------------</li>
        <li>{f(new DateTime().set(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000))}</li>
        <li>{f(new DateTime(null, "UTC").set(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000))}</li>
        <li>{f(new DateTime(null, "America/Argentina/Buenos_Aires").set(12 * 60 * 60 * 1000 + 34 * 60 * 1000 + 56 + 1000))}</li>
      </ul>
      <h3>to string</h3>
      <ul>
        <li>---------------------------</li>
        <li>json: {JSON.stringify({ d: new Date(), dt: new DateTime() })}</li>
        <li>string: {JSON.stringify({ d: new Date().toString(), dt: new DateTime().toString() })}</li>
        <li>iso: {JSON.stringify({ d: new Date().toISOString(), dt: new DateTime().toISOString() })}</li>
        <li>---------------------------</li>
        <li>{new DateTime().toDateString()}</li>
        <li>{new DateTime().toTimeString()}</li>
      </ul>
    </div >
  );
};

